"""
Purpose: Gemini AI provider for verdict generation.
Ownership: Jules
Safety: Uses Gemini API to reason over evidence and return structured JSON.
"""
import os
import json
import uuid
import logging
import google.generativeai as genai
from typing import List
from ..schemas.models import Evidence, Verdict, Alert, Hypothesis

logger = logging.getLogger(__name__)

class GeminiProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def generate_verdict(self, alert: Alert, evidence: List[Evidence]) -> Verdict:
        case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"

        if not self.api_key or not self.model:
            return self._needs_review_verdict(case_id, alert, "Gemini API key not configured.")

        prompt = self._build_prompt(alert, evidence, case_id)

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )

            data = json.loads(response.text)

            # Ensure case_id is set by backend, not model
            data["case_id"] = case_id

            # Basic validation of critical fields
            return Verdict(**data)
        except Exception as e:
            logger.error(f"Gemini Error: {e}")
            return self._needs_review_verdict(case_id, alert, f"Model error: {str(e)}")

    def _build_prompt(self, alert: Alert, evidence: List[Evidence], case_id: str) -> str:
        evidence_json = json.dumps([e.model_dump() for e in evidence], default=str)
        alert_json = json.dumps(alert.model_dump(), default=str)

        return f"""
You are an expert SOC Analyst. Analyze the following Wazuh Alert and related evidence to provide a structured verdict.

ALERT:
{alert_json}

EVIDENCE:
{evidence_json}

INSTRUCTIONS:
1. Review all evidence.
2. Determine the most likely verdict from: benign, scanner_noise, bruteforce_attempt_only, likely_compromised_account, likely_host_compromise, confirmed_compromise.
3. Assign a confidence score (0-100).
4. Identify relevant entities (host, user, src_ip).
5. Link evidence IDs to the verdict.
6. Test at least two hypotheses (e.g., benign_admin vs actual_compromise).
7. Recommend next actions.
8. Set needs_human_review to true if evidence is contradictory, missing, or low confidence.

Return ONLY a JSON object matching this schema:
{{
  "verdict": "string",
  "confidence": number,
  "entities": {{ "host": "string", "user": "string", "src_ip": "string" }},
  "evidence_ids": ["string"],
  "hypotheses": [ {{ "name": "string", "status": "confirmed|rejected|pending", "reason": "string" }} ],
  "recommended_actions": ["string"],
  "needs_human_review": boolean
}}
"""

    def _needs_review_verdict(self, case_id: str, alert: Alert, reason: str) -> Verdict:
        return Verdict(
            case_id=case_id,
            verdict="needs_review",
            confidence=0,
            entities={
                "host": alert.host,
                "user": alert.user,
                "src_ip": alert.src_ip
            },
            evidence_ids=[],
            hypotheses=[Hypothesis(name="system_error", status="confirmed", reason=reason)],
            recommended_actions=["Manually inspect Wazuh alerts", "Check AI Provider settings"],
            needs_human_review=True
        )
