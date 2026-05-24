"use client";
/*
Purpose: Premium Case Detail page for WAZCOR.
Ownership: Jules
Safety: Deep dive into investigation results.
*/
import { useEffect, useState } from "react";
import { fetchCase, submitFeedback, fetchReport } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ChevronLeft,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  Terminal,
  Activity,
  User,
  Monitor,
  Globe,
  Database,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  Target,
  Zap
} from "lucide-react";

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: 5, comment: "" });
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      fetchCase(id as string).then(data => {
        setCaseData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const toggleEvidence = (evId: string) => {
    setExpandedEvidence(prev => ({ ...prev, [evId]: !prev[evId] }));
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback(id as string, { ...feedback, analyst_id: "ANALYST-01" });
    alert("Feedback recorded in MongoDB.");
  };

  const handleExport = async () => {
    const { report } = await fetchReport(id as string);
    const blob = new Blob([report], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WAZCOR-Report-${id}.md`;
    a.click();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 border-4 border-neon/10 border-t-neon rounded-full animate-spin shadow-neon-glow"></div>
      <div className="text-neon font-mono text-sm tracking-[0.3em] uppercase animate-pulse">Reconstructing Incident...</div>
    </div>
  );

  const verdictColor = caseData.verdict.confidence > 80 ? 'text-neon' : 'text-warning';
  const verdictGlow = caseData.verdict.confidence > 80 ? 'shadow-neon-glow border-neon/40' : 'shadow-warning-glow border-warning/40';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex justify-between items-center bg-metal/50 border border-panel-soft p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/cases')}
            className="p-2 hover:bg-panel-soft rounded transition-colors text-muted hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest tracking-widest">Case ID</span>
              <span className="text-xs font-mono text-white">{id}</span>
            </div>
            <h1 className="text-xl font-black text-white">INTELLIGENCE REPORT</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 bg-panel-soft border border-neon/30 text-neon px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-neon hover:text-background transition-all shadow-neon-glow">
            <Download className="w-4 h-4" /> Export MD
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Verdict & Entities */}
        <div className="lg:col-span-1 space-y-6">
          {/* Verdict Hero */}
          <div className={`bg-panel border-2 p-6 rounded-lg relative overflow-hidden ${verdictGlow}`}>
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <ShieldAlert size={80} />
            </div>
            <h2 className="text-muted text-[10px] font-bold uppercase tracking-widest mb-4">AI Investigation Verdict</h2>
            <div className={`text-3xl font-black mb-1 tracking-tighter leading-none ${verdictColor} neon-text-glow`}>
              {caseData.verdict.verdict.replace(/_/g, ' ').toUpperCase()}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-muted font-bold uppercase">Confidence Score</span>
                <span className={`text-lg font-black font-mono ${verdictColor}`}>{caseData.verdict.confidence}%</span>
              </div>
              <div className="w-full bg-metal h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${caseData.verdict.confidence > 80 ? 'bg-neon' : 'bg-warning'}`}
                  style={{ width: `${caseData.verdict.confidence}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-panel-soft space-y-3">
              <EntityInfo icon={Monitor} label="Target Host" value={caseData.verdict.entities.host} />
              <EntityInfo icon={User} label="Subject User" value={caseData.verdict.entities.user || "Unknown"} />
              <EntityInfo icon={Globe} label="Source Network" value={caseData.verdict.entities.src_ip || "Internal"} />
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-panel border border-panel-soft p-6 rounded-lg cyber-border">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon" /> Remediation Plan
            </h3>
            <ul className="space-y-4">
              {caseData.verdict.recommended_actions.map((action: string, i: number) => (
                <li key={i} className="flex gap-3 group cursor-pointer">
                  <div className="mt-1 w-4 h-4 border border-neon/50 rounded flex items-center justify-center group-hover:bg-neon/10 transition-colors">
                    <CheckCircle2 className="w-3 h-3 text-neon opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-text/80 leading-relaxed group-hover:text-white transition-colors">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hypothesis Testing */}
          <div className="bg-panel border border-panel-soft p-6 rounded-lg cyber-border">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan" /> Hypothesis Testing
            </h3>
            <div className="space-y-4">
              {caseData.verdict.hypotheses.map((h: any, i: number) => (
                <div key={i} className="bg-metal/50 border border-panel-soft p-3 rounded space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">{h.name.replace(/_/g, ' ')}</span>
                    <StatusBadge status={h.status} />
                  </div>
                  <p className="text-[10px] text-muted leading-relaxed font-mono italic">"{h.reason}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Evidence */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Timeline */}
          <div className="bg-panel border border-panel-soft p-6 rounded-lg cyber-border relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Activity size={120} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neon" /> Incident Timeline
            </h3>
            <div className="space-y-0 ml-4 border-l-2 border-panel-soft relative">
              {caseData.timeline.map((event: any, i: number) => (
                <div key={i} className="relative pl-8 pb-8 last:pb-2">
                  <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-metal border-2 border-neon flex items-center justify-center shadow-neon-glow">
                    <div className="w-1.5 h-1.5 bg-neon rounded-full"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      <span className="text-[10px] font-black text-cyan uppercase tracking-widest">{event.type}</span>
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-neon transition-colors">{event.description}</div>
                    <div className="text-[9px] font-mono text-muted uppercase mt-1">EVIDENCE REF: {event.evidence_id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Package */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4 text-muted" /> Collected Evidence Package
              </h3>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{caseData.evidence.length} ARTIFACTS</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {caseData.evidence.map((ev: any) => (
                <div key={ev.id} className="bg-metal border border-panel-soft rounded-lg overflow-hidden transition-all hover:border-panel-soft/80">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleEvidence(ev.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded bg-background border border-panel-soft group-hover:border-neon/30 transition-colors`}>
                        <Terminal className="w-4 h-4 text-muted group-hover:text-neon transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{ev.type}</span>
                          <span className="text-[10px] text-muted font-mono">{ev.source.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>
                      </div>
                    </div>
                    <button className="text-muted hover:text-white transition-colors">
                      {expandedEvidence[ev.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {expandedEvidence[ev.id] && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-background/50 border border-panel-soft rounded p-4 relative">
                        <div className="absolute top-2 right-2 text-[8px] text-muted font-bold uppercase tracking-widest">Raw Artifact JSON</div>
                        <pre className="text-[10px] font-mono text-muted overflow-x-auto max-h-60 custom-scrollbar pt-2">
                          {JSON.stringify(ev.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-panel border border-panel-soft p-8 rounded-lg cyber-border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 space-y-4">
                <h3 className="text-lg font-black text-white tracking-tight leading-none uppercase">Analyst <span className="text-neon">Feedback</span></h3>
                <p className="text-xs text-muted leading-relaxed">
                  Help improve the AI investigation model by rating the accuracy and depth of this verdict.
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className={`p-1.5 rounded transition-all ${feedback.rating >= star ? 'text-neon bg-neon/10 shadow-neon-glow' : 'text-muted bg-panel-soft hover:bg-panel-soft/80'}`}
                    >
                      <Star className={`w-5 h-5 ${feedback.rating >= star ? 'fill-neon' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleFeedback} className="flex-1 space-y-4">
                <div className="relative">
                  <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-muted" />
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    className="w-full bg-background border border-panel-soft rounded-lg p-3 pl-10 text-xs text-text outline-none focus:border-neon/50 transition-all min-h-[100px] font-mono resize-none"
                    placeholder="Provide additional context or corrections..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-neon text-background px-8 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-neon-soft transition-all shadow-neon-glow">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntityInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="p-2 rounded bg-metal border border-panel-soft group-hover:border-neon/30 transition-colors">
        <Icon className="w-4 h-4 text-muted group-hover:text-neon transition-colors" />
      </div>
      <div>
        <div className="text-[9px] text-muted font-bold uppercase tracking-widest">{label}</div>
        <div className="text-xs font-mono text-cyan truncate max-w-[180px]">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') return <span className="text-[9px] font-black text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/30 uppercase tracking-widest">Confirmed</span>;
  if (status === 'rejected') return <span className="text-[9px] font-black text-danger bg-danger/10 px-2 py-0.5 rounded border border-danger/30 uppercase tracking-widest">Rejected</span>;
  return <span className="text-[9px] font-black text-muted bg-panel-soft px-2 py-0.5 rounded border border-panel-soft uppercase tracking-widest">Pending</span>;
}
