# Wazuh Bridge Lite

Wazuh Bridge Lite is a lightweight, read-only connector designed to reside near the Wazuh Manager. Its purpose is to ingest alerts from Wazuh and forward them to the WAZCOR API for investigation.

## Architecture

```text
Wazuh Manager (alerts.json) -> Wazuh Bridge Lite -> WAZCOR API (POST /ingest/alerts)
```

## Core Principles

1.  **Read-Only**: The bridge only reads `alerts.json`. It does not modify Wazuh configuration or agent state.
2.  **Outbound-Only**: The bridge initiates connections to the WAZCOR API. It does not expose any listening ports (except optionally for local metrics).
3.  **Lightweight**: Minimal CPU/Memory footprint. Written in Go or Python.
4.  **Secure**: Uses API keys for authentication with WAZCOR. Redacts sensitive data if configured.

## Proposed Interface

The bridge should support the following configuration:

- `WAZUH_ALERTS_PATH`: Path to Wazuh `alerts.json` (default: `/var/ossec/logs/alerts/alerts.json`).
- `WAZCOR_API_URL`: URL of the WAZCOR backend.
- `WAZCOR_API_KEY`: Authentication key for the WAZCOR API.
- `BATCH_SIZE`: Number of alerts to batch before sending (default: 10).
- `FLUSH_INTERVAL`: Maximum time to wait before sending a partial batch (default: 5s).

## Future Implementation Details (Go)

```go
// Example Tailer structure
type Bridge struct {
    TargetURL string
    APIKey    string
    FilePath  string
}

func (b *Bridge) Start() {
    // 1. Open alerts.json
    // 2. Tail the file
    // 3. Parse JSON lines
    // 4. Batch and Send to WAZCOR
}
```

## Deployment

Typically deployed as a systemd service or a sidecar container alongside the Wazuh Manager.
