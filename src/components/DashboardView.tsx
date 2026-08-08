import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Clock,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Search,
  FileText,
  MapPin,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { DashboardMetrics, DefectReport, Equipment, NeedActionItem } from '../types';
import { EquipmentIcon } from './EquipmentIcon';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  pendingDefects: DefectReport[];
  searchQuery: string;
  searchResults: {
    equipment: Equipment[];
    defects: DefectReport[];
    needAction: NeedActionItem[];
  } | null;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  pendingDefects,
  searchQuery,
  searchResults,
  onNavigateTab
}) => {
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              TERMINAL ANALYTICS
            </span>
            <span className="text-xs font-mono text-slate-500">REALTIME METRICS FEED</span>
          </div>
          <h1 className="text-xl font-bold font-mono text-white mt-1">Forex Equipment Status Dashboard</h1>
          <p className="text-xs text-slate-400">
            Real-time monitoring of monthly PM completion, equipment health indices, and defect logs.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase">Monthly PM Rate</div>
            <div className="text-lg font-bold text-cyan-400">{metrics?.pmCompletionRate ?? 85}%</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase">Health Index</div>
            <div className="text-lg font-bold text-emerald-400">{metrics?.healthPercent ?? 100}%</div>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS OVERLAY (WHEN SEARCHING AT TOP) */}
      {isSearchActive && searchResults && (
        <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-2">
              <Search className="w-4 h-4" /> Search Query Results for &quot;{searchQuery}&quot;
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Found {searchResults.equipment.length} equipment, {searchResults.defects.length} defects, {searchResults.needAction.length} need-action items
            </span>
          </div>

          {/* Equipment Search Matches */}
          {searchResults.equipment.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-semibold text-slate-400 mb-2 uppercase">Matching Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.equipment.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => onNavigateTab('equipment_status')}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-slate-900 text-emerald-400">
                        <EquipmentIcon type={eq.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-white">{eq.equipment_name}</div>
                        <div className="text-[10px] text-slate-400">{eq.specs} • {eq.location}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                      eq.status === 'operational' || eq.status === 'Good' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      eq.status === 'minor' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {eq.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Defects Search Matches */}
          {searchResults.defects.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-semibold text-slate-400 mb-2 uppercase">Matching Defect Reports</h3>
              <div className="space-y-2">
                {searchResults.defects.map((def) => (
                  <div key={def.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{def.equipment_name}</span>: {def.findings}
                      <div className="text-[10px] text-slate-500">{def.date_reported} • Attended by {def.attended_by}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{def.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.equipment.length === 0 && searchResults.defects.length === 0 && searchResults.needAction.length === 0 && (
            <p className="text-xs font-mono text-slate-500 py-4 text-center">No matching records found across equipment, defects, or actions.</p>
          )}
        </div>
      )}

      {/* FOREX METRICS HIGH-DENSITY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Equipment Health Index */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Health Index</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-mono font-bold text-white">{metrics?.healthPercent ?? 100}%</div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> OPTIMAL
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
              style={{ width: `${metrics?.healthPercent ?? 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            {metrics?.operationalCount ?? 0} Operational / {metrics?.totalEquipment ?? 0} Total Units
          </p>
        </div>

        {/* Card 2: Monthly PM Completion Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">PM Completion Rate</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-mono font-bold text-white">{metrics?.pmCompletionRate ?? 85}%</div>
            <span className="text-[10px] font-mono text-cyan-400">ON SCHEDULE</span>
          </div>
          <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${metrics?.pmCompletionRate ?? 85}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            Derived from current month maintenance masterlist
          </p>
        </div>

        {/* Card 3: Defect Report Status Breakdown */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Defect Status</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between font-mono">
            <div>
              <span className="text-xl font-bold text-amber-400">{metrics?.defectCounts?.open ?? 0}</span>
              <span className="text-xs text-slate-500 ml-1">Open</span>
            </div>
            <div>
              <span className="text-xl font-bold text-cyan-400">{metrics?.defectCounts?.ongoing ?? 0}</span>
              <span className="text-xs text-slate-500 ml-1">Ongoing</span>
            </div>
            <div>
              <span className="text-xl font-bold text-emerald-400">{metrics?.defectCounts?.done ?? 0}</span>
              <span className="text-xs text-slate-500 ml-1">Done</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-3">
            Total Logs: {metrics?.defectCounts?.total ?? 0} active & historical
          </p>
        </div>

        {/* Card 4: Equipment Breakdown (Minor & Critical) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Equipment Risk</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 w-1/2 mr-1">
              <div className="text-[10px] text-slate-500">MINOR</div>
              <div className="text-lg font-bold text-amber-400">{metrics?.minorCount ?? 0}</div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 w-1/2 ml-1">
              <div className="text-[10px] text-slate-500">CRITICAL</div>
              <div className="text-lg font-bold text-red-400">{metrics?.criticalCount ?? 0}</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            Automated status based on repair logs
          </p>
        </div>
      </div>

      {/* FOREX STYLE GRAPHICAL METRICS VISUALIZER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Bar Chart / Equipment Health Matrix */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-mono font-bold text-slate-200 uppercase">
                System Category Operational Status
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">HVAC • MECHANICAL • ELECTRICAL</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">HVAC Systems (Chillers, SPU Aircons, Towers)</span>
                <span className="text-emerald-400 font-bold">100% Operational</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded overflow-hidden flex border border-slate-800">
                <div className="bg-emerald-500 h-full w-[100%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Mechanical Systems (Pumps 01 - 06)</span>
                <span className="text-amber-400 font-bold">83% Operational (1 Minor Defect)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded overflow-hidden flex border border-slate-800">
                <div className="bg-emerald-500 h-full w-[83%]" />
                <div className="bg-amber-500 h-full w-[17%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Electrical Systems (Generators, UPS Units)</span>
                <span className="text-emerald-400 font-bold">100% Operational</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded overflow-hidden flex border border-slate-800">
                <div className="bg-emerald-500 h-full w-[100%]" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Need Quick Equipment Status Edit?</span>
            <button
              onClick={() => onNavigateTab('equipment_status')}
              className="px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold transition"
            >
              <span>View Equipment Grid</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" /> Maintenance Shortcuts
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Log new defect reports, request urgent actions, or update weekly PM schedules.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => onNavigateTab('defect_reports')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-mono text-slate-200 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Log New Defect Report</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => onNavigateTab('need_action')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-mono text-slate-200 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-cyan-400" />
                  <span>Log Need Action Complaint</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => onNavigateTab('weekly_pm')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-mono text-slate-200 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>View Weekly PM Schedule</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">SYSTEM ACTIVE:</span> Real-time asset monitoring and database synchronization online.
          </div>
        </div>
      </div>

      {/* PENDING DEFECT REPORTS AT BOTTOM */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Pending Defect Reports
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            {pendingDefects.length} ACTIVE DEFECTS
          </span>
        </div>

        {pendingDefects.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-lg border border-slate-800 text-slate-500 font-mono text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            All equipment defects have been attended and repaired. Zero pending reports!
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Date Reported</th>
                  <th className="p-3">Findings</th>
                  <th className="p-3">Attended By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingDefects.map((defect) => (
                  <tr key={defect.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-emerald-400">{defect.equipment_name}</td>
                    <td className="p-3 text-slate-300">{defect.date_reported}</td>
                    <td className="p-3 text-slate-200 max-w-xs truncate">{defect.findings}</td>
                    <td className="p-3 text-slate-300">{defect.attended_by}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        defect.status === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        defect.status === 'Minor' || defect.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {defect.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 italic max-w-xs truncate">{defect.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
