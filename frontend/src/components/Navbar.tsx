"use client";
/*
Purpose: Layout component for WAZCOR dashboard.
Ownership: Jules
Safety: Standard UI layout.
*/
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text font-mono">
      <nav className="border-b border-panel-soft bg-metal p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-neon">
            WAZCOR
          </Link>
          <div className="space-x-6">
            <Link href="/dashboard" className="hover:text-neon transition">Dashboard</Link>
            <Link href="/alerts" className="hover:text-neon transition">Alerts</Link>
            <Link href="/cases" className="hover:text-neon transition">Cases</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
