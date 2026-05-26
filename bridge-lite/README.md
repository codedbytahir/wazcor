# Wazuh Bridge Lite

Wazuh Bridge Lite is a proposed lightweight, read-only connector for WAZCOR.

## Design Goals

- **Lightweight**: Minimal CPU/Memory footprint on the Wazuh Manager.
- **Read-Only**: No capability to modify Wazuh configuration or perform destructive actions.
- **Secure**: Outbound HTTPS only, least-privilege access.
- **Reliable**: Small local retry queue for network disruptions.

## Operation

1. **Monitor**: Reads `/var/ossec/logs/alerts/alerts.json` in real-time.
2. **Batch**: Batches alerts before sending to reduce overhead.
3. **Ingest**: Calls the WAZCOR `POST /ingest/alerts` endpoint.

## Security Constraints

- No shell execution capabilities.
- No endpoint scanning or isolation features.
- No direct database access.
- Only authorized to talk to the configured WAZCOR API URL.

## Future Implementation (Go)

The bridge will be implemented in Go for maximum performance and portability across Linux distributions where Wazuh Managers typically run.
