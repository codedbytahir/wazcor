# WAZCOR

WAZCOR is a lightweight AI SOC investigation product for Wazuh environments.

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
   - Backend: [http://localhost:8000](http://localhost:8000)

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

### Backend Tests
```bash
cd backend
python3 -m pytest
```

### End-to-End API Verification
```bash
./test.sh http://localhost:8000
```

## Configuration

WAZCOR is configured via environment variables in a `.env` file.

### AI Providers
- **Mock**: (Default) Deterministic rule-based reasoning. `AI_PROVIDER=mock`.
- **Gemini**: Uses Google's Gemini API. `AI_PROVIDER=gemini`, `GEMINI_API_KEY=your_key`.
- **OpenAI/Local**: Supports OpenAI-compatible APIs (Ollama, vLLM). `AI_PROVIDER=openai`, `OPENAI_BASE_URL=http://localhost:11434/v1`, `OPENAI_MODEL=llama3`, `OPENAI_API_KEY=optional`.

### Evidence Sources
- **Mock**: (Default) Uses seeded data. `EVIDENCE_SOURCE=mock`.
- **Elastic**: Queries real Wazuh alerts. `EVIDENCE_SOURCE=elastic`, `ELASTICSEARCH_URL=`, `ELASTICSEARCH_API_KEY=`, `ELASTIC_ALERT_INDEX=wazuh-alerts-*`.

### Database
- **MongoDB**: `DATABASE_URL=mongodb://mongo:27017/wazcor`.

## Troubleshooting

- **Database Connection**: If MongoDB is unavailable, WAZCOR falls back to in-memory storage (cases will not persist across restarts). Check the Settings page for status.
- **AI Verdicts**: If a provider fails or evidence is missing, the verdict will be set to `needs_review`.
- **Elastic Search**: Ensure `ELASTIC_ALERT_INDEX` matches your Wazuh index pattern.
