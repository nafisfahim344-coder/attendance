import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { LogIn, Mail, Lock, UserCircle } from 'lucide-react';
import { loadRoster, type DemoRosterEmployee } from '../utils/demoOrgState';

const Login: React.FC = () => {
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'credentials' | 'userSelect'>('userSelect');

  const roster = loadRoster();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      setError(null);
      setUser({
        id: 'demo-user',
        email: email || 'demo@example.com',
        full_name: 'Demo User',
        role: 'Employee',
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

  const handleDemoUserLogin = (employee: DemoRosterEmployee) => {
    setUser({
      id: employee.id,
      email: `${employee.name.toLowerCase().replace(' ', '.')}@example.com`,
      full_name: employee.name,
      role: employee.role,
      teamId: employee.teamId,
    });
  };

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <div className="glass-card w-full max-w-md p-8 fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
            <LogIn className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-center text-sm">Select a user to test roles, or use credentials.</p>
        </div>

        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${loginMode === 'userSelect' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setLoginMode('userSelect')}
          >
            Select User (Demo)
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${loginMode === 'credentials' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setLoginMode('credentials')}
          >
            Email Login
          </button>
        </div>

        {loginMode === 'userSelect' ? (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {roster.map(emp => (
              <button
                key={emp.id}
                type="button"
                onClick={() => handleDemoUserLogin(emp)}
                className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{emp.name}</p>
                    <p className="text-slate-400 text-xs">Role: {emp.role}</p>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  emp.role === 'Owner' ? 'bg-violet-500/20 text-violet-300' : 
                  emp.role === 'Admin' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
                }`}>
                  {emp.role}
                </div>
              </button>
            ))}
          </div>
        ) : (
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
        )}

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
