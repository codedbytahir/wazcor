#!/bin/bash
# Purpose: WAZCOR End-to-End Verification Script
# Ownership: Jules
# Safety: Runs safe API checks against the backend.

set -e

if ! command -v jq &> /dev/null
then
    echo "Error: jq is not installed. Please install jq to run this script."
    exit 1
fi

BACKEND_URL=${1:-"http://localhost:8000"}

echo "--- WAZCOR E2E VERIFICATION ---"

echo "[1/5] Checking Health..."
curl -s "$BACKEND_URL/health" | grep -q "healthy" && echo "  OK" || (echo "  FAILED" && exit 1)

echo "[2/5] Checking Alerts..."
ALERTS=$(curl -s "$BACKEND_URL/alerts")
echo "$ALERTS" | grep -q "SSH brute force" && echo "  OK" || (echo "  FAILED" && exit 1)

echo "[3/5] Starting Investigation..."
CASE_JSON=$(curl -s -X POST "$BACKEND_URL/investigations" -H "Content-Type: application/json" -d '{"alert_id": "alert-001"}')
CASE_ID=$(echo "$CASE_JSON" | jq -r '.id')

if [ -n "$CASE_ID" ] && [ "$CASE_ID" != "null" ]; then
    echo "  OK (Case ID: $CASE_ID)"
else
    echo "  FAILED (Full response: $CASE_JSON)"
    exit 1
fi

echo "[4/5] Checking Case Detail..."
curl -s "$BACKEND_URL/cases/$CASE_ID" | grep -q "$CASE_ID" && echo "  OK" || (echo "  FAILED" && exit 1)

echo "[5/5] Checking Report Export..."
curl -s "$BACKEND_URL/cases/$CASE_ID/report" | grep -q "report" && echo "  OK" || (echo "  FAILED" && exit 1)

echo "--- ALL CHECKS PASSED ---"
