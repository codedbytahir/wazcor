<!-- Purpose: Compact product specification for WAZCOR. -->
<!-- Audience: builders, judges, and product reviewers. -->
<!-- Rule: product must feel production-shaped while staying hackathon-buildable. -->

# WAZCOR Product Specs

## 1. One-Line Pitch

WAZCOR is a lightweight AI SOC investigation product that turns Wazuh alerts into evidence-backed verdicts using Elastic for live investigation, MongoDB for memory, and Gemini or local open-source AI for reasoning.

## 2. Product Goal

Compress the first 30 minutes of SOC alert investigation into a 60-second evidence-backed case.

## 3. Users

| User | Needs |
|---|---|
| SOC Analyst | Fast verdict, timeline, evidence, next actions. |
| SOC Manager | Reduced triage load, audit trail, consistent decisions. |
| Detection Engineer | Evidence patterns, noisy rules, missed detection clues. |
| Security Admin | Safe install, least-privilege access, local AI option. |

## 4. Main Product Pieces

```text
WAZCOR Web Dashboard
WAZCOR FastAPI Backend
AI Investigation Orchestrator
Model Gateway: Gemini + OpenAI-compatible local AI
Elastic Evidence Layer
MongoDB SOC Memory
Optional Wazuh Bridge Lite
```

## 5. Core Features

### Must Ship

```text
alert queue
case view
Elastic evidence collection
MongoDB case memory
AI verdict generation
hypothesis testing
confidence scoring
evidence timeline
evidence cards
analyst feedback
report export
AI provider settings
seeded demo data
```

### Should Ship

```text
SOC memory search
audit log
settings page
local Ollama mode
simulated Wazuh Bridge Lite config
one-click demo reset
```

### Later

```text
real containment approvals
Slack/Jira/TheHive integrations
enterprise SSO/RBAC
detection rule generation
full air-gapped installer
```

## 6. Primary Demo Scenario

```text
SSH brute force -> successful login -> sudo -> authorized_keys modified -> cron persistence -> outbound connection
```

Expected verdict:

```text
likely_host_compromise
confidence: 85-95
```

## 7. Verdict Types

```text
benign
scanner_noise
bruteforce_attempt_only
needs_review
likely_compromised_account
likely_host_compromise
confirmed_compromise
```

## 8. Evidence Requirements

Every verdict must include:

```text
case_id
verdict
confidence
entities: host, user, src_ip, time window
timeline
evidence_ids
score reasons
hypothesis results
recommended actions
needs_human_review flag
```

The model may explain evidence but cannot create evidence. If evidence is missing, return `needs_review`.

## 9. UI Pages

| Page | Purpose |
|---|---|
| Dashboard | SOC overview, open cases, investigation stats. |
| Alert Queue | Select Wazuh alerts for investigation. |
| Case View | Plan, tool calls, timeline, evidence, verdict, feedback. |
| SOC Memory | Search previous cases, users, hosts, IOCs. |
| Settings | Elastic, MongoDB, Wazuh, AI provider, privacy mode. |
| Reports | Export Markdown/JSON incident reports. |

## 10. Visual Design

Theme: neon green + metallic dark + neural expressive design.

```text
Background: dark metallic panels
Accent: neon green
Typography: clean, modern, high contrast
UX: operational SOC dashboard, not chatbot-first
Animations: subtle glow, scan lines, neural graph accents only where useful
```

## 11. Install Modes

### Hackathon / SaaS

```text
Frontend + backend on Cloud Run
Gemini model provider
Elastic Cloud or seeded Elastic data
MongoDB Atlas
```

### Hybrid Customer

```text
WAZCOR cloud UI/API
customer Elastic queried with read-only key
MongoDB Atlas or customer MongoDB
optional redaction before model calls
```

### Fully Local

```text
WAZCOR UI/API in Docker
local Elastic/OpenSearch
local MongoDB
Ollama/vLLM/llama.cpp via OpenAI-compatible endpoint
optional Wazuh Bridge Lite
```

## 12. Local AI Support

WAZCOR must support:

```text
GeminiProvider
OpenAICompatibleProvider
```

OpenAI-compatible provider must work with:

```text
Ollama:    http://localhost:11434/v1
vLLM:      http://localhost:8000/v1
llama.cpp: http://localhost:8080/v1
LiteLLM:   http://localhost:4000/v1
```

Backend collects evidence first, then calls the model. Do not rely on local-model tool calling for investigation correctness.

## 13. Security Requirements

```text
read-only Elastic investigation keys
backend-only secrets
no destructive actions in v1
no raw credentials sent to models
model redaction mode
all conclusions cite evidence IDs
audit all tool calls and verdicts
```

## 14. Acceptance Criteria

A complete v1 is ready when:

```text
user can open alert queue
user can investigate a seeded Wazuh alert
Elastic evidence tools return related events
MongoDB returns or stores case memory
AI returns valid verdict JSON
UI shows timeline, evidence cards, hypotheses, score, verdict
analyst can submit feedback
report export works
provider can switch between Gemini and OpenAI-compatible local endpoint
Progress.md is current
```
