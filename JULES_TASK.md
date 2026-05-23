<!-- Purpose: End-to-end coding task for Google Jules to build WAZCOR testable vertical slice. -->
<!-- Audience: autonomous coding agent implementing the first working product flow. -->
<!-- Rule: build mock-first, testable today, with clean seams for Elastic/Gemini/MongoDB real integrations. -->

# Jules Task: Build WAZCOR End-to-End Testable Slice

## Goal

Build a working WAZCOR vertical slice that can be tested locally today.

```text
Alert queue -> click Investigate -> backend collects seeded evidence -> verdict generated -> case stored -> dashboard shows timeline/evidence/verdict -> feedback saved -> report exported
```

Use existing docs:

```text
Architecture.md
Agent.md
SPECS.md
Progress.md
```

## Stack

```text
frontend: Next.js + TypeScript + Tailwind
backend: Python FastAPI + Pydantic
memory: MongoDB via docker-compose
mock evidence: local JSON seed data
model: MockProvider by default, GeminiProvider stub/env-ready
future search: ElasticEvidenceCollector interface, mock implementation now
```

Do not build Go Bridge Lite today. Add only a placeholder folder/readme if needed.

## Required Repo Structure

```text
frontend/
  package.json
  app/
  components/
  lib/
backend/
  requirements.txt
  app/
    main.py
    schemas/
    integrations/
    providers/
    scoring/
    reports/
    data/
bridge-lite/
  README.md
data/
  seed_alerts.json
  seed_evidence.json
  seed_memory.json
docker-compose.yml
.env.example
README.md
```

## Backend Requirements

Create FastAPI endpoints:

```text
GET  /health
GET  /alerts
POST /investigations
GET  /cases
GET  /cases/{case_id}
POST /cases/{case_id}/feedback
GET  /cases/{case_id}/report
```

Implement these modules:

```text
schemas: Alert, Evidence, TimelineEvent, Case, Verdict, Feedback
integrations/mock_elastic.py: returns seeded Wazuh/evidence events
integrations/mongo_memory.py: stores cases and feedback
providers/mock_provider.py: returns valid verdict JSON from evidence
providers/gemini_provider.py: stub/env-ready, not required to work without keys
scoring/scoring.py: deterministic score from evidence patterns
reports/markdown.py: export Markdown report
```

Default mode must work without Gemini, Elastic, or Wazuh credentials.

## Frontend Requirements

Create pages:

```text
/                 redirect or dashboard
/dashboard        product overview cards
/alerts           alert queue with Investigate button
/cases            case list
/cases/[id]       case detail with timeline/evidence/verdict/feedback/report
/settings         provider/status page
```

Visual design:

```text
neon green + metallic dark
not chatbot-first
SOC dashboard feel
evidence cards and timeline must be easy to read
```

## Demo Data

Seed one strong case:

```text
SSH brute force -> successful login -> sudo -> authorized_keys modified -> cron persistence -> outbound connection
```

Expected result:

```text
verdict: likely_host_compromise
confidence: 85-95
```

Also seed one lower-risk alert if time:

```text
brute force only, no successful login -> verdict bruteforce_attempt_only or needs_review
```

## Investigation Logic

When `POST /investigations` receives `{ "alert_id": "..." }`:

```text
1. Load alert.
2. Extract host, user, src_ip, timestamp.
3. Collect related evidence from mock collector.
4. Build sorted timeline.
5. Score evidence deterministically.
6. Ask MockProvider to produce verdict JSON.
7. Validate verdict JSON with Pydantic.
8. Store case in MongoDB.
9. Return case_id and case summary.
```

## Safety Rules

```text
No destructive actions.
No shell execution on hosts.
No real firewall/user changes.
No secrets in code.
No frontend direct DB/model access.
All conclusions must reference evidence IDs.
If evidence missing, return needs_review.
```

## Local Run Target

`docker compose up --build` should start:

```text
frontend: http://localhost:3000
backend:  http://localhost:8000
mongo:    localhost:27017
```

Also support manual run:

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

## End-of-Day Acceptance Test

A human can:

```text
1. Open http://localhost:3000
2. Go to Alerts
3. Click Investigate on SSH alert
4. Land on case page
5. See verdict, confidence, timeline, evidence cards, hypotheses, actions
6. Submit feedback
7. Export Markdown report
8. Refresh page and case still exists in MongoDB
```

## Update Progress

After implementation, update `Progress.md` with:

```text
Date:
Agent: Jules
Changed:
Tests:
Blocked:
Next:
```
