import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Download, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { exportToExcel } from '../utils/excelExport';

const History: React.FC = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Mock data for preview
      if (user.id === 'mock-user-id') {
        const today = new Date();
        const mockData = Array.from({ length: 5 }).map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          return {
            id: `mock-${i}`,
            date: dateStr,
            clock_in: `${dateStr}T09:00:00Z`,
            clock_out: `${dateStr}T18:00:00Z`,
            status: 'clocked_out',
            breaks: [{ id: `b-${i}`, duration_minutes: 60 }]
          };
        });
        setSessions(mockData);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*, breaks(*)')
        .eq('employee_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      if (data) setSessions(data);
    } catch (e) {
      console.error('History Fetch Error:', e);
      // For preview/mock purposes, if Supabase fails (e.g. no connection), we can show empty state
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!user || sessions.length === 0) return;
    
    const reportData = sessions.map(s => {
      const breakDur = s.breaks?.reduce((acc: number, b: any) => acc + (b.duration_minutes || 0), 0) || 0;
      return {
        date: s.date,
        day: format(new Date(s.date), 'EEEE'),
        branch: 'Main Office',
        clockIn: s.clock_in ? format(new Date(s.clock_in), 'HH:mm') : '-',
        clockOut: s.clock_out ? format(new Date(s.clock_out), 'HH:mm') : '-',
        breakDuration: `${breakDur.toFixed(1)}m`,
        workedHours: s.clock_out ? '8.5h' : '-',
        overtimeHours: '0h',
        flags: [],
        isFriday: false
      };
    });

    await exportToExcel(reportData, user.full_name, 'Last_30_Days');
  };

  return (
    <div className="container min-h-screen p-4 md:p-8 flex flex-col gap-6" style={{ width: '100%' }}>
      <header className="flex justify-between items-center fade-in">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Attendance History</h1>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </header>

      <div className="glass-card overflow-hidden fade-in" style={{ animationDelay: '0.1s', minHeight: '200px' }}>
        {loading ? (
          <div className="p-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-slate-400 font-medium text-sm">Date</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">In</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Out</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Breaks</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{format(new Date(session.date), 'MMM do')}</span>
                        <span className="text-slate-500 text-xs">{format(new Date(session.date), 'EEEE')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white">
                      {session.clock_in ? format(new Date(session.clock_in), 'HH:mm') : '--:--'}
                    </td>
                    <td className="p-4 text-white">
                      {session.clock_out ? format(new Date(session.clock_out), 'HH:mm') : '--:--'}
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400 text-sm">
                        {session.breaks?.length || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        session.status === 'clocked_out' ? 'bg-slate-500/20 text-slate-400' : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {session.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-600 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
            <Calendar className="w-12 h-12 text-slate-700" />
            <p className="text-slate-500">No attendance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
