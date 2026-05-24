"""
Purpose: Stub for Gemini AI provider.
Ownership: Jules
Safety: Env-ready for real Gemini API integration.
"""
from typing import List
from ..schemas.models import Evidence, Verdict, Alert

class GeminiProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_verdict(self, alert: Alert, evidence: List[Evidence]) -> Verdict:
        # TODO: Implement real Gemini API call
        raise NotImplementedError("GeminiProvider not yet fully implemented. Use MockProvider for v1.")
