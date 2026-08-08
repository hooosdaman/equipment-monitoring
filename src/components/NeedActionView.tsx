import React, { useState } from 'react';
import { AlertTriangle, Plus, CheckCircle, Upload, MapPin, Clock, Filter, Image as ImageIcon } from 'lucide-react';
import { NeedActionItem, NeedActionStatus } from '../types';

interface NeedActionViewProps {
  items: NeedActionItem[];
  onSubmitItem: (data: Partial<NeedActionItem>) => Promise<void>;
  onUpdateStatus: (id: number, status: NeedActionStatus, remarks?: string) => Promise<void>;
}

export const NeedActionView: React.FC<NeedActionViewProps> = ({ items, onSubmitItem, onUpdateStatus }) => {
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);
  const [reportedBy, setReportedBy] = useState('');
  const [complaint, setComplaint] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<NeedActionStatus>('open');
  const [remarks, setRemarks] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | NeedActionStatus>('all');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !location) return;

    setIsSubmitting(true);
    try {
      await onSubmitItem({
        date_reported: dateReported,
        reported_by: reportedBy || 'Staff User',
        complaint,
        location,
        status,
        remarks,
        photo_url: photoUrl
      });
      setComplaint('');
      setLocation('');
      setRemarks('');
      setPhotoUrl('');
    } catch (err) {
      console.error('Failed logging Need Action item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Page Title */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-white">Need Action Center</h1>
            <p className="text-xs text-slate-400 font-mono">
              Log and track facility complaints and issue items requiring maintenance action.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM TO LOG NEED ACTION ITEM */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-mono font-bold text-white uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> Log Need Action Complaint
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Date Reported</label>
              <input
                type="date"
                value={dateReported}
                onChange={(e) => setDateReported(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Reported By</label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="e.g. Helpdesk / Shift Lead"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Complaint / Issue</label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Detailed complaint or abnormality description..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Basement Pump Room, Plant Room"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NeedActionStatus)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="open">Open</option>
                <option value="ongoing">Ongoing</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Action taken or pending details..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Attach Photo</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-center text-slate-400 text-[11px] flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{photoUrl ? 'Photo Uploaded' : 'Choose Photo File'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              {photoUrl && (
                <div className="mt-2">
                  <img src={photoUrl} alt="Complaint preview" className="w-full h-24 object-cover rounded border border-slate-800" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold uppercase tracking-wider transition disabled:opacity-50"
            >
              {isSubmitting ? 'Logging...' : 'Submit Need Action Log'}
            </button>
          </form>
        </div>

        {/* NEED ACTION LOGS TABLE */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Need Action History ({filteredItems.length})
            </h2>

            {/* Status Filter */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded ${statusFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 bg-slate-950'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-2 py-1 rounded ${statusFilter === 'open' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-slate-400 bg-slate-950'}`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('ongoing')}
                className={`px-2 py-1 rounded ${statusFilter === 'ongoing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 bg-slate-950'}`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setStatusFilter('done')}
                className={`px-2 py-1 rounded ${statusFilter === 'done' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 bg-slate-950'}`}
              >
                Done
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="p-3">Date</th>
                  <th className="p-3">Reported By</th>
                  <th className="p-3">Complaint</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3">Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-slate-300 font-bold whitespace-nowrap">{item.date_reported}</td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">{item.reported_by}</td>
                    <td className="p-3 text-slate-200 max-w-xs">{item.complaint}</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{item.location}</td>
                    <td className="p-3">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value as NeedActionStatus)}
                        className={`text-[11px] font-bold px-2 py-1 rounded bg-slate-950 border uppercase cursor-pointer focus:outline-none ${
                          item.status === 'open' ? 'text-red-400 border-red-500/30' :
                          item.status === 'ongoing' ? 'text-amber-400 border-amber-500/30' :
                          'text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <option value="open">OPEN</option>
                        <option value="ongoing">ONGOING</option>
                        <option value="done">DONE</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-400 italic">{item.remarks || '—'}</td>
                    <td className="p-3">
                      {item.photo_url ? (
                        <a href={item.photo_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> Photo
                        </a>
                      ) : (
                        <span className="text-slate-600">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
