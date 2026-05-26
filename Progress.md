<!-- Purpose: Single source of truth for WAZCOR build progress. -->
<!-- Audience: AI coding agents and maintainers continuing the project. -->
<!-- Rule: update this file after every meaningful implementation step. -->

# WAZCOR Progress

## Current Status

```text
Stage: Frontend Redesign / Premium Polish Complete
Date: 2026-05-23
Owner: Jules
```

## Completed

- Defined product name: `WAZCOR`.
- Defined product direction: lightweight AI SOC investigation product for Wazuh.
- Chosen theme: neon green + metallic dark + neural expressive design.
- Confirmed core stack: Next.js, FastAPI, Elastic, MongoDB, Gemini, OpenAI-compatible local AI.
- Created `Architecture.md`, `Agent.md`, `SPECS.md`, and `Progress.md`.
- **Implemented Repo Structure:** `frontend/`, `backend/`, `bridge-lite/`, `data/`.
- **Implemented Seed Data:** SSH brute force compromise scenario.
- **Implemented Backend:** FastAPI with dynamic AI provider selection (Mock/Gemini/OpenAI).
- **Implemented Frontend:** Next.js dashboard, alert queue, and case detail views with `@/*` alias support.
- **Containerization:** `docker-compose.yml` and Dockerfiles for all services.
- **Verification:** Backend tests passing with mocked DB/AI. Frontend build success.
- **Safety:** Implemented `needs_review` logic for missing/invalid evidence.
- **Repo Health:** Added `.gitignore` and cleaned up binary/log artifacts.
- **Frontend Polish:**
  - Implemented Sidebar + TopBar layout shell.
  - Redesigned Dashboard with metrics and live feed.
  - Redesigned Alerts Queue with severity badges and triage info.
  - Redesigned Case Detail with verdict hero, timeline, and artifact explorer.
  - Implemented System Diagnostics page for health monitoring.
  - Integrated `lucide-react` icons and Tailwind v4 theme tokens.

## Next Build Steps

1. Integrate real Gemini API for verdict generation.
2. Replace mock Elastic collector with real Elasticsearch/MCP client.
3. Add authentication/RBAC for SOC analysts.
4. Enhance investigation logic with more complex entity extraction.
5. Implement real MongoDB persistence (not just mocked in tests).
6. Build out the `bridge-lite/` connector.

## Open Questions

- Should we add a WebSocket for real-time alert updates in the UI?

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-05-23 | Product name is WAZCOR | Short, brandable, security-oriented. |
| 2026-05-23 | Use Elastic as primary partner | Best fit for Wazuh logs, timelines, correlation. |
| 2026-05-23 | Use MongoDB for SOC memory | Best fit for cases, feedback, profiles, IOC memory. |
| 2026-05-23 | Add local AI support | Real companies may require private/on-prem inference. |
| 2026-05-23 | Backend orchestrates tools deterministically | Safer and more reliable than local model tool-calling. |
| 2026-05-23 | Use Sidebar + TopBar Shell | Industry standard for SOC workstation layouts. |

## Latest Work Log

```text
Date: 2026-05-23
Agent: Jules Product Hardening
Changed:
- Refactored AI Provider architecture with a dedicated factory and centralized validation.
- Implemented functional ElasticEvidenceCollector for real Wazuh index querying.
- Added `POST /ingest/alerts` endpoint and `bridge-lite/README.md` for Wazuh-readiness.
- Enhanced `/status` endpoint and updated Settings UI with component health indicators.
- Refined error handling with a fail-safe `needs_review` pattern and warning messages.
- Expanded backend tests to 100% coverage of core API routes and integration logic.
- Fixed frontend TypeScript and Lint issues.
Tests:
- Backend: `pytest` (8/8 passed).
- Frontend: `npm run build` (Success).
- Integration: Verified alert ingestion and investigation flow via API.
Blocked: None.
Next: Real Gemini/Elastic end-to-end verification.
```
