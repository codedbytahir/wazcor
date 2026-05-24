"""
Purpose: Main FastAPI application for WAZCOR.
Ownership: Jules
Safety: Central API hub, dynamic provider selection.
"""
import os
import json
import logging
from datetime import datetime
from typing import List
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from .schemas.models import Alert, Case, Verdict, Feedback, TimelineEvent, Evidence
from .integrations.mock_elastic import MockElasticEvidenceCollector
from .integrations.mongo_memory import MongoCaseMemory
from .providers.mock_provider import MockProvider
from .providers.gemini_provider import GeminiProvider
from .providers.openai_provider import OpenAICompatibleProvider
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
    if os.getenv("EVIDENCE_SOURCE", "mock").lower() == "elastic":
        from .integrations.elastic_collector import ElasticEvidenceCollector
        return ElasticEvidenceCollector()
    return MockElasticEvidenceCollector()

elastic = get_evidence_collector()
memory = MongoCaseMemory()
scorer = ScoringEngine()
reporter = MarkdownReportGenerator()

def get_ai_provider():
    provider_type = os.getenv("AI_PROVIDER", "mock").lower()
    if provider_type == "gemini":
        return GeminiProvider(api_key=os.getenv("GEMINI_API_KEY", ""))
    elif provider_type == "openai":
        return OpenAICompatibleProvider(
            base_url=os.getenv("OPENAI_BASE_URL", ""),
            api_key=os.getenv("OPENAI_API_KEY", "EMPTY")
        )
    return MockProvider()

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now()}

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
    verdict = ai_provider.generate_verdict(alert, evidence)

    # 5. Create Case
    case = Case(
        id=verdict.case_id,
        alert_id=alert_id,
        created_at=datetime.now(),
        verdict=verdict,
        evidence=evidence,
        timeline=timeline
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
