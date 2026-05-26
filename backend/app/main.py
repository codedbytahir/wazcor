"""
Purpose: Main FastAPI application for WAZCOR.
Ownership: Jules
Safety: Central API hub, dynamic provider selection.
"""
import os
import json
import logging
import uuid
from datetime import datetime
from typing import List, Dict
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from .schemas.models import Alert, Case, Verdict, Feedback, TimelineEvent, Evidence
from .integrations.mock_elastic import MockElasticEvidenceCollector
from .integrations.mongo_memory import MongoCaseMemory
from .providers.factory import get_ai_provider
from .scoring.scoring import ScoringEngine
from .reports.markdown import MarkdownReportGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="WAZCOR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
def get_evidence_collector():
    # Support both EVIDENCE_SOURCE and EVIDENCE_PROVIDER
    source = os.getenv("EVIDENCE_PROVIDER") or os.getenv("EVIDENCE_SOURCE") or "mock"
    if source.lower() == "elastic":
        from .integrations.elastic_collector import ElasticEvidenceCollector
        return ElasticEvidenceCollector()
    return MockElasticEvidenceCollector()

elastic = get_evidence_collector()
memory = MongoCaseMemory()
scorer = ScoringEngine()
reporter = MarkdownReportGenerator()

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/status")
async def status():
    """
    Returns the connectivity and configuration status of backend components.
    """
    # 1. Database status
    db_connected = False
    db_warning = None
    if memory.use_db:
        try:
            # Quick ping
            await memory.client.admin.command('ping')
            db_connected = True
        except Exception as e:
            db_connected = False
            db_warning = f"MongoDB connection failed: {str(e)}"
    else:
        db_warning = "Database not configured or connection failed. Using in-memory fallback (data will be lost on restart)."

    # 2. AI Provider status
    ai_provider_type = os.getenv("AI_PROVIDER", "mock").lower()
    ai_configured = False
    ai_warning = None

    if ai_provider_type == "mock":
        ai_configured = True
    elif ai_provider_type == "gemini":
        ai_configured = bool(os.getenv("GEMINI_API_KEY"))
        if not ai_configured:
            ai_warning = "GEMINI_API_KEY is missing."
    elif ai_provider_type == "openai":
        ai_configured = bool(os.getenv("OPENAI_BASE_URL"))
        if not ai_configured:
            ai_warning = "OPENAI_BASE_URL is missing."
    else:
        ai_warning = f"Unknown AI provider: {ai_provider_type}"

    # 3. Evidence Provider status
    ev_provider_type = (os.getenv("EVIDENCE_PROVIDER") or os.getenv("EVIDENCE_SOURCE") or "mock").lower()
    ev_configured = False
    ev_warning = None

    if ev_provider_type == "mock":
        ev_configured = True
    elif ev_provider_type == "elastic":
        elastic_url = os.getenv("ELASTIC_URL") or os.getenv("ELASTICSEARCH_URL")
        ev_configured = bool(elastic_url)
        if not ev_configured:
            ev_warning = "ELASTIC_URL is missing."
        # Optional: attempt quick ping if configured
        elif hasattr(elastic, 'client') and elastic.client:
            try:
                # Elastic client is synchronous, do not await
                if not elastic.client.ping():
                    ev_configured = False
                    ev_warning = "Elasticsearch ping failed."
            except Exception as e:
                ev_configured = False
                ev_warning = f"Elasticsearch connection error: {str(e)}"
    else:
        ev_warning = f"Unknown evidence source: {ev_provider_type}"

    return {
        "app": {
            "version": os.getenv("APP_VERSION", "1.0.0"),
            "mode": "production" if os.getenv("NODE_ENV") == "production" else "development"
        },
        "database": {
            "connected": db_connected,
            "type": "mongodb" if memory.use_db else "in-memory",
            "warning": db_warning
        },
        "ai_provider": {
            "selected": ai_provider_type,
            "configured": ai_configured,
            "warning": ai_warning
        },
        "evidence_provider": {
            "selected": ev_provider_type,
            "configured": ev_configured,
            "warning": ev_warning
        },
        "timestamp": datetime.now()
    }

@app.post("/ingest/alerts")
async def ingest_alert(alert: Dict = Body(...)):
    """
    Ingest a raw Wazuh alert and store it in MongoDB.
    """
    try:
        # Light validation/normalization
        normalized = {
            "received_at": datetime.now(),
            "alert_id": alert.get("id") or alert.get("_id") or f"raw-{uuid.uuid4().hex[:8]}",
            "timestamp": alert.get("timestamp") or datetime.now().isoformat(),
            "rule": alert.get("rule", {}).get("description") or alert.get("description", "Unknown Rule"),
            "host": alert.get("agent", {}).get("name") or alert.get("host", "unknown"),
            "user": alert.get("data", {}).get("dstuser") or alert.get("data", {}).get("srcuser") or alert.get("user"),
            "src_ip": alert.get("data", {}).get("srcip") or alert.get("src_ip"),
            "raw": alert
        }

        if memory.use_db:
            await memory.db.raw_alerts.insert_one(normalized)
        else:
            # For mock/dev, just log it
            logger.info(f"Ingested alert (in-memory mode): {normalized['alert_id']}")

        return {"status": "success", "alert_id": normalized["alert_id"]}
    except Exception as e:
        logger.error(f"Failed to ingest alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to store alert")

@app.get("/alerts", response_model=List[Alert])
async def get_alerts():
    try:
        # Try relative to backend root first (running locally)
        with open("data/seed_alerts.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        try:
            # Try relative to backend/app (running in container or nested)
            with open("../data/seed_alerts.json", "r") as f:
                return json.load(f)
        except FileNotFoundError:
            # Absolute or root
            with open("app/data/seed_alerts.json", "r") as f:
                return json.load(f)

@app.post("/investigations", response_model=Case)
async def create_investigation(alert_id: str = Body(..., embed=True)):
    # 1. Load alert
    try:
        alerts = await get_alerts()
    except Exception as e:
        logger.error(f"Failed to load alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to load alert queue")

    alert_data = next((a for a in alerts if a["id"] == alert_id), None)
    if not alert_data:
        logger.warning(f"Alert ID {alert_id} not found in queue")
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    try:
        alert = Alert(**alert_data)
    except Exception as e:
        logger.error(f"Alert schema validation error: {e}")
        raise HTTPException(status_code=422, detail="Invalid alert data format")

    # 2. Collect evidence
    evidence = elastic.get_evidence_for_alert(alert_id)

    # 3. Build timeline
    timeline = [
        TimelineEvent(
            timestamp=e.timestamp,
            type=e.type,
            description=e.description,
            evidence_id=e.id
        ) for e in sorted(evidence, key=lambda x: x.timestamp)
    ]

    # 4. Generate verdict
    ai_provider = get_ai_provider()
    try:
        verdict = ai_provider.generate_verdict(alert, evidence)
        # Centralized schema validation
        if not isinstance(verdict, Verdict):
            logger.error(f"Provider returned invalid type: {type(verdict)}")
            raise ValueError("Invalid verdict format from provider")
    except Exception as e:
        logger.error(f"AI Provider failed: {e}")
        # Fail-safe: Create a 'needs_review' verdict manually
        from .providers.mock_provider import MockProvider
        verdict = MockProvider()._needs_review_verdict(
            case_id=f"CASE-ERR-{datetime.now().strftime('%H%M%S')}",
            alert=alert,
            reason=f"AI Provider Error: {str(e)}"
        )

    # 5. Create Case
    warning = None
    if verdict.verdict == "needs_review":
        warning = "Investigation results are inconclusive or provider failed. Manual review required."

    case = Case(
        id=verdict.case_id,
        alert_id=alert_id,
        created_at=datetime.now(),
        verdict=verdict,
        evidence=evidence,
        timeline=timeline,
        warning=warning
    )

    # 6. Store in MongoDB
    await memory.store_case(case)

    return case

@app.get("/cases", response_model=List[Case])
async def get_cases():
    return await memory.get_all_cases()

@app.get("/cases/{case_id}", response_model=Case)
async def get_case(case_id: str):
    case = await memory.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.post("/cases/{case_id}/feedback")
async def add_feedback(case_id: str, feedback: Feedback):
    await memory.add_feedback(case_id, feedback)
    return {"status": "success"}

@app.get("/cases/{case_id}/report")
async def get_report(case_id: str):
    case = await memory.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    report_md = reporter.generate(case)
    return {"report": report_md}
