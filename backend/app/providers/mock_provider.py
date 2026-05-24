"""
Purpose: Mock AI provider for verdict generation.
Ownership: Jules
Safety: Deterministic reasoning over evidence. Implements safety rules.
"""
from typing import List
from ..schemas.models import Evidence, Verdict, Hypothesis, Alert
import uuid

class MockProvider:
    def generate_verdict(self, alert: Alert, evidence: List[Evidence]) -> Verdict:
        case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"

        # Safety Rule: If no evidence is provided, it needs review.
        if not evidence:
            return self._needs_review_verdict(case_id, alert, "No evidence provided for investigation.")

        # Simple rule-based logic for the mock
        has_auth_success = any(e.type == "auth" and e.data.get("user") == alert.user for e in evidence)
        has_sudo = any(e.type == "process" and "sudo" in e.data.get("command", "") for e in evidence)
        has_persistence = any(e.type == "persistence" for e in evidence)

        # Safety Rule: Check for contradictory evidence (example: auth success from unknown IP)
        # For v1, we just check if we have the critical evidence for the demo.

        if has_auth_success and has_sudo and has_persistence:
            verdict_str = "likely_host_compromise"
            confidence = 92
            needs_review = False
        elif has_auth_success:
            verdict_str = "likely_compromised_account"
            confidence = 75
            needs_review = False
        else:
            # If we have some evidence but not enough for a clear verdict
            verdict_str = "needs_review"
            confidence = 50
            needs_review = True

        hypotheses = [
            Hypothesis(
                name="benign_admin_activity",
                status="rejected" if has_persistence else "pending",
                reason="Unexpected persistence detected." if has_persistence else "Pending further investigation."
            ),
            Hypothesis(
                name="external_bruteforce",
                status="confirmed" if any(e.type=="auth" for e in evidence) else "pending",
                reason="Verified multiple failed attempts followed by success." if has_auth_success else "Multiple failed attempts detected."
            )
        ]

        return Verdict(
            case_id=case_id,
            verdict=verdict_str,
            confidence=confidence,
            entities={
                "host": alert.host,
                "user": alert.user,
                "src_ip": alert.src_ip
            },
            evidence_ids=[e.id for e in evidence],
            hypotheses=hypotheses,
            recommended_actions=[
                "Isolate host from network",
                "Reset password for user " + (alert.user or "unknown"),
                "Audit authorized_keys for deploy user"
            ],
            needs_human_review=needs_review
        )

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
            recommended_actions=["Manually inspect Wazuh alerts", "Check Elastic connectivity"],
            needs_human_review=True
        )
