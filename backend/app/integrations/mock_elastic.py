"""
Purpose: Mock Elastic evidence collector.
Ownership: Jules
Safety: Read-only, returns seeded data for the vertical slice.
"""
import json
from typing import List
from ..schemas.models import Evidence
from .base import EvidenceCollector

class MockElasticEvidenceCollector(EvidenceCollector):
    def __init__(self, seed_file: str = "../data/seed_evidence.json"):
        self.seed_file = seed_file
        try:
            with open(self.seed_file, "r") as f:
                self.evidence_data = json.load(f)
        except FileNotFoundError:
            # Fallback if running from different dir
            with open("data/seed_evidence.json", "r") as f:
                self.evidence_data = json.load(f)

    def get_evidence_for_alert(self, alert_id: str) -> List[Evidence]:
        # In a real app, this would query Elastic based on alert entities
        # For the mock, we just return all seeded evidence for the SSH demo
        return [Evidence(**e) for e in self.evidence_data]
