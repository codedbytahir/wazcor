<!-- Purpose: Operating rules for AI coding agents working on WAZCOR. -->
<!-- Audience: autonomous coding agents, pair programmers, and maintainers. -->
<!-- Rule: build small, verify often, update Progress.md after every meaningful change. -->

# WAZCOR Agent Guide

## 1. Mission

Build WAZCOR as a real lightweight SOC investigation product, not a throwaway demo. The product must connect Wazuh-style alerts, Elastic investigation search, MongoDB case memory, and Gemini/local AI verdict generation.

## 2. Non-Negotiables

```text
Product name: WAZCOR
Primary track: Elastic
Secondary memory: MongoDB
Default AI for hackathon: Gemini
Local AI support: OpenAI-compatible provider for Ollama/vLLM/llama.cpp/LiteLLM
Theme: neon green + metallic dark + neural expressive design
No destructive SOC actions in v1
```

## 3. Coding Rules

- Keep code simple, typed, and testable.
- Prefer small modules over giant files.
- Put a 3-line top comment/docstring in each source file explaining purpose, ownership, and safety assumptions.
- Do not add noisy comments. Comment only where intent is not obvious.
- Use Pydantic schemas for API and model outputs.
- Validate every model JSON response before storing it.
- Never put secrets in code, frontend, logs, screenshots, or seed data.
- Use environment variables with `.env.example` for config names only.
- Keep all external integrations behind interfaces so they can be mocked.

## 4. Architecture Rules

- The backend orchestrates the investigation steps deterministically.
- The model reasons over an evidence package; it must not invent evidence.
- Elastic tools are the source of live security evidence.
- MongoDB is the source of case memory and analyst feedback.
- The frontend never talks directly to Elastic, MongoDB, Wazuh, or model APIs.
- The optional Wazuh Bridge Lite is read-only and outbound-only.

## 5. If You Are Confused

1. Read `SPECS.md`, then `Architecture.md`, then current `Progress.md`.
2. Inspect existing files before creating new ones.
3. Choose the smallest safe implementation that matches the architecture.
4. If a product decision is ambiguous, write the question in `Progress.md` under `Open Questions` and continue with the safest assumption.
5. Do not invent undocumented behavior for Wazuh, Elastic, MongoDB, Google, or local model runtimes.

## 6. Work Loop

For every task:

```text
1. Plan the change briefly.
2. Edit the smallest set of files.
3. Run relevant tests or static checks.
4. Update Progress.md with what changed, tests run, and next step.
5. Stop if a security/integration assumption is unsafe.
```

## 7. Required Interfaces

Implement integrations behind these concepts:

```text
AlertRepository
EvidenceCollector
CaseMemory
ModelProvider
ScoringEngine
ReportGenerator
AuditLogger
```

Provider names:

```text
GeminiProvider
OpenAICompatibleProvider
ElasticEvidenceCollector
MongoCaseMemory
WazuhBridgeClient
```

## 8. Model Rules

- Gemini is the default model for hackathon demos.
- Local AI mode must work through OpenAI-compatible endpoints.
- Do not rely on local model tool calling for core evidence collection.
- Use strict JSON schemas and retry once or twice if the model returns invalid JSON.
- If the model cannot produce valid output, mark the verdict as `needs_review`.

## 9. UI Rules

- Use dark metallic backgrounds and neon green accents.
- Build for SOC analysts: dense but readable, fast, evidence-first.
- Avoid generic chatbot layouts as the main UI.
- Primary pages: Dashboard, Alert Queue, Case View, SOC Memory, Settings.
- Every verdict must show evidence IDs, timeline, score reasons, and feedback buttons.

## 10. Safety Rules

Forbidden in v1:

```text
automatic endpoint isolation
automatic user disablement
automatic firewall changes
deleting files
executing shell commands on customer hosts
sending raw secrets to any model
```

Allowed in v1:

```text
search evidence
create cases
store reports
recommend actions
record analyst feedback
simulate containment in demo data
```

## 11. Testing Rules

Minimum tests:

```text
schema validation tests
scoring tests
mock Elastic collector tests
mock Mongo memory tests
model provider parsing tests
one end-to-end seeded SSH compromise investigation
```

Before claiming done, verify:

```text
frontend starts
backend starts
seed data loads
investigation runs
verdict is valid JSON
evidence IDs are cited
case is stored
Progress.md updated
```

## 12. Progress Tracking

Every agent must update `Progress.md` after meaningful changes using:

```text
Date:
Agent:
Changed:
Tests:
Blocked:
Next:
```
