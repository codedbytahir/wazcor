"use client";
/*
Purpose: Case list page for WAZCOR.
Ownership: Jules
Safety: Overview of all historical investigations.
*/
import { useEffect, useState } from "react";
import { fetchCases } from "@/lib/api";
import Link from "next/link";

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases().then(data => {
      setCases(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-neon">Loading cases...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neon">Investigation Cases</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.length === 0 ? (
          <p className="text-muted">No investigations yet.</p>
        ) : (
          cases.map((c) => (
            <Link href={`/cases/${c.id}`} key={c.id}>
              <div className="bg-panel border border-panel-soft p-6 rounded-lg hover:border-neon transition cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-muted">{c.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.verdict.confidence > 80 ? 'bg-neon/10 text-neon' : 'bg-warning/10 text-warning'}`}>
                    {c.verdict.confidence}% CONFIDENCE
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{c.verdict.verdict.replace(/_/g, ' ').toUpperCase()}</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted">Host:</span> <span>{c.verdict.entities.host}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Created:</span> <span>{new Date(c.created_at).toLocaleDateString()}</span></div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
