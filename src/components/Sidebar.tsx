import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  CalendarCheck,
  Clock,
  Cpu,
  Users,
  Settings,
  Shield,
  Activity,
  TrendingUp
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const canSeeAccounts = currentUser?.role === 'superuser' || currentUser?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'need_action', label: 'Need Action', icon: AlertTriangle, badge: 'SYNC' },
    { id: 'defect_reports', label: 'Defect Reports', icon: FileText },
    { id: 'pm_masterlist', label: 'PM Masterlist', icon: CalendarCheck },
    { id: 'weekly_pm', label: 'Weekly PM', icon: Clock },
    { id: 'equipment_status', label: 'Equipment Status', icon: Cpu },
  ];

  if (canSeeAccounts) {
    menuItems.push({ id: 'accounts', label: 'Accounts', icon: Users });
  }

  if (currentUser?.role === 'superuser') {
    menuItems.push({ id: 'settings', label: 'Settings', icon: Settings });
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'superuser':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'admin':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'engineer':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0 text-slate-200">
      {/* Brand & Logo Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-slate-900/50">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 p-0.5 shadow-lg shadow-emerald-950/50">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wider text-white text-base font-mono">EQUIPMENT</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">PRO</span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-wider font-mono uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-400 inline" /> Asset Management
          </p>
        </div>
      </div>

      {/* Navigation Menu Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          Operation Status
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 text-emerald-400 border-l-2 border-emerald-400 shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="font-sans text-xs tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Role & System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate capitalize font-mono">{currentUser?.username}</p>
              <span className={`inline-block text-[10px] font-mono font-medium border px-1.5 rounded-full capitalize ${getRoleBadgeColor(currentUser?.role)}`}>
                {currentUser?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 px-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE FEED
          </span>
          <span>SQLite / Supabase</span>
        </div>
      </div>
    </aside>
  );
};
