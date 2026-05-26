"""
Purpose: Pydantic schemas for WAZCOR API.
Ownership: Jules
Safety: Strict validation of model and integration outputs.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class Alert(BaseModel):
    id: str
    timestamp: datetime
    rule_id: str
    description: str
    severity: int
    host: str
    user: Optional[str] = None
    src_ip: Optional[str] = None

class Evidence(BaseModel):
    id: str
    alert_id: Optional[str] = None
    timestamp: datetime
    type: str # network, auth, process, file, persistence
    source: str # wazuh, elastic
    description: str
    data: Dict[str, Any]

class TimelineEvent(BaseModel):
    timestamp: datetime
    type: str
    description: str
    evidence_id: str

class Hypothesis(BaseModel):
    name: str
    status: str # pending, confirmed, rejected
    reason: str

class Verdict(BaseModel):
    case_id: str
    verdict: str
    confidence: int
    entities: Dict[str, Any]
    evidence_ids: List[str]
    hypotheses: List[Hypothesis]
    recommended_actions: List[str]
    needs_human_review: bool

class Feedback(BaseModel):
    analyst_id: str
    rating: int # 1-5
    comment: str

class Case(BaseModel):
    id: str
    alert_id: str
    created_at: datetime
    verdict: Verdict
    evidence: List[Evidence]
    timeline: List[TimelineEvent]
    feedback: Optional[Feedback] = None
    warning: Optional[str] = None
