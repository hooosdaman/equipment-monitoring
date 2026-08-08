import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  Edit,
  X,
  MapPin,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Zap,
  Wind,
  Snowflake,
  BatteryCharging,
  ArrowUpDown,
  Fan,
  Wrench
} from 'lucide-react';
import { Equipment, EquipmentIconType, EquipmentStatusType, User } from '../types';
import { EquipmentIcon } from './EquipmentIcon';

interface EquipmentStatusViewProps {
  equipmentList: Equipment[];
  currentUser: User | null;
  onAddEquipment: (data: Partial<Equipment>) => Promise<void>;
  onUpdateEquipment: (id: number, data: Partial<Equipment>) => Promise<void>;
  onDeleteEquipment: (id: number) => Promise<void>;
}

export const EquipmentStatusView: React.FC<EquipmentStatusViewProps> = ({
  equipmentList,
  currentUser,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}) => {
  const canModify = currentUser?.role !== 'user'; // Superuser, admin, engineer can add/edit/delete

  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);

  // Form states for Add / Edit
  const [system, setSystem] = useState('HVAC');
  const [equipmentName, setEquipmentName] = useState('');
  const [specs, setSpecs] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<EquipmentStatusType>('operational');
  const [icon, setIcon] = useState<EquipmentIconType>('generator');

  const openAddModal = () => {
    setSystem('HVAC');
    setEquipmentName('');
    setSpecs('');
    setLocation('');
    setStatus('operational');
    setIcon('generator');
    setEditingEq(null);
    setShowAddModal(true);
  };

  const openEditModal = (eq: Equipment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEq(eq);
    setSystem(eq.system);
    setEquipmentName(eq.equipment_name);
    setSpecs(eq.specs);
    setLocation(eq.location);
    setStatus(eq.status);
    setIcon(eq.icon);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName || !specs || !location) return;

    if (editingEq) {
      await onUpdateEquipment(editingEq.id, {
        system,
        equipment_name: equipmentName,
        specs,
        location,
        status,
        icon
      });
    } else {
      await onAddEquipment({
        system,
        equipment_name: equipmentName,
        specs,
        location,
        status,
        icon
      });
    }

    setShowAddModal(false);
    setEditingEq(null);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this equipment unit?')) {
      await onDeleteEquipment(id);
      if (selectedEq?.id === id) setSelectedEq(null);
    }
  };

  const iconOptions: { type: EquipmentIconType; label: string; iconComp: React.FC<{ className?: string }> }[] = [
    { type: 'generator', label: 'Generator', iconComp: Zap },
    { type: 'aircon', label: 'Aircon / SPU', iconComp: Wind },
    { type: 'chillers', label: 'Chillers', iconComp: Snowflake },
    { type: 'pumps', label: 'Pumps', iconComp: Activity },
    { type: 'ups', label: 'UPS Unit', iconComp: BatteryCharging },
    { type: 'elevator', label: 'Elevator', iconComp: ArrowUpDown },
    { type: 'cooling_tower', label: 'Cooling Tower', iconComp: Fan }
  ];

  const getStatusBadge = (st: EquipmentStatusType) => {
    switch (st) {
      case 'operational':
      case 'Good':
        return {
          label: 'OPERATIONAL',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          led: 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
        };
      case 'minor':
        return {
          label: 'MINOR DEFECT',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          led: 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
        };
      case 'critical':
        return {
          label: 'CRITICAL DOWN',
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          led: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-ping'
        };
      default:
        return {
          label: 'OPERATIONAL',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          led: 'bg-emerald-400'
        };
    }
  };

  const getCategoryKey = (eq: Equipment): string => {
    if (eq.icon && CATEGORIES[eq.icon]) return eq.icon;
    const nameLower = eq.equipment_name.toLowerCase();
    if (nameLower.includes('pump')) return 'pumps';
    if (nameLower.includes('chiller')) return 'chillers';
    if (nameLower.includes('aircon') || nameLower.includes('spu')) return 'aircon';
    if (nameLower.includes('generator') || nameLower.includes('gen')) return 'generator';
    if (nameLower.includes('ups')) return 'ups';
    if (nameLower.includes('elevator') || nameLower.includes('lift')) return 'elevator';
    if (nameLower.includes('tower')) return 'cooling_tower';
    return 'other';
  };

  const CATEGORIES: Record<string, {
    id: string;
    label: string;
    systemTag: string;
    borderColor: string;
    headerBg: string;
    badgeStyle: string;
    iconComp: React.FC<{ className?: string }>;
    accentColor: string;
  }> = {
    pumps: {
      id: 'pumps',
      label: 'Water & Circulation Pumps',
      systemTag: 'MECHANICAL SYSTEM',
      borderColor: 'border-emerald-500/40',
      headerBg: 'bg-emerald-950/40 border-b border-emerald-500/20 text-emerald-400',
      badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      iconComp: Activity,
      accentColor: 'text-emerald-400'
    },
    chillers: {
      id: 'chillers',
      label: 'Chiller Units',
      systemTag: 'HVAC SYSTEM',
      borderColor: 'border-cyan-500/40',
      headerBg: 'bg-cyan-950/40 border-b border-cyan-500/20 text-cyan-400',
      badgeStyle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      iconComp: Snowflake,
      accentColor: 'text-cyan-400'
    },
    aircon: {
      id: 'aircon',
      label: 'Air Conditioning & SPU Units',
      systemTag: 'HVAC SYSTEM',
      borderColor: 'border-sky-500/40',
      headerBg: 'bg-sky-950/40 border-b border-sky-500/20 text-sky-400',
      badgeStyle: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      iconComp: Wind,
      accentColor: 'text-sky-400'
    },
    generator: {
      id: 'generator',
      label: 'Generators & Standby Power',
      systemTag: 'ELECTRICAL SYSTEM',
      borderColor: 'border-amber-500/40',
      headerBg: 'bg-amber-950/40 border-b border-amber-500/20 text-amber-400',
      badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      iconComp: Zap,
      accentColor: 'text-amber-400'
    },
    ups: {
      id: 'ups',
      label: 'Uninterruptible Power Supply (UPS)',
      systemTag: 'ELECTRICAL SYSTEM',
      borderColor: 'border-purple-500/40',
      headerBg: 'bg-purple-950/40 border-b border-purple-500/20 text-purple-400',
      badgeStyle: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      iconComp: BatteryCharging,
      accentColor: 'text-purple-400'
    },
    elevator: {
      id: 'elevator',
      label: 'Elevators & Transport',
      systemTag: 'TRANSPORT SYSTEM',
      borderColor: 'border-orange-500/40',
      headerBg: 'bg-orange-950/40 border-b border-orange-500/20 text-orange-400',
      badgeStyle: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      iconComp: ArrowUpDown,
      accentColor: 'text-orange-400'
    },
    cooling_tower: {
      id: 'cooling_tower',
      label: 'Cooling Towers',
      systemTag: 'HVAC SYSTEM',
      borderColor: 'border-teal-500/40',
      headerBg: 'bg-teal-950/40 border-b border-teal-500/20 text-teal-400',
      badgeStyle: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      iconComp: Fan,
      accentColor: 'text-teal-400'
    },
    other: {
      id: 'other',
      label: 'General Facility Equipment',
      systemTag: 'AUXILIARY SYSTEM',
      borderColor: 'border-slate-700',
      headerBg: 'bg-slate-950/40 border-b border-slate-800 text-slate-300',
      badgeStyle: 'bg-slate-800 text-slate-300 border-slate-700',
      iconComp: Cpu,
      accentColor: 'text-slate-400'
    }
  };

  // Group equipment by category
  const groupedEquipment = equipmentList.reduce((acc, eq) => {
    const key = getCategoryKey(eq);
    if (!acc[key]) acc[key] = [];
    acc[key].push(eq);
    return acc;
  }, {} as Record<string, Equipment[]>);

  // Preferred category render order
  const categoryOrder = ['pumps', 'chillers', 'aircon', 'generator', 'ups', 'elevator', 'cooling_tower', 'other'];

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
<h1 className="text-lg font-bold font-mono text-white">Equipment Status</h1>
          </div>
        </div>

        {canModify && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/50"
          >
            <Plus className="w-4 h-4" /> Add New Equipment
          </button>
        )}
      </div>

      {/* STACKED EQUIPMENT TYPE BOXES */}
      <div className="space-y-6">
        {categoryOrder.map((catKey) => {
          const items = groupedEquipment[catKey];
          if (!items || items.length === 0) return null;
          const cat = CATEGORIES[catKey] || CATEGORIES.other;
          const CatIcon = cat.iconComp;

          return (
            <div
              key={catKey}
              className={`rounded-xl bg-slate-900/90 border ${cat.borderColor} shadow-xl overflow-hidden transition-all duration-200`}
            >
              {/* Category Box Header */}
              <div className={`p-3.5 px-5 flex items-center justify-between ${cat.headerBg}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md bg-slate-950/80 border border-slate-800 ${cat.accentColor}`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                      {cat.label}
                    </h2>
                    <span className="text-[10px] font-mono text-slate-400">{cat.systemTag}</span>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${cat.badgeStyle}`}>
                  {items.length} {items.length === 1 ? 'UNIT' : 'UNITS'}
                </span>
              </div>

              {/* Equipment Thumbnail Cards Grid inside Box */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {items.map((eq) => {
                  const badge = getStatusBadge(eq.status);
                  return (
                    <div
                      key={eq.id}
                      onClick={() => setSelectedEq(eq)}
                      className="group relative bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-3.5 flex flex-col items-center text-center cursor-pointer transition duration-200 shadow-md hover:shadow-emerald-950/40"
                    >
                      {/* Status LED indicator */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${badge.led}`} />
                      </div>

                      {/* Equipment Icon */}
                      <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40 flex items-center justify-center my-1.5 text-emerald-400 transition">
                        <EquipmentIcon type={eq.icon} className="w-5 h-5" />
                      </div>

                      {/* Title & Specs */}
                      <h3 className="text-xs font-mono font-bold text-white group-hover:text-emerald-400 transition truncate w-full">
                        {eq.equipment_name}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 truncate w-full mt-0.5">{eq.specs}</p>
                      <p className="text-[9px] font-mono text-slate-500 truncate w-full flex items-center justify-center gap-0.5 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0 inline" />
                        <span className="truncate">{eq.location}</span>
                      </p>

                      {/* Status Badge below */}
                      <div className="mt-2.5 w-full">
                        <span className={`inline-block w-full py-0.5 px-1 rounded text-[9px] font-mono font-bold tracking-wider uppercase border text-center ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Edit/Delete Overlay for authorized roles */}
                      {canModify && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 left-2 flex items-center gap-1 bg-slate-950/90 rounded p-0.5 border border-slate-800">
                          <button
                            onClick={(e) => openEditModal(eq, e)}
                            className="p-1 hover:text-emerald-400 text-slate-400"
                            title="Edit Equipment"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(eq.id, e)}
                            className="p-1 hover:text-red-400 text-slate-400"
                            title="Delete Equipment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* POP-UP MODAL WITH EQUIPMENT DETAILS ON CLICK */}
      {selectedEq && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedEq(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                <EquipmentIcon type={selectedEq.icon} className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{selectedEq.system} SYSTEM</span>
                <h2 className="text-xl font-mono font-bold text-white">{selectedEq.equipment_name}</h2>
                <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded uppercase mt-1 ${getStatusBadge(selectedEq.status).bg}`}>
                  {getStatusBadge(selectedEq.status).label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Specifications</div>
                <div className="font-bold text-slate-200 mt-0.5">{selectedEq.specs}</div>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Location</div>
                <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {selectedEq.location}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedEq(null)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-200 font-mono text-xs uppercase"
              >
                Close Pop-Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT EQUIPMENT MODAL WITH ICON SELECTOR */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-white uppercase">
                {editingEq ? `Edit Equipment: ${editingEq.equipment_name}` : 'Add New Equipment Unit'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="e.g. Generator-03"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">System Category</label>
                  <select
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EquipmentStatusType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="operational">Operational</option>
                    <option value="minor">Minor Defect</option>
                    <option value="critical">Critical Down</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Specifications</label>
                <input
                  type="text"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="e.g. 500kVA Diesel Standby"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Electrical Room"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              {/* ICON SELECTION */}
              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[11px]">Select Equipment Icon</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {iconOptions.map((opt) => {
                    const IconComp = opt.iconComp;
                    const isSelected = icon === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setIcon(opt.type)}
                        className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={opt.label}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[9px] truncate w-full text-center">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
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
                  {editingEq ? 'Update & Sync to Supabase' : 'Create & Sync to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
