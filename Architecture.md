<!-- Purpose: Architecture guide for AI coding agents building WAZCOR. -->
<!-- Audience: engineers and agents connecting Wazuh, Elastic, MongoDB, Gemini, and local AI. -->
<!-- Rule: keep implementation lightweight, evidence-first, and safe-by-default. -->

# WAZCOR Architecture

WAZCOR is a lightweight SOC investigation product for Wazuh environments. It turns Wazuh alerts into evidence-backed investigation cases using Elastic for live log search, MongoDB for case memory, and a switchable AI model gateway for Gemini or local open-source models.

## 1. Product Shape

```text
WAZCOR Web Dashboard
WAZCOR API / Agent Orchestrator
WAZCOR Model Gateway
Elastic Investigation Layer
MongoDB SOC Memory Layer
Optional Wazuh Bridge Lite
```

## 2. Core Stack

| Layer | Choice | Reason |
|---|---|---|
| Web app | Next.js + Tailwind + shadcn/ui | Product-quality dashboard in one week. |
| API | Python FastAPI | Fast agent orchestration, validation, integrations. |
| Agent workflow | Deterministic Python orchestrator + Gemini/local model provider | Reliable tool flow; model only reasons over evidence. |
| Hackathon AI | Gemini via Google Cloud / ADK where useful | Hackathon alignment and best demo quality. |
| Local AI | OpenAI-compatible provider | Supports Ollama, vLLM, llama.cpp, LiteLLM. |
| Search | Elastic / Elasticsearch client + Elastic MCP tools | Wazuh alert search, timelines, correlation. |
| Memory | MongoDB Atlas / local MongoDB | Cases, feedback, profiles, IOC memory. |
| Optional connector | Wazuh Bridge Lite | Tiny read-only connector near Wazuh Manager. |
| Deployment | Google Cloud Run + Docker | Simple hosting and reproducible local mode. |

## 3. Design Theme

Use a dark metallic interface with neon green accents inspired by expressive neural UI patterns.

```text
Primary background: metallic dark / near-black
Accent: neon green
Secondary accent: cyan/blue sparingly
Mood: cyber, precise, analytical, not cartoonish
```

Suggested tokens:

```css
--bg: #050807;
--metal: #101716;
--panel: #121c1a;
--panel-soft: #182320;
--neon: #39ff14;
--neon-soft: #9cff8a;
--cyan: #33f6ff;
--text: #eef8f0;
--muted: #8fa69a;
--danger: #ff4d6d;
--warning: #ffd166;
```

## 4. Wazuh Integration Facts

Wazuh Manager generates alerts after processing agent and agentless events. By default, alerts are written to:

```text
/var/ossec/logs/alerts/alerts.log
/var/ossec/logs/alerts/alerts.json
```

Wazuh commonly forwards alerts for indexing via Filebeat. Default Wazuh index patterns include:

```text
wazuh-alerts-*
wazuh-archives-*
wazuh-monitoring-*
wazuh-statistics-*
wazuh-states-vulnerabilities-*
wazuh-states-inventory-*
```

Wazuh API uses JWT auth from:

```text
POST https://<wazuh-manager>:55000/security/user/authenticate?raw=true
Authorization: Bearer <TOKEN>
```

Use Wazuh API only for metadata and health checks in v1. Primary investigation data should come from Elastic/Wazuh Indexer because searching logs through indices is faster and simpler.

## 5. Integration Modes

### Mode A — Existing Elastic/Wazuh Indexer

Best for hackathon and most real customers already centralizing logs.

```text
Wazuh Manager -> Filebeat -> Wazuh Indexer / Elastic -> WAZCOR Elastic tools
```

### Mode B — Wazuh Bridge Lite

Use when a customer wants WAZCOR to ingest alerts from Wazuh directly.

```text
Wazuh alerts.json -> Wazuh Bridge Lite -> WAZCOR API / Elastic ingest
```

Bridge rules:

```text
read-only
outbound HTTPS only
no endpoint scanning
no shell execution
small local retry queue
batch events
```

### Mode C — Fully Local Install

For private SOCs and regulated customers.

```text
WAZCOR UI + API + Elastic + MongoDB + Ollama/vLLM all inside customer network
```

## 6. Elastic Layer

Elastic Agent Builder exposes tools through MCP at:

```text
{KIBANA_URL}/api/agent_builder/mcp
```

Use read-only API keys limited to required indices. Required privileges:

```text
indices: read, view_index_metadata
applications: feature_agentBuilder.read, feature_actions.read
```

WAZCOR must define a stable internal tool interface even if the implementation uses Elastic MCP or direct Elasticsearch client during development.

Required tools:

```text
get_wazuh_alert(alert_id)
search_auth_timeline(host, user, src_ip, start, end)
find_failed_then_success_login(host, user, src_ip, window)
search_fim_events(host, paths, start, end)
search_process_events(host, user, start, end)
search_network_events(host, src_ip, start, end)
find_same_ip_across_hosts(src_ip, start, end)
build_attack_timeline(entities, window)
```

## 7. MongoDB Layer

MongoDB stores product-owned memory and case data.

Collections:

```text
cases
case_evidence
user_profiles
host_profiles
ioc_memory
analyst_feedback
settings
audit_events
```

Use MongoDB driver for controlled product writes. Use MongoDB MCP where useful for agent-readable case memory and profile lookup. If MongoDB MCP runs over HTTP, keep it localhost/private and protected; do not expose it publicly.

Required operations:

```text
find_similar_cases(patterns, entities)
get_user_profile(user)
get_host_profile(host)
get_ioc_history(ioc)
store_case(case)
store_evidence(case_id, evidence[])
record_feedback(case_id, feedback)
```

## 8. Model Gateway

Do not tie WAZCOR to one model. All model calls go through:

```text
ModelProvider.generate_verdict(evidence_package) -> VerdictJSON
ModelProvider.generate_report(case_data) -> MarkdownReport
```

Providers:

```text
GeminiProvider             # hackathon/default SaaS
OpenAICompatibleProvider   # Ollama, vLLM, llama.cpp, LiteLLM
```

Local endpoints:

```text
Ollama:    http://localhost:11434/v1
vLLM:      http://localhost:8000/v1
llama.cpp: http://localhost:8080/v1
LiteLLM:   http://localhost:4000/v1
```

Important: backend executes tools deterministically. The model receives the evidence package and returns structured reasoning/verdict. Do not rely on weak local model tool-calling for the core investigation.

## 9. Main Data Flow

```text
1. Alert appears in WAZCOR alert queue.
2. Analyst clicks Investigate.
3. API creates investigation job.
4. Entity extractor identifies host, user, IP, time, rule, severity.
5. Elastic tools collect related evidence.
6. MongoDB tools load profiles and similar cases.
7. Scoring engine calculates deterministic evidence score.
8. Model gateway generates structured verdict explanation.
9. API validates verdict JSON against schema.
10. Case, evidence, timeline, audit log, and report are stored.
11. Dashboard shows verdict, timeline, evidence cards, and feedback controls.
```

## 10. Verdict Schema

```json
{
  "case_id": "CASE-2026-0001",
  "verdict": "likely_host_compromise",
  "confidence": 91,
  "entities": {
    "host": "linux-web-03",
    "user": "deploy",
    "src_ip": "185.199.10.44"
  },
  "evidence_ids": ["ev-001", "ev-002"],
  "hypotheses": [
    {"name": "benign_admin", "status": "rejected", "reason": "new external source after failures"}
  ],
  "recommended_actions": ["disable account pending approval", "block source IP", "hunt same SSH key"],
  "needs_human_review": false
}
```

## 11. Security Model

```text
read-only investigation by default
no automatic destructive actions in v1
least-privilege Elastic keys
MongoDB credentials only in backend env/Secret Manager
never expose model, Elastic, MongoDB, or Wazuh secrets to frontend
all model conclusions must cite evidence IDs
return needs_review if evidence is missing or contradictory
```

## 12. Repo Layout

```text
wazcor/
  frontend/                  # Next.js dashboard
  backend/                   # FastAPI API + agent orchestrator
    app/
      main.py
      agents/
      providers/
      integrations/
      scoring/
      schemas/
      reports/
  bridge-lite/               # optional Wazuh connector
  data/                      # seed data
  docs/
  Architecture.md
  Agent.md
  SPECS.md
  Progress.md
```

## 13. Research Anchors

```text
Wazuh alerts: https://documentation.wazuh.com/current/user-manual/manager/alert-management.html
Wazuh indices: https://documentation.wazuh.com/current/user-manual/wazuh-indexer/wazuh-indexer-indices.html
Wazuh API auth: https://documentation.wazuh.com/current/user-manual/api/getting-started.html
Elastic MCP: https://www.elastic.co/docs/explore-analyze/ai-features/agent-builder/mcp-server
Elastic tools: https://www.elastic.co/docs/explore-analyze/ai-features/agent-builder/tools
MongoDB MCP: https://www.mongodb.com/docs/mcp-server/get-started/
MongoDB MCP standalone: https://www.mongodb.com/docs/mcp-server/configuration/standalone-service/
Google MCP tools: https://docs.cloud.google.com/customer-engagement-ai/conversational-agents/ps/tool/mcp
Google ADK: https://docs.cloud.google.com/agent-registry/reference/libraries
Ollama OpenAI API: https://docs.ollama.com/api/openai-compatibility
vLLM tools: https://docs.vllm.ai/en/v0.8.5/getting_started/examples/openai_chat_completion_client_with_tools.html
llama.cpp server: https://llama-cpp-python.readthedocs.io/en/latest/server/
LiteLLM proxy: https://docs.litellm.ai/docs/proxy_server
```
