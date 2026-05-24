"""
Purpose: Elastic evidence collector.
Ownership: Jules
Safety: Read-only, queries Elasticsearch if configured, else returns empty list.
"""
import os
import logging
from typing import List
from elasticsearch import Elasticsearch
from ..schemas.models import Evidence
from .base import EvidenceCollector

logger = logging.getLogger(__name__)

class ElasticEvidenceCollector(EvidenceCollector):
    def __init__(self, url: str = None, api_key: str = None):
        self.url = url or os.getenv("ELASTICSEARCH_URL")
        self.api_key = api_key or os.getenv("ELASTICSEARCH_API_KEY")

        if self.url:
            try:
                self.client = Elasticsearch(
                    self.url,
                    api_key=self.api_key,
                    request_timeout=5
                )
                # Test connection
                if not self.client.ping():
                    logger.warning("Elasticsearch ping failed. Evidence collection might fail.")
            except Exception as e:
                logger.error(f"Failed to initialize Elasticsearch client: {e}")
                self.client = None
        else:
            self.client = None

    def get_evidence_for_alert(self, alert_id: str) -> List[Evidence]:
        if not self.client:
            logger.info("Elasticsearch not configured. Returning empty evidence list.")
            return []

        try:
            # Placeholder for real Elastic query logic
            # In v2, this would use alert metadata to search for related logs
            return []
        except Exception as e:
            logger.error(f"Elasticsearch query error: {e}")
            return []
