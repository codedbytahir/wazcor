"""
Purpose: Base interface for evidence collection.
Ownership: Jules
Safety: Read-only abstract base class for all evidence collectors.
"""
from abc import ABC, abstractmethod
from typing import List
from ..schemas.models import Evidence

class EvidenceCollector(ABC):
    @abstractmethod
    def get_evidence_for_alert(self, alert_id: str) -> List[Evidence]:
        """
        Retrieves related evidence for a given alert_id.
        """
        pass
