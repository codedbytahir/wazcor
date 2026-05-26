"use client";
/*
Purpose: Premium Dashboard page for WAZCOR.
Ownership: Jules
Safety: Summary view of SOC activity.
*/
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldCheck,
  Clock,
  Target,
  ArrowUpRight,
  Activity,
  History
} from "lucide-react";
import { fetchAlerts, fetchCases } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    openCases: 0,
    highConfidence: 0,
    avgTime: "45s"
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([fetchAlerts(), fetchCases()]).then(([alerts, cases]) => {
      const highConf = cases.filter((c: any) => c.verdict.confidence >= 90).length;
      setStats({
        activeAlerts: alerts.length,
        openCases: cases.length,
        highConfidence: highConf,
        avgTime: "42s"
      });
      setRecentCases(cases.slice(-5).reverse());
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            OPERATIONAL <span className="text-neon neon-text-glow">OVERVIEW</span>
          </h1>
          <p className="text-muted font-mono text-sm tracking-widest uppercase">Real-time threat landscape analysis</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">System Load</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className={`w-3 h-1 ${i < 4 ? 'bg-neon shadow-neon-glow' : 'bg-panel-soft'}`}></div>
            ))}
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={AlertTriangle}
          color="warning"
          trend="+12%"
        />
        <MetricCard
          title="Open Cases"
          value={stats.openCases}
          icon={Target}
          color="neon"
          trend="+2"
        />
        <MetricCard
          title="High Confidence"
          value={stats.highConfidence}
          icon={ShieldCheck}
          color="cyan"
          trend="88%"
        />
        <MetricCard
          title="Avg Investigation"
          value={stats.avgTime}
          icon={Clock}
          color="muted"
          trend="-3s"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Cases Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-neon" />
              RECENT INVESTIGATIONS
            </h2>
            <Link href="/cases" className="text-xs text-neon hover:underline flex items-center gap-1 uppercase tracking-wider font-bold">
              View all cases <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-panel border border-panel-soft rounded-lg overflow-hidden cyber-border">
            <table className="w-full text-left">
              <thead className="bg-metal text-[10px] text-muted uppercase tracking-widest border-b border-panel-soft">
                <tr>
                  <th className="p-4">Case ID</th>
                  <th className="p-4">Verdict</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-soft">
                {recentCases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted italic">No recent investigations found.</td>
                  </tr>
                ) : (
                  recentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-panel-soft/50 transition cursor-pointer group">
                      <td className="p-4 font-mono text-xs text-white">
                        <Link href={`/cases/${c.id}`} className="block">{c.id}</Link>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          c.verdict.confidence > 80 ? 'border-neon/30 text-neon bg-neon/5' : 'border-warning/30 text-warning bg-warning/5'
                        }`}>
                          {c.verdict.verdict.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-cyan font-mono">{c.verdict.entities.host}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 bg-metal h-1 rounded-full overflow-hidden">
                            <div className={`h-full ${c.verdict.confidence > 80 ? 'bg-neon' : 'bg-warning'}`} style={{ width: `${c.verdict.confidence}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-white">{c.verdict.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 px-2">
            <Activity className="w-5 h-5 text-cyan" />
            LIVE FEED
          </h2>
          <div className="bg-panel border border-panel-soft rounded-lg p-6 space-y-4 cyber-border h-[320px] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-scanline pointer-events-none opacity-20"></div>
            <div className="space-y-4 animate-flicker">
              <FeedItem time="14:22:01" msg="System check: all nodes operational" color="neon" />
              <FeedItem time="14:21:45" msg="New alert detected: SSH Brute Force" color="warning" />
              <FeedItem time="14:20:12" msg="Investigation CASE-2026-004 completed" color="cyan" />
              <FeedItem time="14:18:55" msg="Database synchronized with Wazuh Indexer" color="muted" />
              <FeedItem time="14:15:30" msg="AI Provider (Gemini) handshake successful" color="neon" />
              <FeedItem time="14:12:00" msg="Node wazcor-node-01 memory at 24%" color="muted" />
            </div>
          </div>

          <div className="bg-neon/10 border border-neon/30 p-6 rounded-lg shadow-neon-glow">
            <h3 className="font-black text-white mb-2 tracking-tight uppercase">Ready for action?</h3>
            <p className="text-xs text-neon-soft/80 mb-4 font-mono">2 high-severity alerts require immediate investigation.</p>
            <Link href="/alerts" className="inline-block w-full text-center bg-neon text-background py-2 rounded font-black text-xs uppercase tracking-widest hover:bg-neon-soft transition shadow-neon-glow">
              ENTER WAR ROOM
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, trend }: any) {
  const colorClasses: any = {
    neon: "text-neon bg-neon/10 border-neon/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    cyan: "text-cyan bg-cyan/10 border-cyan/20",
    muted: "text-muted bg-metal border-panel-soft",
  };

  return (
    <div className="bg-panel border border-panel-soft p-6 rounded-lg space-y-4 hover:border-white/20 transition-all relative overflow-hidden group cyber-border">
      <div className={`absolute -right-4 -top-4 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity ${color === 'neon' ? 'text-neon' : color === 'warning' ? 'text-warning' : color === 'cyan' ? 'text-cyan' : 'text-white'}`}>
        <Icon size={64} />
      </div>
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded border ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color === 'warning' ? 'bg-danger/10 text-danger' : 'bg-neon/10 text-neon'}`}>
          {trend}
        </span>
      </div>
      <div>
        <div className="text-4xl font-black text-white tracking-tighter mb-1">{value}</div>
        <div className="text-[10px] text-muted font-bold uppercase tracking-widest">{title}</div>
      </div>
    </div>
  );
}

function FeedItem({ time, msg, color }: any) {
  const colorClass = color === 'neon' ? 'text-neon' : color === 'warning' ? 'text-warning' : color === 'cyan' ? 'text-cyan' : 'text-muted';
  return (
    <div className="flex gap-3 font-mono text-[10px] border-l border-panel-soft pl-3 pb-4 last:pb-0 relative">
      <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-panel-soft border border-background"></div>
      <span className="text-muted shrink-0">{time}</span>
      <span className={`${colorClass} tracking-tight`}>{msg}</span>
    </div>
  );
}
