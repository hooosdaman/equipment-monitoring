import React, { useState } from 'react';
import { Search, LogOut, Bell, Radio, CheckCircle, AlertOctagon, XCircle } from 'lucide-react';
import { User, DashboardMetrics } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  metrics: DashboardMetrics | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  searchQuery,
  setSearchQuery,
  metrics
}) => {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <header className="h-16 bg-slate-950/90 border-b border-slate-800/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
      {/* Top Search Bar */}
      <div className="flex-1 max-w-xl relative">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global Search: Query equipment, PM schedule, specs, locations, or defect logs..."
            className="w-full bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Forex Live Ticker Bar */}
      <div className="hidden lg:flex items-center gap-4 bg-slate-900/80 border border-slate-800/90 px-3 py-1.5 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider">OPERATION STATUS</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">
            HEALTH INDEX: <strong className="text-emerald-400">{metrics?.healthPercent ?? 100}%</strong>
          </span>
          <span className="text-slate-400">
            OPERATIONAL: <strong className="text-emerald-400">{metrics?.operationalCount ?? 26}</strong>
          </span>
          <span className="text-slate-400">
            MINOR: <strong className="text-amber-400">{metrics?.minorCount ?? 1}</strong>
          </span>
          <span className="text-slate-400">
            CRITICAL: <strong className="text-red-400">{metrics?.criticalCount ?? 0}</strong>
          </span>
        </div>
      </div>

      {/* User & Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon */}
        <button
          id="btn-notifications"
          onClick={() => setShowNotification(!showNotification)}
          className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title="Alerts Feed"
        >
          <Bell className="w-4 h-4" />
          {metrics && metrics.criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          )}
        </button>

        {/* User Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-slate-300 font-semibold uppercase">{currentUser?.username}</span>
        </div>

        {/* Logout Button */}
        <button
          id="btn-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
};
