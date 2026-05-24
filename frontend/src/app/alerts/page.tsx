"use client";
/*
Purpose: Premium Alert Queue page for WAZCOR.
Ownership: Jules
Safety: Lists alerts and allows starting investigations.
*/
import { useEffect, useState } from "react";
import { fetchAlerts, createInvestigation } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCcw,
  User,
  Monitor,
  Network,
  Zap
} from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [investigatingId, setInvestigatingId] = useState<string | null>(null);
  const router = useRouter();

  const loadAlerts = async () => {
    setLoading(true);
    const data = await fetchAlerts();
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleInvestigate = async (alertId: string) => {
    setInvestigatingId(alertId);
    try {
      const caseData = await createInvestigation(alertId);
      router.push(`/cases/${caseData.id}`);
    } catch (error) {
      console.error("Investigation failed", error);
      setInvestigatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-4">
            ALERT <span className="text-neon neon-text-glow">QUEUE</span>
            <div className="px-2 py-1 bg-neon/10 border border-neon/20 rounded text-neon text-[10px] font-bold tracking-[0.2em] uppercase shadow-neon-glow animate-pulse">
              Live Ingest
            </div>
          </h1>
          <p className="text-muted font-mono text-sm tracking-widest uppercase">Pending wazuh signals requiring triage</p>
        </div>
        <button
          onClick={loadAlerts}
          className="p-2 bg-metal border border-panel-soft rounded hover:text-neon transition-colors group"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-metal/50 border border-panel-soft p-4 rounded-lg">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Filter by Rule ID, Host, or Description..."
              className="w-full bg-background border border-panel-soft rounded py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-neon/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-panel-soft rounded text-xs text-muted hover:text-white transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
        <div className="text-[10px] text-muted font-bold tracking-widest uppercase">
          Total Signals: <span className="text-neon">{alerts.length}</span>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-panel border border-panel-soft rounded-lg overflow-hidden cyber-border">
        <table className="w-full text-left">
          <thead className="bg-metal text-[10px] text-muted uppercase tracking-widest border-b border-panel-soft">
            <tr>
              <th className="p-4">Signal Details</th>
              <th className="p-4">Entities</th>
              <th className="p-4">Severity</th>
              <th className="p-4 text-right">Triage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-soft">
            {loading && alerts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-neon/20 border-t-neon rounded-full animate-spin"></div>
                    <div className="text-neon font-mono text-xs tracking-widest uppercase animate-pulse">Syncing with Wazuh Indexer...</div>
                  </div>
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center text-muted italic">No pending alerts. System clear.</td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-panel-soft/30 transition group relative overflow-hidden">
                  {investigatingId === alert.id && (
                    <td className="absolute inset-0 bg-neon/5 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="flex items-center gap-3">
                        <Zap className="text-neon w-4 h-4 animate-bounce" />
                        <span className="text-neon font-black text-xs uppercase tracking-[0.3em] animate-pulse">Running AI Investigation...</span>
                      </div>
                    </td>
                  )}
                  <td className="p-4 max-w-md">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neon-soft bg-neon/5 px-1.5 py-0.5 rounded border border-neon/10">{alert.rule_id}</span>
                        <span className="text-[10px] font-mono text-muted">{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-sm font-bold text-white leading-snug group-hover:text-neon transition-colors">{alert.description}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Monitor className="w-3.5 h-3.5 text-cyan" />
                        <span className="font-mono text-cyan/90">{alert.host}</span>
                      </div>
                      {alert.user && (
                        <div className="flex items-center gap-2 text-xs">
                          <User className="w-3.5 h-3.5 text-muted" />
                          <span className="font-mono text-muted">{alert.user}</span>
                        </div>
                      )}
                      {alert.src_ip && (
                        <div className="flex items-center gap-2 text-xs">
                          <Network className="w-3.5 h-3.5 text-muted" />
                          <span className="font-mono text-muted">{alert.src_ip}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <SeverityBadge level={alert.severity} />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      disabled={!!investigatingId}
                      onClick={() => handleInvestigate(alert.id)}
                      className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                        investigatingId
                          ? 'bg-panel-soft text-muted cursor-not-allowed'
                          : 'bg-metal border border-neon/30 text-neon hover:bg-neon hover:text-background hover:shadow-neon-glow'
                      }`}
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SeverityBadge({ level }: { level: number }) {
  let color = "text-muted border-panel-soft bg-panel-soft/20";
  let label = "LOW";

  if (level >= 12) {
    color = "text-danger border-danger/40 bg-danger/10 shadow-[0_0_10px_rgba(255,77,109,0.2)]";
    label = "CRITICAL";
  } else if (level >= 7) {
    color = "text-warning border-warning/40 bg-warning/10";
    label = "HIGH";
  } else if (level >= 4) {
    color = "text-cyan border-cyan/40 bg-cyan/10";
    label = "MEDIUM";
  }

  return (
    <div className={`inline-flex flex-col items-center border rounded px-3 py-1 ${color}`}>
      <span className="text-[8px] font-bold tracking-widest mb-0.5 uppercase opacity-70">Level</span>
      <span className="text-sm font-black">{level}</span>
      <span className="text-[7px] font-black tracking-[0.2em] mt-0.5">{label}</span>
    </div>
  );
}
