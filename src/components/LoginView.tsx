import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, User, ArrowRight, TrendingUp } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, pass: string, remember: boolean) => Promise<void>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await onLogin(username, password, rememberMe);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid Pattern & Glowing Forex Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Terminal Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-emerald-950/50 mb-4 p-1">
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-wider text-white">EQUIPMENT STATUS</h1>
          <p className="text-xs font-mono text-slate-400 mt-1 flex items-center justify-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Maintenance & Equipment Monitoring Terminal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl shadow-black/80 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-sm font-mono font-semibold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Terminal Sign-In
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              ONLINE
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. superadmin or SUPERADMIN"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="login-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span>Remember Me</span>
              </label>
              <span className="text-[11px] text-slate-500">Case Insensitive Login</span>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-mono font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition duration-150 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <span>Sign In To Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        <p className="text-center text-[11px] text-slate-500 font-mono mt-4">
          Equipment Status SaaS Node Service • Powered by SQLite & Supabase Sync
        </p>
      </div>
    </div>
  );
};
