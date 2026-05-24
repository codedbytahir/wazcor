"""
Purpose: Backend tests for WAZCOR API with mocked MongoDB.
Ownership: Jules
Safety: Verifies API correctness using a test client.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock
import app.main as main
from app.schemas.models import Case

# Mock MongoCaseMemory before importing app
mock_memory = MagicMock()
mock_memory.store_case = AsyncMock()
mock_memory.get_case = AsyncMock()
mock_memory.get_all_cases = AsyncMock(return_value=[])
mock_memory.add_feedback = AsyncMock()

main.memory = mock_memory

client = TestClient(main.app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_alerts():
    response = client.get("/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_investigation_flow():
    # 1. Start investigation
    response = client.post("/investigations", json={"alert_id": "alert-001"})
    assert response.status_code == 200
    case_data = response.json()
    assert "id" in case_data
    case_id = case_data["id"]

    # Mock get_case to return the created case as a Pydantic model
    mock_memory.get_case.return_value = Case(**case_data)

    # 2. Get case
    response = client.get(f"/cases/{case_id}")
    assert response.status_code == 200
    assert response.json()["id"] == case_id

    # 3. Add feedback
    feedback = {"analyst_id": "TEST", "rating": 5, "comment": "Good catch"}
    response = client.post(f"/cases/{case_id}/feedback", json=feedback)
    assert response.status_code == 200

    # 4. Get report
    response = client.get(f"/cases/{case_id}/report")
    assert response.status_code == 200
    assert "report" in response.json()
    assert case_id in response.json()["report"]
    assert "Likely Host Compromise" in response.json()["report"]

def test_investigation_invalid_alert():
    response = client.post("/investigations", json={"alert_id": "non-existent"})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_get_case_not_found():
    mock_memory.get_case.return_value = None
    response = client.get("/cases/CASE-NOT-EXIST")
    assert response.status_code == 404

def test_get_report_not_found():
    mock_memory.get_case.return_value = None
    response = client.get("/cases/CASE-NOT-EXIST/report")
    assert response.status_code == 404
