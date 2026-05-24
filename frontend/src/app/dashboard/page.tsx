"use client";
/*
Purpose: Dashboard page for WAZCOR.
Ownership: Jules
Safety: Summary view of SOC activity.
*/
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neon">SOC Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-panel border border-panel-soft p-6 rounded-lg">
          <h2 className="text-muted text-sm uppercase">Active Alerts</h2>
          <p className="text-4xl font-bold text-warning">2</p>
          <Link href="/alerts" className="text-neon text-sm hover:underline mt-4 block">View Queue →</Link>
        </div>
        <div className="bg-panel border border-panel-soft p-6 rounded-lg">
          <h2 className="text-muted text-sm uppercase">Open Cases</h2>
          <p className="text-4xl font-bold text-neon">0</p>
          <Link href="/cases" className="text-neon text-sm hover:underline mt-4 block">View Cases →</Link>
        </div>
        <div className="bg-panel border border-panel-soft p-6 rounded-lg">
          <h2 className="text-muted text-sm uppercase">Avg Investigation Time</h2>
          <p className="text-4xl font-bold text-cyan">45s</p>
        </div>
      </div>

      <div className="bg-metal border border-panel-soft p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Welcome to WAZCOR</h3>
        <p className="text-muted mb-6">AI-powered SOC investigation for Wazuh environments.</p>
        <Link href="/alerts" className="bg-neon text-background px-6 py-3 rounded-md font-bold hover:bg-neon-soft transition">
          Start Investigation
        </Link>
      </div>
    </div>
  );
}
