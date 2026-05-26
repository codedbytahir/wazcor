"""
Purpose: Elastic evidence collector.
Ownership: Jules
Safety: Read-only, queries Elasticsearch if configured, else returns empty list.
"""
import os
import logging
from typing import List
import uuid
from datetime import datetime, timedelta
from elasticsearch import Elasticsearch
from ..schemas.models import Evidence
from .base import EvidenceCollector

logger = logging.getLogger(__name__)

class ElasticEvidenceCollector(EvidenceCollector):
    def __init__(self, url: str = None, api_key: str = None):
        self.url = url or os.getenv("ELASTICSEARCH_URL")
        self.api_key = api_key or os.getenv("ELASTICSEARCH_API_KEY")
        self.index = os.getenv("ELASTIC_ALERT_INDEX", "wazuh-alerts-*")

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
            logger.error("Elasticsearch not configured. Check ELASTICSEARCH_URL.")
            return []

        try:
            # 1. Fetch the original alert to get context
            alert_resp = self.client.get(index=self.index, id=alert_id)
            if not alert_resp.get("found"):
                logger.warning(f"Alert {alert_id} not found in {self.index}")
                return []

            alert_source = alert_resp["_source"]
            agent_id = alert_source.get("agent", {}).get("id")

            if not agent_id:
                logger.warning(f"Alert {alert_id} has no agent.id, cannot search related evidence.")
                return []

            # 2. Search for related events on the same agent within a time window
            # For simplicity, search +/- 5 minutes
            alert_time = datetime.fromisoformat(alert_source["timestamp"].replace("Z", "+00:00"))
            start_time = (alert_time - timedelta(minutes=5)).isoformat()
            end_time = (alert_time + timedelta(minutes=5)).isoformat()

            query = {
                "bool": {
                    "must": [
                        {"term": {"agent.id": agent_id}}
                    ],
                    "filter": [
                        {"range": {"timestamp": {"gte": start_time, "lte": end_time}}}
                    ]
                }
            }

            search_resp = self.client.search(
                index=self.index,
                query=query,
                size=50,
                sort=[{"timestamp": "asc"}]
            )

            evidence = []
            for hit in search_resp["hits"]["hits"]:
                src = hit["_source"]

                # Determine evidence type based on rule groups or metadata
                rule_groups = src.get("rule", {}).get("groups", [])
                ev_type = "other"
                if "authentication_failed" in rule_groups or "authentication_success" in rule_groups:
                    ev_type = "auth"
                elif "syslog" in rule_groups:
                    ev_type = "process"

                evidence.append(Evidence(
                    id=f"ev-el-{hit['_id'][:8]}",
                    alert_id=alert_id,
                    timestamp=datetime.fromisoformat(src["timestamp"].replace("Z", "+00:00")),
                    type=ev_type,
                    source="elastic",
                    description=src.get("rule", {}).get("description", "Related activity"),
                    data=src
                ))

            return evidence

        except Exception as e:
            logger.error(f"Elasticsearch query error for alert {alert_id}: {e}")
            return []
