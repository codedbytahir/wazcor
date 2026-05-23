/*
Purpose: API client for WAZCOR frontend.
Ownership: Jules
Safety: Type-safe backend calls.
*/
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  return res.json();
}

export async function createInvestigation(alertId: string) {
  const res = await fetch(`${API_BASE}/investigations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alert_id: alertId }),
  });
  return res.json();
}

export async function fetchCases() {
  const res = await fetch(`${API_BASE}/cases`);
  return res.json();
}

export async function fetchCase(caseId: string) {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  return res.json();
}

export async function submitFeedback(caseId: string, feedback: any) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedback),
  });
  return res.json();
}

export async function fetchReport(caseId: string) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/report`);
  return res.json();
}
