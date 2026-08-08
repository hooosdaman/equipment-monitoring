import React, { useState } from 'react';
import { Users, Shield, Edit3, Lock, CheckCircle2, X } from 'lucide-react';
import { User } from '../types';

interface AccountsViewProps {
  accounts: User[];
  currentUser: User | null;
  onUpdateAccount: (id: number, username: string, password?: string) => Promise<void>;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts, currentUser, onUpdateAccount }) => {
  const [editingAcc, setEditingAcc] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

const canEditRole = (targetRole: string) => {
    if (currentUser?.role === 'superuser') return true;
    if (currentUser?.role === 'admin') {
      return targetRole === 'admin' || targetRole === 'engineer' || targetRole === 'user';
    }
    return false;
  };

  const handleEditClick = (acc: User) => {
    setEditingAcc(acc);
    setNewUsername(acc.username);
    setNewPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcc) return;

    setErrorMsg('');
    setSuccessMsg('');
    try {
      await onUpdateAccount(editingAcc.id, newUsername, newPassword);
      setSuccessMsg(`Account ${editingAcc.username} updated successfully!`);
      setEditingAcc(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed updating account credentials.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-white">Accounts & Role Permissions</h1>
            <p className="text-xs text-slate-400 font-mono">
Role permissions: <strong className="text-amber-400">Superuser</strong> edits all accounts; <strong className="text-emerald-400">Admin</strong> edits Admin, Engineer & User credentials.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* ACCOUNTS TABLE */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <th className="p-3">User ID</th>
              <th className="p-3">Username</th>
              <th className="p-3">Role Title</th>
              <th className="p-3">Permissions Scope</th>
              <th className="p-3 text-center">Edit Credentials</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {accounts.map((acc) => {
              const editable = canEditRole(acc.role);
              return (
                <tr key={acc.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-slate-500 font-bold">#{acc.id}</td>
                  <td className="p-3 font-bold text-white font-mono">{acc.username}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      acc.role === 'superuser' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      acc.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      acc.role === 'engineer' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                      'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    }`}>
                      {acc.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    {acc.role === 'superuser' && 'Full System Control + Settings + All Accounts'}
{acc.role === 'admin' && 'Equipment Edit + PM + Admin, Engineer & User Accounts'}
                    {acc.role === 'engineer' && 'Equipment Edit + PM + Defect Logging'}
                    {acc.role === 'user' && 'Helpdesk Read-Only Equipment + Defect/Need Action Log'}
                  </td>
                  <td className="p-3 text-center">
                    {editable ? (
                      <button
                        onClick={() => handleEditClick(acc)}
                        className="px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1 mx-auto transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit User
                      </button>
                    ) : (
                      <span className="text-slate-600 italic text-[10px]">Restricted</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT USER CREDENTIALS MODAL */}
      {editingAcc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-white uppercase">
                Edit Credentials for {editingAcc.username}
              </h3>
              <button onClick={() => setEditingAcc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">New Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAcc(null)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-bold uppercase"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
