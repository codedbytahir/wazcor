"""
Purpose: OpenAI-compatible AI provider for verdict generation (Ollama, vLLM, etc).
Ownership: Jules
Safety: Uses OpenAI client to reason over evidence and return structured JSON.
"""
import os
import json
import uuid
import logging
from openai import OpenAI
from typing import List
from ..schemas.models import Evidence, Verdict, Alert, Hypothesis

logger = logging.getLogger(__name__)

class OpenAICompatibleProvider:
    def __init__(self, base_url: str, api_key: str = "EMPTY"):
        self.base_url = base_url
        self.api_key = api_key
        if base_url:
            self.client = OpenAI(base_url=base_url, api_key=api_key)
        else:
            self.client = None

    def generate_verdict(self, alert: Alert, evidence: List[Evidence]) -> Verdict:
        case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"

        if not self.client:
            return self._needs_review_verdict(case_id, alert, "OpenAI base URL not configured.")

        prompt = self._build_prompt(alert, evidence, case_id)

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo", # Default model, usually ignored by Ollama/vLLM if only one model is loaded
                messages=[
                    {"role": "system", "content": "You are an expert SOC Analyst."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )

            content = response.choices[0].message.content
            data = json.loads(content)

            # Ensure case_id is set by backend, not model
            data["case_id"] = case_id

            return Verdict(**data)
        except Exception as e:
            logger.error(f"OpenAI Provider Error: {e}")
            return self._needs_review_verdict(case_id, alert, f"Model error: {str(e)}")

    def _build_prompt(self, alert: Alert, evidence: List[Evidence], case_id: str) -> str:
        evidence_json = json.dumps([e.model_dump() for e in evidence], default=str)
        alert_json = json.dumps(alert.model_dump(), default=str)

        return f"""
Analyze the following Wazuh Alert and related evidence to provide a structured verdict.

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
6. Test at least two hypotheses.
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
