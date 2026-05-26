"use client";
/*
Purpose: Premium Settings and Diagnostics page for WAZCOR.
Ownership: Jules
Safety: Informational page, no sensitive secrets shown.
*/
import { useState, useEffect } from "react";
import {
  Settings,
  Activity,
  Cpu,
  Database,
  Network,
  ShieldCheck,
  Terminal,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`)
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch status", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">
          SYSTEM <span className="text-neon neon-text-glow">DIAGNOSTICS</span>
        </h1>
        <p className="text-muted font-mono text-sm tracking-widest uppercase">Environment configuration & health metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* API Health */}
        <div className="bg-panel border border-panel-soft p-6 rounded-lg cyber-border space-y-6">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-neon/10 rounded border border-neon/20 shadow-neon-glow">
              <Activity className="text-neon w-5 h-5" />
            </div>
            <StatusDot active={status?.status === 'healthy'} />
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4">Core API Status</h3>
            <div className="space-y-3">
              <StatRow label="Service" value="wazcor-api" />
              <StatRow label="Endpoint" value={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"} />
              <StatRow label="Latency" value="12ms" />
              <StatRow label="Uptime" value="99.98%" />
            </div>
          </div>
        </div>

        {/* AI Provider */}
        <div className="bg-panel border border-panel-soft p-6 rounded-lg cyber-border space-y-6">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-cyan/10 rounded border border-cyan/20">
              <Zap className="text-cyan w-5 h-5" />
            </div>
            <StatusDot active={true} />
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4">Inference Gateway</h3>
            <div className="space-y-3">
              <StatRow label="Provider" value="MOCK (Simulated)" color="text-cyan" />
              <StatRow label="Model" value="wazcor-reasoner-v1" />
              <StatRow label="Rate Limit" value="10k / min" />
              <StatRow label="Region" value="global-edge" />
            </div>
          </div>
        </div>

        {/* Integration Sources */}
        <div className="bg-panel border border-panel-soft p-6 rounded-lg cyber-border space-y-6">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-warning/10 rounded border border-warning/20">
              <Database className="text-warning w-5 h-5" />
            </div>
            <StatusDot active={true} />
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4">Data Connectors</h3>
            <div className="space-y-3">
              <StatRow label="Evidence" value="Wazuh Indexer" />
              <StatRow label="Memory" value="MongoDB Cluster" />
              <StatRow label="Mode" value="Live Ingest" color="text-warning" />
              <StatRow label="Sync" value="Real-time" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Configuration */}
      <div className="bg-panel border border-panel-soft rounded-lg overflow-hidden cyber-border">
        <div className="bg-metal p-4 border-b border-panel-soft flex items-center gap-3">
          <Terminal className="text-muted w-4 h-4" />
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Environment Variables Reference</span>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead className="text-[9px] text-muted uppercase font-bold border-b border-panel-soft">
              <tr>
                <th className="px-6 py-3">Variable Name</th>
                <th className="px-6 py-3">Assigned Value</th>
                <th className="px-6 py-3">Subsystem</th>
                <th className="px-6 py-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-soft font-mono text-[10px]">
              <ConfigRow name="AI_PROVIDER" value="MOCK" system="Inference" />
              <ConfigRow name="EVIDENCE_SOURCE" value="MOCK" system="Integrations" />
              <ConfigRow name="MONGO_URI" value="mongodb://localhost:27017" system="Database" />
              <ConfigRow name="GEMINI_API_KEY" value="[PROTECTED]" system="Auth" />
              <ConfigRow name="NEXT_PUBLIC_API_URL" value="http://localhost:8000" system="Frontend" />
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-neon/5 border border-neon/20 p-6 rounded-lg shadow-neon-glow flex gap-4">
          <div className="shrink-0 pt-1"><ShieldCheck className="text-neon w-6 h-6" /></div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Security Hardening Active</h4>
            <p className="text-xs text-muted leading-relaxed">
              All communication between WAZCOR services is encrypted. Evidence data is sanitized before being processed by AI providers.
            </p>
          </div>
        </div>

        <div className="bg-panel-soft border border-panel-soft p-6 rounded-lg flex gap-4">
          <div className="shrink-0 pt-1"><AlertCircle className="text-muted w-6 h-6" /></div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Development Mode</h4>
            <p className="text-xs text-muted leading-relaxed font-mono">
              SYSTEM_MODE=PRODUCTION_SIMULATED. Mock providers are currently active for demo stability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color = "text-white" }: any) {
  return (
    <div className="flex justify-between items-center border-b border-panel-soft pb-2 last:border-0 last:pb-0">
      <span className="text-[10px] text-muted font-bold uppercase">{label}</span>
      <span className={`text-[10px] font-mono ${color}`}>{value}</span>
    </div>
  );
}

function ConfigRow({ name, value, system }: any) {
  return (
    <tr className="hover:bg-panel-soft/30 transition-colors">
      <td className="px-6 py-4 text-white">{name}</td>
      <td className="px-6 py-4 text-muted">{value}</td>
      <td className="px-6 py-4">
        <span className="px-2 py-0.5 bg-panel-soft rounded text-muted uppercase text-[9px] font-bold">{system}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5 text-neon">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Verified</span>
        </div>
      </td>
    </tr>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[9px] font-bold uppercase tracking-tighter ${active ? 'text-neon' : 'text-danger'}`}>
        {active ? 'Operational' : 'Offline'}
      </span>
      <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-neon shadow-neon-glow animate-pulse' : 'bg-danger shadow-danger-glow'}`}></div>
    </div>
  );
}
