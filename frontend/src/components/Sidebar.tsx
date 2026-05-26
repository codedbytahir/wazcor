"use client";
/*
Purpose: Sidebar navigation for WAZCOR SOC.
Ownership: Jules
Safety: UI Navigation.
*/
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Briefcase,
  Settings,
  Terminal,
  Activity
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Alert Queue", href: "/alerts", icon: ShieldAlert },
  { name: "Investigations", href: "/cases", icon: Briefcase },
  { name: "Diagnostics", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-metal border-r border-panel-soft flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-panel-soft bg-background/50">
        <div className="w-10 h-10 bg-neon/10 rounded flex items-center justify-center border border-neon/30 shadow-neon-glow">
          <Terminal className="text-neon w-6 h-6" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tighter text-white">WAZ<span className="text-neon">COR</span></span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></div>
            <span className="text-[10px] text-muted font-bold tracking-widest uppercase">System Active</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] text-muted font-bold tracking-widest uppercase px-3 mb-4">Operations</div>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group ${
                isActive
                  ? "bg-neon/10 text-neon border-l-2 border-neon shadow-neon-glow"
                  : "text-muted hover:text-neon-soft hover:bg-panel-soft"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-neon" : "group-hover:text-neon"}`} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-panel-soft bg-background/30">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-panel/50 border border-white/5">
          <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center border border-cyan/30">
            <Activity className="w-4 h-4 text-cyan" />
          </div>
          <div>
            <div className="text-[10px] text-muted font-bold uppercase tracking-tight">Node Status</div>
            <div className="text-xs text-cyan font-mono">wazcor-node-01</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
