import React, { useState } from 'react';
import { Fish, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required.'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-aqua-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-aqua-500/15 border border-aqua-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-aqua-500/10">
            <Fish className="w-7 h-7 text-aqua-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AquaMonitor</h1>
          <p className="text-gray-400 text-sm mt-1">Smart Aquaponics Dashboard</p>
        </div>

        {/* Card */}
        <div className="card border-gray-800/80 shadow-2xl">
          {/* Tab switcher */}
          <div className="flex bg-gray-800/60 rounded-xl p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  mode === m ? 'bg-aqua-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="John Farmer"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-aqua-500/60 focus:ring-1 focus:ring-aqua-500/30 transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-aqua-500/60 focus:ring-1 focus:ring-aqua-500/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-aqua-500/60 focus:ring-1 focus:ring-aqua-500/30 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800/40 text-red-400 text-sm animate-slide-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Default: <span className="font-mono text-gray-400">admin@aquamonitor.local</span> / <span className="font-mono text-gray-400">aqua1234</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
