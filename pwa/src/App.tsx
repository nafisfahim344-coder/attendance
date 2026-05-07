import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const store = useAuthStore();
  // FOR PREVIEW: Use mock user
  const user = store.user || { id: '1', full_name: 'Jane Doe', role: 'Operations', email: 'jane@example.com' };
  const { loading, setLoading } = store;

  useEffect(() => {
    setLoading(false); // Skip loading for preview
    /* 
    supabase.auth.getSession().then(({ data: { session } }) => {
      ... (original logic)
    });
    */
  }, [setLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
