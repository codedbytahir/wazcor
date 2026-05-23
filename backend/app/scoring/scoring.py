"""
Purpose: Deterministic scoring engine for security evidence.
Ownership: Jules
Safety: Uses pattern matching to score risk.
"""
from typing import List
from ..schemas.models import Evidence

class ScoringEngine:
    def calculate_score(self, evidence: List[Evidence]) -> float:
        score = 0.0
        weights = {
            "network": 10,
            "auth": 20,
            "process": 15,
            "file": 15,
            "persistence": 40
        }

        for e in evidence:
            score += weights.get(e.type, 5)

        return min(score, 100.0)
