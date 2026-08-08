import React, { useState } from 'react';
import { CalendarCheck, Plus, Trash2, Edit3, Save, X, Search, Filter } from 'lucide-react';
import { PMMasterlistItem, User } from '../types';

interface PMMasterlistViewProps {
  items: PMMasterlistItem[];
  currentUser: User | null;
  onUpdateItem: (id: number, data: Partial<PMMasterlistItem>) => Promise<void>;
  onAddItem: (data: Partial<PMMasterlistItem>) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
}

export const PMMasterlistView: React.FC<PMMasterlistViewProps> = ({
  items,
  currentUser,
  onUpdateItem,
  onAddItem,
  onDeleteItem
}) => {
  const isReadOnly = currentUser?.role === 'user';
  const [filterSystem, setFilterSystem] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newItem, setNewItem] = useState({
    equipment_name: '',
    system: 'HVAC',
    specs: '',
    location: '',
    jan: 'M', feb: 'M', mar: 'M', apr: 'M', may: 'M', jun: 'M',
    jul: 'M', aug: 'M', sep: 'M', oct: 'M', nov: 'M', dec: 'M'
  });

  const handleCellChange = (id: number, monthKey: keyof PMMasterlistItem, value: string) => {
    if (isReadOnly) return;
    onUpdateItem(id, { [monthKey]: value });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.equipment_name || !newItem.specs) return;
    await onAddItem(newItem);
    setShowAddModal(false);
    setNewItem({
      equipment_name: '',
      system: 'HVAC',
      specs: '',
      location: '',
      jan: 'M', feb: 'M', mar: 'M', apr: 'M', may: 'M', jun: 'M',
      jul: 'M', aug: 'M', sep: 'M', oct: 'M', nov: 'M', dec: 'M'
    });
  };

  const filteredItems = items.filter((item) => {
    if (filterSystem === 'ALL') return true;
    return item.system.toUpperCase() === filterSystem.toUpperCase();
  });

  const months: (keyof PMMasterlistItem)[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const getPMBadgeStyle = (val: string) => {
    switch (val) {
      case 'A':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/40 font-bold';
      case 'Q':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold';
      case 'S':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold';
      case 'M':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-900 text-slate-600 border-slate-800';
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-white">Preventive Maintenance Masterlist Matrix</h1>
            <p className="text-xs text-slate-400 font-mono">
              Annual PM schedule grid. Dropdowns permit setting M (Monthly), Q (Quarterly), S (Semi-Annual), A (Annually).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* System Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Systems</option>
              <option value="HVAC">HVAC</option>
              <option value="MECHANICAL">Mechanical</option>
              <option value="ELECTRICAL">Electrical</option>
            </select>
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/50"
            >
              <Plus className="w-4 h-4" /> Add Masterlist Item
            </button>
          )}
        </div>
      </div>

      {/* Legend & Key */}
      <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
        <span className="text-slate-400 font-bold uppercase">PM Codes Legend:</span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">M = Monthly</span>
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">Q = Quarterly</span>
        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">S = Semi-Annual</span>
        <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/40">A = Annually</span>
      </div>

      {/* MATRIX TABLE */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs font-mono border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <th className="p-3">System</th>
              <th className="p-3">Equipment</th>
              <th className="p-3">Specs</th>
              <th className="p-3">Location</th>
              <th className="p-2 text-center">Jan</th>
              <th className="p-2 text-center">Feb</th>
              <th className="p-2 text-center">Mar</th>
              <th className="p-2 text-center">Apr</th>
              <th className="p-2 text-center">May</th>
              <th className="p-2 text-center">Jun</th>
              <th className="p-2 text-center">Jul</th>
              <th className="p-2 text-center">Aug</th>
              <th className="p-2 text-center">Sep</th>
              <th className="p-2 text-center">Oct</th>
              <th className="p-2 text-center">Nov</th>
              <th className="p-2 text-center">Dec</th>
              {!isReadOnly && <th className="p-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 text-slate-400 font-semibold">{item.system}</td>
                <td className="p-3 text-emerald-400 font-bold">{item.equipment_name}</td>
                <td className="p-3 text-slate-300">{item.specs}</td>
                <td className="p-3 text-slate-400">{item.location}</td>

                {months.map((mKey) => {
                  const val = String(item[mKey] || 'M');
                  return (
                    <td key={mKey} className="p-1 text-center">
                      {isReadOnly ? (
                        <span className={`inline-block px-2 py-1 rounded text-center border ${getPMBadgeStyle(val)}`}>
                          {val}
                        </span>
                      ) : (
                        <select
                          value={val}
                          onChange={(e) => handleCellChange(item.id, mKey, e.target.value)}
                          className={`w-11 text-center p-1 rounded bg-slate-950 border uppercase cursor-pointer focus:outline-none ${getPMBadgeStyle(val)}`}
                        >
                          <option value="M">M</option>
                          <option value="Q">Q</option>
                          <option value="S">S</option>
                          <option value="A">A</option>
                          <option value="-">-</option>
                        </select>
                      )}
                    </td>
                  );
                })}

                {!isReadOnly && (
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition"
                      title="Delete masterlist row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MASTERLIST ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-white uppercase">Add New PM Masterlist Row</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={newItem.equipment_name}
                  onChange={(e) => setNewItem({ ...newItem, equipment_name: e.target.value })}
                  placeholder="e.g. Chiller-05"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">System</label>
                <select
                  value={newItem.system}
                  onChange={(e) => setNewItem({ ...newItem, system: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Specifications</label>
                <input
                  type="text"
                  value={newItem.specs}
                  onChange={(e) => setNewItem({ ...newItem, specs: e.target.value })}
                  placeholder="e.g. 200TR Daikin"
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
                  placeholder="e.g. Plant Room"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-bold font-mono uppercase"
                >
                  Save Masterlist Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
