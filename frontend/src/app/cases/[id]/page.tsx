"use client";
/*
Purpose: Case Detail page for WAZCOR.
Ownership: Jules
Safety: Deep dive into investigation results.
*/
import { useEffect, useState } from "react";
import { fetchCase, submitFeedback, fetchReport } from "@/lib/api";
import { useParams } from "next/navigation";

export default function CaseDetailPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    if (id) {
      fetchCase(id as string).then(data => {
        setCaseData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback(id as string, { ...feedback, analyst_id: "ANALYST-01" });
    alert("Feedback submitted!");
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

  if (loading) return <div className="text-neon">Loading investigation...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar: Verdict & Summary */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-panel border-2 border-neon p-6 rounded-lg neon-glow">
          <h2 className="text-muted text-sm uppercase mb-2">AI Verdict</h2>
          <div className="text-2xl font-bold text-neon mb-1">
            {caseData.verdict.verdict.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-full bg-metal h-2 rounded-full overflow-hidden">
              <div className="bg-neon h-full" style={{ width: `${caseData.verdict.confidence}%` }}></div>
            </div>
            <span className="text-sm font-bold">{caseData.verdict.confidence}%</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Host:</span> <span className="text-cyan">{caseData.verdict.entities.host}</span></div>
            <div className="flex justify-between"><span className="text-muted">User:</span> <span className="text-cyan">{caseData.verdict.entities.user}</span></div>
            <div className="flex justify-between"><span className="text-muted">Source IP:</span> <span className="text-cyan">{caseData.verdict.entities.src_ip}</span></div>
          </div>
        </div>

        <div className="bg-panel border border-panel-soft p-6 rounded-lg">
          <h3 className="text-sm font-bold uppercase mb-4">Recommended Actions</h3>
          <ul className="space-y-3 text-sm">
            {caseData.verdict.recommended_actions.map((action: string, i: number) => (
              <li key={i} className="flex gap-2">
                <input type="checkbox" className="mt-1 accent-neon" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content: Timeline & Evidence */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Investigation: <span className="text-muted">{id}</span></h1>
          <button onClick={handleExport} className="bg-panel-soft border border-neon text-neon px-4 py-2 rounded text-sm font-bold hover:bg-neon hover:text-background transition">
            Export Report
          </button>
        </div>

        {/* Timeline */}
        <div className="bg-panel border border-panel-soft p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Activity Timeline</h3>
          <div className="space-y-4 border-l-2 border-panel-soft ml-4 pl-6 relative">
            {caseData.timeline.map((event: any, i: number) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-neon border-4 border-panel"></div>
                <div className="text-xs text-muted mb-1">{new Date(event.timestamp).toLocaleTimeString()}</div>
                <div className="font-bold text-sm">{event.type.toUpperCase()}</div>
                <p className="text-sm text-text/80">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseData.evidence.map((ev: any) => (
            <div key={ev.id} className="bg-metal border border-panel-soft p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-cyan bg-cyan/10 px-2 py-0.5 rounded">{ev.type.toUpperCase()}</span>
                <span className="text-xs text-muted">{ev.source}</span>
              </div>
              <p className="text-sm mb-2">{ev.description}</p>
              <pre className="text-[10px] bg-background p-2 rounded overflow-x-auto text-muted">
                {JSON.stringify(ev.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleFeedback} className="bg-panel border border-panel-soft p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Analyst Feedback</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Rating</label>
              <select
                value={feedback.rating}
                onChange={(e) => setFeedback({ ...feedback, rating: parseInt(e.target.value) })}
                className="w-full bg-metal border border-panel-soft p-2 rounded text-text outline-none focus:border-neon"
              >
                <option value="5">5 - Highly Accurate</option>
                <option value="4">4 - Accurate</option>
                <option value="3">3 - Neutral</option>
                <option value="2">2 - Inaccurate</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Comment</label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                className="w-full bg-metal border border-panel-soft p-2 rounded text-text outline-none focus:border-neon h-24"
                placeholder="What could be improved?"
              ></textarea>
            </div>
            <button type="submit" className="bg-neon text-background px-6 py-2 rounded font-bold hover:bg-neon-soft transition">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
