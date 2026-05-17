import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { LogIn, Mail, Lock } from 'lucide-react';
import {
  TEAM_ADMINISTRATION_ID,
  TEAM_CONSULTANTS_ID,
} from '../utils/demoOrgState';

const Login: React.FC = () => {
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoRole, setDemoRole] = useState<'Owner' | 'Admin' | 'Employee'>('Employee');
  const [demoTeamId, setDemoTeamId] = useState(TEAM_CONSULTANTS_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      setError(null);
      setUser({
        id: 'demo-user',
        email: email || 'demo@example.com',
        full_name: 'Demo User',
        role: demoRole,
        teamId: demoTeamId,
      });
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <div className="glass-card w-full max-w-md p-8 fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
            <LogIn className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-center">Sign in to manage your attendance</p>
          {!isSupabaseConfigured && (
            <p className="text-slate-400 text-sm text-center mt-2">
              Demo mode active: any email/password will sign in locally.
            </p>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              className="input-field pl-12"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="password"
              className="input-field pl-12"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isSupabaseConfigured && (
            <div className="grid gap-4">
              <div>
                <label className="text-slate-400 text-sm">Demo Role</label>
                <select
                  className="input-field"
                  style={{ marginTop: 8 }}
                  value={demoRole}
                  onChange={(e) => setDemoRole(e.target.value as 'Owner' | 'Admin' | 'Employee')}
                >
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm">
                  Your team <span className="text-xs">(overtime only for Administration)</span>
                </label>
                <select
                  className="input-field"
                  style={{ marginTop: 8 }}
                  value={demoTeamId}
                  onChange={(e) => setDemoTeamId(e.target.value)}
                >
                  <option value={TEAM_CONSULTANTS_ID}>Consultants</option>
                  <option value={TEAM_ADMINISTRATION_ID}>Administration Team</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Powered by Antigravity Attendance System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
