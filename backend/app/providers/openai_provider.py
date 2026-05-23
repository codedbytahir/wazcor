"""
Purpose: Stub for OpenAI-compatible AI providers (Ollama, vLLM, etc).
Ownership: Jules
Safety: Env-ready for local/remote LLM APIs.
"""
from typing import List
from ..schemas.models import Evidence, Verdict, Alert

class OpenAICompatibleProvider:
    def __init__(self, base_url: str, api_key: str = "EMPTY"):
        self.base_url = base_url
        self.api_key = api_key

    def generate_verdict(self, alert: Alert, evidence: List[Evidence]) -> Verdict:
        # TODO: Implement real OpenAI API call
        raise NotImplementedError("OpenAICompatibleProvider not yet fully implemented. Use MockProvider for v1.")
