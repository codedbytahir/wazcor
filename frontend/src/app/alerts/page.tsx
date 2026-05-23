"use client";
/*
Purpose: Alert Queue page for WAZCOR.
Ownership: Jules
Safety: Lists alerts and allows starting investigations.
*/
import { useEffect, useState } from "react";
import { fetchAlerts, createInvestigation } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAlerts().then(data => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  const handleInvestigate = async (alertId: string) => {
    const caseData = await createInvestigation(alertId);
    router.push(`/cases/${caseData.id}`);
  };

  if (loading) return <div className="text-neon">Loading alerts...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neon">Alert Queue</h1>
      <div className="overflow-x-auto bg-panel border border-panel-soft rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-metal text-muted uppercase text-xs">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Description</th>
              <th className="p-4">Host</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-soft">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-panel-soft transition">
                <td className="p-4 text-sm">{new Date(alert.timestamp).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${alert.severity >= 5 ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                    Level {alert.severity}
                  </span>
                </td>
                <td className="p-4">{alert.description}</td>
                <td className="p-4 text-cyan">{alert.host}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleInvestigate(alert.id)}
                    className="bg-neon text-background px-3 py-1 rounded text-sm font-bold hover:bg-neon-soft transition"
                  >
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
