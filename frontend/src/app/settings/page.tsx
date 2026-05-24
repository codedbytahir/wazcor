"use client";
/*
Purpose: Settings and status page for WAZCOR.
Ownership: Jules
Safety: Informational page, no sensitive secrets shown.
*/
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error("Failed to fetch status", err));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-neon mb-2">SYSTEM SETTINGS</h1>
        <p className="text-muted">Configure AI providers and integration sources.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-metal p-6 border border-panel-soft rounded-lg">
          <h2 className="text-xl font-bold text-neon-soft mb-4">API STATUS</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Backend URL:</span>
              <span className="font-mono">{process.env.NEXT_PUBLIC_API_URL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status:</span>
              <span className={`font-mono ${status?.status === 'healthy' ? 'text-neon' : 'text-danger'}`}>
                {status?.status || 'unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Last Check:</span>
              <span className="font-mono text-xs">{status?.timestamp || 'N/A'}</span>
            </div>
          </div>
        </section>

        <section className="bg-metal p-6 border border-panel-soft rounded-lg">
          <h2 className="text-xl font-bold text-neon-soft mb-4">INTEGRATIONS</h2>
          <p className="text-sm text-muted mb-4">
            Configuration is managed via environment variables.
          </p>
          <ul className="space-y-2 text-sm font-mono">
            <li className="flex justify-between border-b border-panel-soft pb-1">
              <span>AI_PROVIDER</span>
              <span className="text-cyan">MOCK</span>
            </li>
            <li className="flex justify-between border-b border-panel-soft pb-1">
              <span>EVIDENCE_SOURCE</span>
              <span className="text-cyan">MOCK</span>
            </li>
          </ul>
        </section>
      </div>

      <div className="bg-panel-soft p-6 border border-neon/20 rounded-lg">
        <h2 className="text-lg font-bold text-neon mb-2">PRO TIP</h2>
        <p className="text-text text-sm">
          To switch to Gemini or local Ollama, update your <code>.env</code> file and restart the containers using <code>docker compose up --build</code>.
        </p>
      </div>
    </div>
  );
}
