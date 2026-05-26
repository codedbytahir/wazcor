"""
Purpose: Factory for AI providers.
Ownership: Jules
Safety: Centralized provider creation and configuration.
"""
import os
from .mock_provider import MockProvider
from .gemini_provider import GeminiProvider
from .openai_provider import OpenAICompatibleProvider

def get_ai_provider():
    provider_type = os.getenv("AI_PROVIDER", "mock").lower()

    if provider_type == "gemini":
        return GeminiProvider(api_key=os.getenv("GEMINI_API_KEY", ""))

    elif provider_type == "openai":
        return OpenAICompatibleProvider(
            base_url=os.getenv("OPENAI_BASE_URL", ""),
            api_key=os.getenv("OPENAI_API_KEY", "EMPTY"),
            model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        )

    return MockProvider()
