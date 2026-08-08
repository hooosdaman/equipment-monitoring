import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Key, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface SettingsViewProps {
  currentUser: User | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const isSuperUser = currentUser?.role === 'superuser';
  const [settingsData, setSettingsData] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isSuperUser) {
      const token = localStorage.getItem('token');
      fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setSettingsData(data))
        .catch((err) => console.error('Failed fetching settings:', err));
    }
  }, [isSuperUser]);

  const handleTestN8n = async () => {
    setLoading(true);
    setTestResult('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/n8n-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setTestResult(data.message || 'n8n Webhook alert test sent successfully!');
    } catch (err: any) {
      setTestResult('n8n Test Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperUser) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-red-500/30 text-center font-mono space-y-3">
        <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-red-400">Restricted Area</h2>
        <p className="text-xs text-slate-400">Settings and n8n details are accessible exclusively by the Superuser role.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-white">System Settings & n8n Integration</h1>
            <p className="text-xs text-slate-400 font-mono">
              API Keys, Database Paths, Supabase connection, and n8n automated webhook triggers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* DATABASE & SYSTEM CONFIG */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Database & Environment
          </h2>

          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">SQLite DB Path</span>
              <code className="text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 block mt-1">
                {settingsData?.dbPath || '/var/data/smartinventory.db'}
              </code>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Supabase Service URL</span>
              <code className="text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 block mt-1">
                {settingsData?.supabaseUrl || 'https://magiaognakiosojtubkh.supabase.co'}
              </code>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Node Environment</span>
              <span className="text-slate-200 font-bold">{settingsData?.nodeEnv || 'production'}</span>
            </div>
          </div>
        </div>

        {/* n8n AUTOMATION WEBHOOK */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" /> n8n Automation Webhook
          </h2>

          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Webhook Endpoint</span>
              <code className="text-amber-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 block mt-1 truncate">
                {settingsData?.n8nWebhookUrl || 'https://n8n.internal.automation/webhook/equipment-status'}
              </code>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Automation Status</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {settingsData?.n8nStatus || 'Active'}
              </span>
            </div>

            <button
              onClick={handleTestN8n}
              disabled={loading}
              className="mt-2 w-full py-2.5 px-4 rounded bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold uppercase flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Dispatching...' : 'Dispatch Test Alert Payload'}</span>
            </button>

            {testResult && (
              <div className="p-3 rounded bg-slate-950 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
