import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { MapPin, Clock, Calendar, LogOut, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<'IDLE' | 'CLOCKING' | 'SUCCESS'>('IDLE');
  const [lastAttendance, setLastAttendance] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLastAttendance();
    return () => clearInterval(timer);
  }, []);

  const fetchLastAttendance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    setLastAttendance(data);
  };

  const handleClockAction = async () => {
    setStatus('CLOCKING');
    
    // Get Geolocation
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setStatus('IDLE');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      const { error } = await supabase.from('attendance').insert({
        employee_id: user?.id,
        check_in: new Date().toISOString(),
        latitude,
        longitude,
        status: 'PRESENT'
      });

      if (error) {
        alert('Error: ' + error.message);
        setStatus('IDLE');
      } else {
        setStatus('SUCCESS');
        fetchLastAttendance();
        setTimeout(() => setStatus('IDLE'), 3000);
      }
    }, (error) => {
      alert('Error getting location: ' + error.message);
      setStatus('IDLE');
    });
  };

  return (
    <div className="container min-h-screen p-4 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">{user?.full_name}</h2>
            <p className="text-slate-400 text-sm">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            supabase.auth.signOut();
            logout();
          }}
          className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 flex flex-col items-center justify-center gap-4 fade-in">
          <div className="text-center">
            <h3 className="text-slate-400 font-medium mb-1 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(currentTime, 'EEEE, MMM do')}
            </h3>
            <h1 className="text-5xl font-bold text-white tracking-tighter">
              {format(currentTime, 'HH:mm:ss')}
            </h1>
          </div>

          <button
            onClick={handleClockAction}
            disabled={status !== 'IDLE'}
            className={`w-48 h-48 rounded-full border-8 transition-all flex flex-col items-center justify-center gap-2 ${
              status === 'SUCCESS' 
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' 
                : 'border-blue-600 bg-blue-600/10 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {status === 'CLOCKING' ? (
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : status === 'SUCCESS' ? (
              <>
                <CheckCircle2 className="w-16 h-16" />
                <span className="font-bold">Success</span>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-blue-500" />
                <span className="font-bold text-xl">Clock In</span>
              </>
            )}
          </button>
          
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Within authorized zone
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-white font-semibold mb-4">Last Activity</h3>
            {lastAttendance ? (
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Clocked In</p>
                    <p className="text-slate-400 text-xs">
                      {format(new Date(lastAttendance.check_in), 'MMM do, HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="text-emerald-500 font-bold">Present</div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No recent activity found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
