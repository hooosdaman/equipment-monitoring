import React, { useState } from 'react';
import { FileText, Plus, Upload, CheckCircle2, AlertOctagon, Wrench, Image as ImageIcon, Lock } from 'lucide-react';
import { DefectReport, DefectStatus, Equipment, User } from '../types';

interface DefectReportsViewProps {
  reports: DefectReport[];
  equipmentList: Equipment[];
  onSubmitReport: (data: Partial<DefectReport>) => Promise<void>;
  onUpdateStatus: (id: number, status: DefectStatus, remarks?: string) => Promise<void>;
  currentUser: User | null;
}

export const DefectReportsView: React.FC<DefectReportsViewProps> = ({
  reports,
  equipmentList,
  onSubmitReport,
  onUpdateStatus,
  currentUser
}) => {
  const isReadOnly = currentUser?.role === 'user';
  const canEditStatus = currentUser?.role === 'engineer' || currentUser?.role === 'admin' || currentUser?.role === 'superuser';
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);
  const [equipmentName, setEquipmentName] = useState(equipmentList[0]?.equipment_name || 'Chiller-01');
  const [findings, setFindings] = useState('');
  const [attendedBy, setAttendedBy] = useState('');
  const [status, setStatus] = useState<DefectStatus>('Minor');
  const [remarks, setRemarks] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
    if (!findings || !equipmentName) return;

    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      await onSubmitReport({
        date_reported: dateReported,
        equipment_name: equipmentName,
        findings,
        attended_by: attendedBy || 'Maintenance Engineer',
        status,
        remarks,
        photo_url: photoUrl
      });
      setFindings('');
      setRemarks('');
      setPhotoUrl('');
      setSuccessMsg(`Defect report logged & equipment status for ${equipmentName} updated automatically!`);
    } catch (err) {
      console.error('Failed logging defect report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-white">Defect Reports & Repair Logs</h1>
            <p className="text-xs text-slate-400 font-mono">
              Logging defect reports updates Repair Logs and automatically adjusts equipment operational status.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

{isReadOnly && (
        <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" /> You have <strong>view-only</strong> access to Defect Reports. Creating or editing defect logs requires an Admin or Engineer account.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LOG DEFECT REPORT FORM */}
        {!isReadOnly && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-mono font-bold text-white uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" /> Log Defect Report
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Date Reported</label>
              <input
                type="date"
                value={dateReported}
                onChange={(e) => setDateReported(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Equipment Unit</label>
              <select
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
              >
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.equipment_name}>
                    {eq.equipment_name} ({eq.specs} - {eq.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Findings / Problem Description</label>
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Observed defect, leakage, abnormal vibration, power trip..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Attended By</label>
              <input
                type="text"
                value={attendedBy}
                onChange={(e) => setAttendedBy(e.target.value)}
                placeholder="e.g. Engineer John / Tech Team"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Defect Severity / Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DefectStatus)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="Minor">Minor Defect (Equipment Warning)</option>
                <option value="Critical">Critical Defect (Equipment Offline/Down)</option>
                <option value="Ongoing">Ongoing Repair</option>
                <option value="Done">Done / Repaired (Restores Operational)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Action / Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Parts replaced, recommendations..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Attach Photo Evidence</label>
              <label className="cursor-pointer p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-center text-slate-400 text-[11px] flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{photoUrl ? 'Photo Uploaded' : 'Upload Inspection Photo'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photoUrl && (
                <img src={photoUrl} alt="Inspection preview" className="mt-2 w-full h-24 object-cover rounded border border-slate-800" />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold uppercase tracking-wider transition disabled:opacity-50"
            >
              {isSubmitting ? 'Logging...' : 'Submit Defect Report'}
            </button>
</form>
        </div>
        )}

        {/* REPAIR LOGS TABLE */}
        <div className={`${isReadOnly ? 'lg:col-span-3' : 'lg:col-span-2'} p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" /> Repair Logs ({reports.length})
            </h2>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="p-3">Date</th>
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Findings</th>
                  <th className="p-3">Attended By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3">Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-slate-300 font-bold whitespace-nowrap">{log.date_reported}</td>
                    <td className="p-3 text-emerald-400 font-bold whitespace-nowrap">{log.equipment_name}</td>
                    <td className="p-3 text-slate-200 max-w-xs">{log.findings}</td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">{log.attended_by}</td>
<td className="p-3">
                      {canEditStatus ? (
                        <select
                          value={log.status}
                          onChange={(e) => onUpdateStatus(log.id, e.target.value as DefectStatus)}
                          className={`text-[11px] font-bold px-2 py-1 rounded bg-slate-950 border uppercase cursor-pointer focus:outline-none ${
                            log.status === 'Critical' ? 'text-red-400 border-red-500/30' :
                            log.status === 'Minor' || log.status === 'Open' ? 'text-amber-400 border-amber-500/30' :
                            log.status === 'Ongoing' ? 'text-cyan-400 border-cyan-500/30' :
                            'text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          <option value="Minor">Minor Defect (Equipment Warning)</option>
                          <option value="Critical">Critical Defect (Equipment Offline/Down)</option>
                          <option value="Ongoing">Ongoing Repair</option>
                          <option value="Done">Done / Repaired (Restores Operational)</option>
                        </select>
                      ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.status === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        log.status === 'Minor' || log.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        log.status === 'Ongoing' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.status}
                      </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 italic max-w-xs">{log.remarks || '—'}</td>
                    <td className="p-3">
                      {log.photo_url ? (
                        <a href={log.photo_url} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> View
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
