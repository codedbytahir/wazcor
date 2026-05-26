# WAZCOR

WAZCOR is a lightweight AI SOC investigation product for Wazuh environments. It turns raw Wazuh alerts into evidence-backed investigation cases using Elastic for evidence search, MongoDB for SOC memory, and Gemini or local AI for automated reasoning.

## Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env
   ```

2. **Run with Docker**
   ```bash
   docker compose up --build
   ```

3. **Access WAZCOR**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - MongoDB: localhost:27017

## Product Features

- **Alert Queue**: Real-time triage of Wazuh signals.
- **AI Investigation**: Automated evidence collection and reasoning.
- **Evidence Timeline**: Visual reconstruction of incident activity.
- **SOC Memory**: Persistence of cases, analyst feedback, and incident reports.
- **Multi-Provider AI**: Support for Gemini and OpenAI-compatible local AI (Ollama, vLLM).
- **Flexible Evidence**: Mock mode for demos, Elastic mode for real Wazuh environments.

## Configuration

WAZCOR is configured via environment variables in the `.env` file.

### AI Providers (`AI_PROVIDER`)
- **mock**: (Default) Deterministic rule-based reasoning for stable demos.
- **gemini**: Uses Google's Gemini 1.5 Flash. Requires `GEMINI_API_KEY`.
- **openai**: Supports OpenAI-compatible APIs. Requires `OPENAI_BASE_URL` (e.g., `http://localhost:11434/v1`).

### Evidence Sources (`EVIDENCE_SOURCE`)
- **mock**: (Default) Uses seeded data for demos.
- **elastic**: Queries real Wazuh alerts. Requires `ELASTIC_URL` and `ELASTIC_API_KEY` (or username/password).

### Wazuh Ingestion
WAZCOR provides a `POST /ingest/alerts` endpoint to receive raw Wazuh alert JSON. This allows for easy integration with external forwarders or the proposed **Wazuh Bridge Lite**.

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

### Automated Tests
```bash
cd backend && pytest
```

### End-to-End API Verification
```bash
./test.sh http://localhost:8000
```

## Troubleshooting

- **Status Page**: Visit the **Settings** page in the UI to check system diagnostics. It shows connectivity for the Database, AI Provider, and Evidence Source.
- **Mock Fallback**: If MongoDB is unavailable, WAZCOR falls back to in-memory storage. Data will be lost when the backend restarts.
- **AI Verdicts**: If an AI provider is misconfigured or fails, WAZCOR generates a `needs_review` verdict with details about the failure.

## Hackathon Demo Flow

1. Open [http://localhost:3000/alerts](http://localhost:3000/alerts)
2. Select the **SSH brute force** alert.
3. Click **Investigate**.
4. Review the AI verdict, evidence timeline, and artifacts.
5. Provide **Analyst Feedback** and **Export** the Markdown report.
6. Verify the case persists in the **Cases** list.

---
WAZCOR v1 - Ready for SOC triage.
