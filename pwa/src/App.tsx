import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        const metadata = session.user.user_metadata ?? {};
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: metadata.full_name ?? metadata.name ?? session.user.email ?? 'User',
          role: metadata.role ?? 'Employee',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata ?? {};
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: metadata.full_name ?? metadata.name ?? session.user.email ?? 'User',
          role: metadata.role ?? 'Employee',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div
            className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mb-4"
            style={{ margin: '0 auto 1rem' }}
          />
          <p className="text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
