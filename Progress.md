<!-- Purpose: Single source of truth for WAZCOR build progress. -->
<!-- Audience: AI coding agents and maintainers continuing the project. -->
<!-- Rule: update this file after every meaningful implementation step. -->

# WAZCOR Progress

## Current Status

```text
Stage: Product architecture and agent guidance prepared
Date: 2026-05-23
Owner: Planning agent
```

## Completed

- Defined product name: `WAZCOR`.
- Defined product direction: lightweight AI SOC investigation product for Wazuh.
- Chosen theme: neon green + metallic dark + neural expressive design.
- Confirmed core stack: Next.js, FastAPI, Elastic, MongoDB, Gemini, OpenAI-compatible local AI.
- Confirmed local AI support path: Ollama first, vLLM/llama.cpp/LiteLLM through generic provider.
- Researched Wazuh alerts, Wazuh index patterns, Wazuh API auth, Elastic MCP, MongoDB MCP, Google MCP/ADK, Ollama, vLLM, llama.cpp, LiteLLM.
- Created `Architecture.md`.
- Created `Agent.md`.
- Created `SPECS.md`.
- Created `Progress.md`.

## Next Build Steps

1. Create repo structure.
2. Create `.env.example`.
3. Build FastAPI skeleton.
4. Build Next.js dashboard shell.
5. Add seed Wazuh/Elastic/MongoDB data.
6. Implement schemas for alerts, evidence, cases, verdicts.
7. Implement mock Elastic evidence collector.
8. Implement MongoDB case memory.
9. Implement scoring engine.
10. Implement GeminiProvider and OpenAICompatibleProvider.
11. Build investigation endpoint.
12. Build alert queue and case view UI.
13. Add report export.
14. Add tests.

## Open Questions

- Should the first UI implementation be Next.js immediately or Streamlit for a faster prototype?
- Will Elastic MCP be available in the development environment, or should direct Elasticsearch client be used as a local fallback?
- Will MongoDB writes use direct driver only, or should selected writes also be exposed through MongoDB MCP?
- Which exact Gemini model will be used for the hackathon demo?

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-05-23 | Product name is WAZCOR | Short, brandable, security-oriented. |
| 2026-05-23 | Use Elastic as primary partner | Best fit for Wazuh logs, timelines, correlation. |
| 2026-05-23 | Use MongoDB for SOC memory | Best fit for cases, feedback, profiles, IOC memory. |
| 2026-05-23 | Add local AI support | Real companies may require private/on-prem inference. |
| 2026-05-23 | Backend orchestrates tools deterministically | Safer and more reliable than local model tool-calling. |

## Work Log Template

```text
Date:
Agent:
Changed:
Tests:
Blocked:
Next:
```

## Latest Work Log

```text
Date: 2026-05-23
Agent: Planning agent
Changed: Created architecture, agent rules, product specs, and progress tracker.
Tests: Documentation files written successfully.
Blocked: No codebase exists yet.
Next: Scaffold backend/frontend and seed data.
```
