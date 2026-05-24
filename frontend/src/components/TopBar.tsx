"use client";
/*
Purpose: Top status bar for WAZCOR SOC.
Ownership: Jules
Safety: UI Information.
*/
import {
  Bell,
  Search,
  User,
  Cpu,
  Globe,
  Lock
} from "lucide-react";

export default function TopBar() {
  return (
    <header className="h-16 border-b border-panel-soft bg-metal/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-neon transition-colors" />
          <input
            type="text"
            placeholder="Search alerts, cases, or IOCs..."
            className="bg-panel-soft border border-white/5 rounded-full pl-10 pr-4 py-1.5 text-xs w-64 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 border-l border-panel-soft pl-6">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-muted" />
            <span className="text-[10px] text-muted font-bold">HQ-INTERNAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-muted" />
            <span className="text-[10px] text-muted font-bold">V-NODE: 104</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-danger/10 border border-danger/20">
          <Lock className="w-3.5 h-3.5 text-danger animate-pulse" />
          <span className="text-[10px] text-danger font-bold uppercase tracking-wider">Secure Channel</span>
        </div>

        <button className="p-2 text-muted hover:text-neon transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-metal"></span>
        </button>

        <div className="h-8 w-px bg-panel-soft"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <div className="text-xs font-bold text-white leading-none">ANALYST-01</div>
            <div className="text-[10px] text-neon font-mono uppercase tracking-tighter">L3 COMMANDER</div>
          </div>
          <div className="w-9 h-9 rounded bg-panel border border-neon/20 flex items-center justify-center text-neon shadow-neon-glow">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
