import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  MapPin, Clock, Calendar, LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import {
  type DemoRosterEmployee, type TeamDefinition, type LocationBranch,
  TEAM_CONSULTANTS_ID,
  loadRoster, loadTeams, saveRoster, saveTeams,
  loadBranches, saveBranches
} from '../utils/demoOrgState';


// MAP IMPORTS
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistance } from 'geolib';

// Fix Leaflet Default Icon Issue
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});



interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}



function MapClickEvents({ onAddBranch, isAdmin }: { onAddBranch: (lat: number, lng: number) => void, isAdmin: boolean }) {
  useMapEvents({
    click(e) {
      if (isAdmin) {
        onAddBranch(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<'IDLE' | 'CLOCKING' | 'SUCCESS'>('IDLE');
  const [lastAttendance, setLastAttendance] = useState<any>(null);
  const [activePanel, setActivePanel] = useState<'overview' | 'team' | 'reports' | 'alerts' | 'permissions' | 'leave'>('overview');
  const [activeLocationBranch, setActiveLocationBranch] = useState<string>('hq');
  
  const [teams] = useState<TeamDefinition[]>(loadTeams);
  const [branches, setBranches] = useState<LocationBranch[]>(loadBranches);
  const [roster, setRoster] = useState<DemoRosterEmployee[]>(loadRoster);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('attendance_leaves_v1') || '[]');
    } catch { return []; }
  });


  
  // Leave Request State
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const currentUserData = useMemo(() => {
    return roster.find(e => e.id === user?.id) || roster[0];
  }, [roster, user?.id]);

  const userTeamId = currentUserData?.teamId ?? TEAM_CONSULTANTS_ID;

  const teamNameLookup = useMemo(() => {
    const m = new Map(teams.map((t) => [t.id, t.name]));
    return (id: string) => m.get(id) ?? 'Team';
  }, [teams]);

  const isOnBreak = Boolean(lastAttendance?.break_start && !lastAttendance?.break_end);
  const isClockedIn = Boolean(lastAttendance?.check_in && !lastAttendance?.check_out);


  useEffect(() => { saveRoster(roster); }, [roster]);
  useEffect(() => { saveTeams(teams); }, [teams]);
  useEffect(() => { saveBranches(branches); }, [branches]);
  useEffect(() => { localStorage.setItem('attendance_leaves_v1', JSON.stringify(leaves)); }, [leaves]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLastAttendance();
    return () => clearInterval(timer);
  }, []);

  const fetchLastAttendance = async () => {
    if (!user || !isSupabaseConfigured) {
      // Mock local attendance logic omitted for brevity, keeping simple for demo
      return;
    }
    const { data, error } = await supabase.from('attendance').select('*')
      .eq('employee_id', user.id).order('created_at', { ascending: false }).limit(1).single();

    if (error && error.code !== 'PGRST116') {
      setLastAttendance(null);
    } else {
      setLastAttendance(data);
    }
  };



  const handleClockAction = async (action: 'IN' | 'OUT') => {
    if (action === 'OUT' && isClockedIn && isOnBreak) {
      alert('End your break before clocking out.');
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setStatus('CLOCKING');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // GEO-FENCE CHECK
        if (action === 'IN') {
          const userBranch = branches.find(b => b.id === currentUserData.branch);
          if (userBranch) {
            const distance = getDistance(
              { latitude, longitude },
              { latitude: userBranch.latitude, longitude: userBranch.longitude }
            );
            
            if (distance > userBranch.radius) {
              alert(`Geofence Lock: You are ${distance}m away from ${userBranch.name}. You must be within ${userBranch.radius}m to clock in.`);
              setStatus('IDLE');
              return;
            }
          }
        }

        const nowIso = new Date().toISOString();
        if (!isSupabaseConfigured) {
          setTimeout(() => {
            setLastAttendance((prev: any) => {
              if (action === 'IN') return { id: 'demo-attendance', check_in: nowIso, check_out: null, break_start: null, break_end: null };
              if (!prev?.check_in || prev?.check_out) return prev;
              return { ...prev, check_out: nowIso };
            });
            setStatus('SUCCESS');
            setTimeout(() => setStatus('IDLE'), 1500);
          }, 450);
          return;
        }

        // SUPABASE LOGIC
        let error: { message: string } | null = null;
        if (action === 'IN') {
          const result = await supabase.from('attendance').insert({
            employee_id: user?.id, check_in: nowIso, latitude, longitude, status: 'PRESENT',
          });
          error = result.error as { message: string } | null;
        } else {
          if (!lastAttendance?.id) { error = { message: 'Please clock in first.' }; }
          else {
            const result = await supabase.from('attendance').update({
                check_out: nowIso, checkout_latitude: latitude, checkout_longitude: longitude,
              }).eq('id', lastAttendance.id);
            error = result.error as { message: string } | null;
          }
        }

        if (error) {
          alert('Error: ' + error.message);
          setStatus('IDLE');
        } else {
          setStatus('SUCCESS');
          fetchLastAttendance();
          setTimeout(() => setStatus('IDLE'), 3000);
        }
      },
      (error) => {
        alert('Error getting location: ' + error.message);
        setStatus('IDLE');
      },
      { enableHighAccuracy: true } // Required for precise geofencing
    );
  };

  const normalizedRole = (currentUserData.role || 'Employee').toLowerCase();
  const isOwner = normalizedRole === 'owner';
  const isAdmin = isOwner || normalizedRole === 'admin';


  const assignEmployeeRole = (id: string, role: 'Owner' | 'Admin' | 'Employee') => {
    if (!isOwner) return;
    setRoster(prev => prev.map(e => e.id === id ? { ...e, role } : e));
  };
  
  const handleAddBranch = (lat: number, lng: number) => {
    const name = prompt("Enter new Branch/Office Name:");
    if (!name) return;
    const radiusStr = prompt("Enter Geofence Radius in meters (e.g. 150):", "150");
    const radius = parseInt(radiusStr || "150", 10);
    const newBranch: LocationBranch = {
      id: 'branch_' + Date.now(),
      name,
      latitude: lat,
      longitude: lng,
      radius
    };
    setBranches(prev => [...prev, newBranch]);
    setActiveLocationBranch(newBranch.id);
  };

  const submitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if(!leaveDate || !leaveReason) return;
    const newReq: LeaveRequest = {
      id: 'lr_' + Date.now(),
      employeeId: currentUserData.id,
      employeeName: currentUserData.name,
      date: leaveDate,
      reason: leaveReason,
      status: 'Pending'
    };
    setLeaves(prev => [newReq, ...prev]);
    setLeaveDate('');
    setLeaveReason('');
    alert('Leave request submitted!');
  };

  const updateLeaveStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16,
  };

  const renderAdminPanel = () => {
    if (!isAdmin) return null;
    return (
      <div className="glass-card p-6 fade-in mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Control Center</h3>
          <span className="text-slate-400 text-sm">{isOwner ? 'Owner Access' : 'Admin Access'}</span>
        </div>
        <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          <button className={`btn-primary ${activePanel==='overview'?'opacity-100':'opacity-60'}`} onClick={() => setActivePanel('overview')}>Overview</button>
          <button className={`btn-primary ${activePanel==='team'?'opacity-100':'opacity-60'}`} onClick={() => setActivePanel('team')}>Team</button>
          <button className={`btn-primary ${activePanel==='reports'?'opacity-100':'opacity-60'}`} onClick={() => setActivePanel('reports')}>Reports</button>
          <button className={`btn-primary ${activePanel==='leave'?'opacity-100':'opacity-60'}`} onClick={() => setActivePanel('leave')}>Leave</button>
          {isOwner && <button className={`btn-primary ${activePanel==='permissions'?'opacity-100':'opacity-60'}`} onClick={() => setActivePanel('permissions')}>Permissions</button>}
        </div>

        {activePanel === 'overview' && (
          <p className="text-slate-400">Overview metrics go here.</p>
        )}

        {activePanel === 'leave' && (
          <div style={cardStyle}>
            <h4 className="text-white font-semibold mb-4">Leave Approvals</h4>
            <div className="space-y-3 max-h-64 overflow-auto">
              {leaves.length === 0 ? <p className="text-slate-500 text-sm">No leave requests.</p> : null}
              {leaves.map(l => (
                <div key={l.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-medium">{l.employeeName}</p>
                    <p className="text-slate-400 text-xs">{l.date} - {l.reason}</p>
                  </div>
                  {l.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs hover:bg-emerald-500/30" onClick={() => updateLeaveStatus(l.id, 'Approved')}>Approve</button>
                      <button className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded text-xs hover:bg-rose-500/30" onClick={() => updateLeaveStatus(l.id, 'Rejected')}>Reject</button>
                    </div>
                  ) : (
                    <span className={`text-xs ${l.status==='Approved' ? 'text-emerald-400' : 'text-rose-400'}`}>{l.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activePanel === 'permissions' && isOwner && (
          <div style={cardStyle}>
            <h4 className="text-white font-semibold mb-2">Role Management</h4>
            <p className="text-slate-400 text-sm mb-4">Only Owners can promote or demote users.</p>
            <ul className="space-y-2 max-h-64 overflow-auto">
              {roster.map(emp => (
                <li key={emp.id} className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm font-medium">{emp.name}</span>
                    <p className="text-slate-500 text-xs">Team: {teamNameLookup(emp.teamId)}</p>
                  </div>
                  <select
                    className="input-field max-w-[8rem] !py-1 !text-sm"
                    value={emp.role}
                    onChange={(e) => assignEmployeeRole(emp.id, e.target.value as 'Owner'|'Admin'|'Employee')}
                  >
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderLocationPanel = () => {
    if (!isAdmin) return null;
    const activeBranch = branches.find(b => b.id === activeLocationBranch) || branches[0];
    
    return (
      <div className="glass-card p-6 fade-in mt-6">
        <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400"/>
              Branch Geofencing
            </h3>
            <p className="text-slate-400 text-sm">Admins: Click on the map to add a new Branch location.</p>
          </div>
          <select className="input-field max-w-[12rem]" value={activeLocationBranch} onChange={e => setActiveLocationBranch(e.target.value)}>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-4 flex justify-between items-center">
          <div>
            <p className="text-white font-semibold">{activeBranch.name}</p>
            <p className="text-slate-400 text-xs">Lat: {activeBranch.latitude.toFixed(4)}, Lng: {activeBranch.longitude.toFixed(4)}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-medium">{activeBranch.radius}m</p>
            <p className="text-slate-500 text-xs">Geofence Radius</p>
          </div>
        </div>

        <div className="w-full h-80 rounded-xl overflow-hidden border border-white/10 z-0 relative">
           <MapContainer center={[activeBranch.latitude, activeBranch.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {branches.map(b => (
              <React.Fragment key={b.id}>
                <Marker position={[b.latitude, b.longitude]}>
                  <Popup>{b.name}</Popup>
                </Marker>
                <Circle center={[b.latitude, b.longitude]} radius={b.radius} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} />
              </React.Fragment>
            ))}
            <MapClickEvents onAddBranch={handleAddBranch} isAdmin={isAdmin} />
          </MapContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="container min-h-screen p-4 md:p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {currentUserData.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">{currentUserData.name}</h2>
            <p className="text-slate-400 text-sm">{currentUserData.role} · {teamNameLookup(userTeamId)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { supabase.auth.signOut(); logout(); }} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 flex flex-col items-center justify-center gap-4 fade-in">
          <div className="text-center">
            <h3 className="text-slate-400 font-medium mb-1 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(currentTime, 'EEEE, MMM do')}
            </h3>
            <h1 className="text-5xl font-bold text-white tracking-tighter">{format(currentTime, 'HH:mm:ss')}</h1>
          </div>

          <div className="w-full max-w-xl grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleClockAction('IN')} disabled={status !== 'IDLE'}
                className="h-28 rounded-2xl border-2 border-blue-600 bg-blue-600/10 text-white hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-70">
                <Clock className="w-8 h-8 text-blue-500" />
                <span className="font-bold">Clock In</span>
              </button>
              <button type="button" onClick={() => handleClockAction('OUT')} disabled={status !== 'IDLE' || !isClockedIn}
                className="h-28 rounded-2xl border-2 border-rose-500 bg-rose-500/10 text-white hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-70">
                <Clock className="w-8 h-8 text-rose-400" />
                <span className="font-bold">Clock Out</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin className="w-4 h-4 text-emerald-500" /> Geofence Lock Active
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 fade-in">
             <h3 className="text-white font-semibold mb-4">Request Leave</h3>
             <form onSubmit={submitLeaveRequest} className="grid gap-3">
               <input type="date" className="input-field" value={leaveDate} onChange={e=>setLeaveDate(e.target.value)} required />
               <input type="text" className="input-field" placeholder="Reason (e.g., Sick leave)" value={leaveReason} onChange={e=>setLeaveReason(e.target.value)} required />
               <button type="submit" className="btn-primary">Submit Request</button>
             </form>
             <div className="mt-4 max-h-32 overflow-auto space-y-2">
                <p className="text-slate-400 text-xs font-semibold mb-2">My Requests</p>
                {leaves.filter(l => l.employeeId === currentUserData.id).map(l => (
                  <div key={l.id} className="text-sm flex justify-between bg-white/5 p-2 rounded">
                    <span className="text-slate-300">{l.date}</span>
                    <span className={l.status === 'Approved' ? 'text-emerald-400' : l.status === 'Rejected' ? 'text-rose-400' : 'text-amber-400'}>{l.status}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {renderAdminPanel()}
      {renderLocationPanel()}
    </div>
  );
};

export default Dashboard;
