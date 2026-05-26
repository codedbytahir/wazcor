"use client";
/*
Purpose: New layout shell for WAZCOR.
Ownership: Jules
Safety: Standard UI layout.
*/
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-text font-mono selection:bg-neon selection:text-background">
      {/* Sidebar - fixed left */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar - sticky top */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 p-8 relative">
          <div className="scanline"></div>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer info */}
        <footer className="px-8 py-3 bg-metal/50 border-t border-panel-soft text-[10px] text-muted flex justify-between">
          <div>&copy; 2026 WAZCOR SECURITY OPERATIONS CENTER</div>
          <div className="flex gap-4">
            <span>SESSION: 2026-05-23-452-ALPHA</span>
            <span>Uptime: 14h 22m</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
