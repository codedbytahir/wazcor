"use client";
/*
Purpose: Premium Case list page for WAZCOR.
Ownership: Jules
Safety: Overview of all historical investigations.
*/
import { useEffect, useState } from "react";
import { fetchCases } from "@/lib/api";
import Link from "next/link";
import {
  Briefcase,
  Search,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  LayoutGrid,
  List
} from "lucide-react";

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases().then(data => {
      setCases(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 border-4 border-neon/10 border-t-neon rounded-full animate-spin"></div>
      <div className="text-neon font-mono text-xs tracking-widest uppercase animate-pulse">Accessing SOC Memory...</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            INVESTIGATION <span className="text-neon neon-text-glow">MEMORY</span>
          </h1>
          <p className="text-muted font-mono text-sm tracking-widest uppercase">Historical archive of AI-analyzed security incidents</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-metal border border-panel-soft rounded text-neon"><LayoutGrid className="w-4 h-4" /></button>
          <button className="p-2 bg-metal border border-panel-soft rounded text-muted"><List className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-metal/50 border border-panel-soft p-4 rounded-lg">
        <div className="relative flex-1 w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search cases by ID, host, or verdict..."
            className="w-full bg-background border border-panel-soft rounded py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-neon/50 transition-all"
          />
        </div>
        <div className="flex gap-4 text-[10px] text-muted font-bold tracking-widest uppercase">
          <span>Archived: <span className="text-neon">{cases.length}</span></span>
          <span>Avg Confidence: <span className="text-cyan">92%</span></span>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="bg-panel border border-panel-soft rounded-lg p-20 text-center cyber-border">
          <div className="w-16 h-16 bg-panel-soft rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Briefcase className="text-muted w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Investigations Yet</h3>
          <p className="text-sm text-muted mb-6">Select an alert from the queue to start your first AI investigation.</p>
          <Link href="/alerts" className="bg-neon text-background px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-neon-soft transition shadow-neon-glow">
            Go to Alerts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <Link href={`/cases/${c.id}`} key={c.id} className="group">
              <div className="bg-panel border border-panel-soft p-6 rounded-lg group-hover:border-neon/50 transition-all duration-300 relative overflow-hidden h-full cyber-border hover:shadow-neon-glow">
                <div className="flex justify-between items-start mb-6">
                  <div className="px-2 py-0.5 bg-background border border-panel-soft rounded text-[9px] font-mono text-muted uppercase">
                    {c.id}
                  </div>
                  <div className={`flex items-center gap-1.5 font-bold text-[10px] ${c.verdict.confidence > 80 ? 'text-neon' : 'text-warning'}`}>
                    <ShieldCheck className="w-3 h-3" />
                    {c.verdict.confidence}%
                  </div>
                </div>

                <h3 className="font-black text-xl mb-4 text-white leading-tight group-hover:text-neon transition-colors uppercase tracking-tighter">
                  {c.verdict.verdict.replace(/_/g, ' ')}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted uppercase">Entity:</span>
                    <span className="text-cyan">{c.verdict.entities.host}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted uppercase">Created:</span>
                    <span className="text-white">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted uppercase">Evidence:</span>
                    <span className="text-white">{c.evidence.length} items</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-panel-soft">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-metal border border-panel-soft flex items-center justify-center">
                        <Clock className="w-3 h-3 text-muted" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-neon uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Access Case <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
