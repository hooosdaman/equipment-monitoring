import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar, Plus, UserCheck } from 'lucide-react';
import { WeeklyPmItem, WeeklyPmStatus } from '../types';

interface WeeklyPmViewProps {
  schedule: WeeklyPmItem[];
  onUpdateStatus: (id: number, status: WeeklyPmStatus) => Promise<void>;
  onAddSchedule: (data: Partial<WeeklyPmItem>) => Promise<void>;
}

export const WeeklyPmView: React.FC<WeeklyPmViewProps> = ({ schedule, onUpdateStatus, onAddSchedule }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    equipment_name: '',
    system: 'HVAC',
    location: '',
    pm_type: 'Monthly PM Routine Inspection',
    scheduled_date: new Date().toISOString().split('T')[0],
    week_number: 32,
    assigned_to: 'Maintenance Engineer',
    status: 'scheduled' as WeeklyPmStatus
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.equipment_name || !newItem.location) return;
    await onAddSchedule(newItem);
    setShowAddModal(false);
    setNewItem({
      equipment_name: '',
      system: 'HVAC',
      location: '',
      pm_type: 'Monthly PM Routine Inspection',
      scheduled_date: new Date().toISOString().split('T')[0],
      week_number: 32,
      assigned_to: 'Maintenance Engineer',
      status: 'scheduled'
    });
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-white">Weekly PM Maintenance Schedule</h1>
            <p className="text-xs text-slate-400 font-mono">
              Track and update weekly preventive maintenance tasks across facility assets.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" /> Schedule New PM Task
        </button>
      </div>

      {/* SCHEDULE TABLE */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs font-mono border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <th className="p-3">Equipment</th>
              <th className="p-3">System</th>
              <th className="p-3">Location</th>
              <th className="p-3">PM Task Type</th>
              <th className="p-3">Scheduled Date</th>
              <th className="p-3">Assigned Technician</th>
              <th className="p-3">Status Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {schedule.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 text-emerald-400 font-bold">{item.equipment_name}</td>
                <td className="p-3 text-slate-300">{item.system}</td>
                <td className="p-3 text-slate-400">{item.location}</td>
                <td className="p-3 text-slate-200">{item.pm_type}</td>
                <td className="p-3 text-slate-300 font-semibold">{item.scheduled_date} (W{item.week_number})</td>
                <td className="p-3 text-slate-300">{item.assigned_to}</td>
                <td className="p-3">
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value as WeeklyPmStatus)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded bg-slate-950 border uppercase cursor-pointer focus:outline-none ${
                      item.status === 'completed'
                        ? 'text-emerald-400 border-emerald-500/30'
                        : item.status === 'cancelled'
                        ? 'text-red-400 border-red-500/30'
                        : 'text-amber-400 border-amber-500/30'
                    }`}
                  >
                    <option value="scheduled">SCHEDULED</option>
                    <option value="completed">COMPLETED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SCHEDULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-mono font-bold text-white uppercase border-b border-slate-800 pb-3">
              Add Weekly PM Schedule Item
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={newItem.equipment_name}
                  onChange={(e) => setNewItem({ ...newItem, equipment_name: e.target.value })}
                  placeholder="e.g. Pump-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">System</label>
                <input
                  type="text"
                  value={newItem.system}
                  onChange={(e) => setNewItem({ ...newItem, system: e.target.value })}
                  placeholder="e.g. Mechanical"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  placeholder="e.g. Rooftop"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PM Task Type</label>
                <input
                  type="text"
                  value={newItem.pm_type}
                  onChange={(e) => setNewItem({ ...newItem, pm_type: e.target.value })}
                  placeholder="e.g. Annual Mechanical Seal Inspection"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={newItem.scheduled_date}
                  onChange={(e) => setNewItem({ ...newItem, scheduled_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Technician</label>
                <input
                  type="text"
                  value={newItem.assigned_to}
                  onChange={(e) => setNewItem({ ...newItem, assigned_to: e.target.value })}
                  placeholder="e.g. Engineer John"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-bold uppercase"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
