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

## AI Providers

WAZCOR supports multiple AI providers:
- **Mock**: (Default) Deterministic rule-based reasoning.
- **Gemini**: Uses Google's Gemini API (requires `GEMINI_API_KEY`).
- **OpenAI**: Supports OpenAI-compatible APIs like Ollama, vLLM, etc. (requires `OPENAI_BASE_URL`).

Configure your choice in `.env` using `AI_PROVIDER`.
