import { supabase } from '../../../app/supabase';
import { APP_CONFIG } from '../../../app/config';
import { findBranchInRange } from '../../../utils/geoUtils';
import { isFriday } from '../../../utils/dateUtils';
import { format } from 'date-fns';
import type { Branch, GeoLocation, AttendanceSession, BreakRecord, OvertimeRecord } from '../../../types';

async function logSecurityEvent(employeeId: string, eventType: string, details: Record<string, unknown>) {
  try { await supabase.from('security_logs').insert({ employee_id: employeeId, event_type: eventType, details }); }
  catch (e) { console.error('Security log error:', e); }
}

export function isWithinAttendanceWindow(start: string | null, end: string | null): boolean {
  if (!start || !end) return true;
  const now = format(new Date(), 'HH:mm');
  return now >= start && now <= end;
}

export async function verifyWiFiPresence(currentBssid: string, branch: Branch): Promise<boolean> {
  if (!branch.wifi_bssid) return false;
  return currentBssid.toLowerCase() === branch.wifi_bssid.toLowerCase();
}

export async function performClockIn(
  employeeId: string, location: GeoLocation, deviceId: string, isMocked: boolean,
): Promise<{ success: boolean; session?: AttendanceSession; error?: string }> {
  try {
    if (isMocked || location.isMocked) {
      await logSecurityEvent(employeeId, 'mock_gps_detected', { lat: location.latitude, lng: location.longitude });
      return { success: false, error: 'Fake GPS detected. Clock-in rejected.' };
    }
    const { data: emp } = await supabase.from('employees').select('device_id, is_active').eq('id', employeeId).single();
    if (!emp?.is_active) return { success: false, error: 'Account deactivated.' };
    if (emp.device_id && emp.device_id !== deviceId) {
      await logSecurityEvent(employeeId, 'new_device_attempt', { expected: emp.device_id, actual: deviceId });
      return { success: false, error: 'Device not registered to your account.' };
    }
    const { data: branches } = await supabase.from('branches').select('*').eq('is_active', true);
    if (!branches?.length) return { success: false, error: 'No active branches configured.' };
    const match = findBranchInRange(location.latitude, location.longitude, branches as Branch[]);
    if (!match) {
      await logSecurityEvent(employeeId, 'geofence_violation', { lat: location.latitude, lng: location.longitude });
      return { success: false, error: 'You are not within any registered office.' };
    }
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: existing } = await supabase.from('attendance_sessions').select('id').eq('employee_id', employeeId).eq('date', today).is('clock_out', null).single();
    if (existing) return { success: false, error: 'You are already clocked in.' };
    const now = new Date();
    const { data: session, error } = await supabase.from('attendance_sessions').insert({
      employee_id: employeeId, branch_id: match.branchId, date: today,
      clock_in: now.toISOString(), clock_in_lat: location.latitude, clock_in_lng: location.longitude,
      is_friday: isFriday(now), status: 'clocked_in',
    }).select('*').single();
    if (error) throw error;
    return { success: true, session: session as AttendanceSession };
  } catch (e: any) { return { success: false, error: e.message || 'Clock-in failed.' }; }
}

export async function performAutoClockIn(
  employeeId: string, bssid: string, deviceId: string,
): Promise<{ success: boolean; session?: AttendanceSession; error?: string }> {
  try {
    const { data: emp } = await supabase.from('employees').select('*, branches(*)').eq('id', employeeId).single();
    if (!emp?.is_active) return { success: false, error: 'Deactivated.' };
    
    const branch = emp.branches as unknown as Branch;
    if (!branch) return { success: false, error: 'No assigned branch.' };

    const isWindowActive = isWithinAttendanceWindow(branch.attendance_start_window, branch.attendance_end_window);
    if (!isWindowActive) return { success: false, error: 'Outside attendance window.' };

    const isWiFiMatched = await verifyWiFiPresence(bssid, branch);
    if (!isWiFiMatched) return { success: false, error: 'Not on authorized WiFi.' };

    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: existing } = await supabase.from('attendance_sessions').select('id').eq('employee_id', employeeId).eq('date', today).is('clock_out', null).single();
    if (existing) return { success: true, error: 'Already clocked in.' };

    const now = new Date();
    const { data: session, error } = await supabase.from('attendance_sessions').insert({
      employee_id: employeeId, branch_id: branch.id, date: today,
      clock_in: now.toISOString(), status: 'clocked_in',
      is_friday: isFriday(now),
    }).select('*').single();

    if (error) throw error;
    return { success: true, session: session as AttendanceSession };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function performClockOut(sessionId: string, employeeId: string, location: GeoLocation) {
  try {
    const now = new Date();
    const { data: ab } = await supabase.from('breaks').select('id').eq('session_id', sessionId).is('end_time', null).single();
    if (ab) await endBreak(ab.id, sessionId);
    const { data: ao } = await supabase.from('overtime_records').select('*').eq('session_id', sessionId).is('end_time', null).single();
    if (ao) {
      const dur = (now.getTime() - new Date(ao.start_time).getTime()) / 60000;
      await supabase.from('overtime_records').update({ end_time: now.toISOString(), duration_minutes: Math.round(dur * 100) / 100 }).eq('id', ao.id);
    }
    const { error } = await supabase.from('attendance_sessions').update({
      clock_out: now.toISOString(), clock_out_lat: location.latitude, clock_out_lng: location.longitude,
      status: 'clocked_out', updated_at: now.toISOString(),
    }).eq('id', sessionId);
    if (error) throw error;
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message || 'Clock-out failed.' }; }
}

export async function startBreak(sessionId: string, employeeId: string) {
  try {
    const { data: existing } = await supabase.from('breaks').select('id').eq('session_id', sessionId).is('end_time', null).single();
    if (existing) return { success: false, error: 'Already on break.' };
    const now = new Date();
    const { data, error } = await supabase.from('breaks').insert({ session_id: sessionId, employee_id: employeeId, start_time: now.toISOString() }).select('*').single();
    if (error) throw error;
    await supabase.from('attendance_sessions').update({ status: 'on_break', updated_at: now.toISOString() }).eq('id', sessionId);
    return { success: true, breakRecord: data as BreakRecord };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function endBreak(breakId: string, sessionId: string) {
  try {
    const now = new Date();
    const { data: br } = await supabase.from('breaks').select('*').eq('id', breakId).single();
    if (!br) return { success: false, exceeded: false, excessMinutes: 0, error: 'Break not found.' };
    const dur = (now.getTime() - new Date(br.start_time).getTime()) / 60000;
    const exceeded = dur > APP_CONFIG.BREAK_DURATION_MINUTES;
    const excess = exceeded ? Math.round((dur - APP_CONFIG.BREAK_DURATION_MINUTES) * 100) / 100 : 0;
    await supabase.from('breaks').update({ end_time: now.toISOString(), duration_minutes: Math.round(dur * 100) / 100, exceeded, excess_minutes: excess }).eq('id', breakId);
    await supabase.from('attendance_sessions').update({ status: 'clocked_in', updated_at: now.toISOString() }).eq('id', sessionId);
    if (exceeded) await logSecurityEvent(br.employee_id, 'break_exceeded', { break_id: breakId, duration: dur, excess });
    return { success: true, exceeded, excessMinutes: excess };
  } catch (e: any) { return { success: false, exceeded: false, excessMinutes: 0, error: e.message }; }
}

export async function startOvertime(sessionId: string, employeeId: string) {
  try {
    const otStart = new Date(); otStart.setHours(APP_CONFIG.WORK_END_HOUR, 0, 0, 0);
    const { data, error } = await supabase.from('overtime_records').insert({ session_id: sessionId, employee_id: employeeId, start_time: otStart.toISOString() }).select('*').single();
    if (error) throw error;
    return { success: true, overtime: data as OvertimeRecord };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getTodaySession(employeeId: string): Promise<AttendanceSession | null> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data } = await supabase.from('attendance_sessions').select('*, breaks(*), overtime_records(*)').eq('employee_id', employeeId).eq('date', today).order('clock_in', { ascending: false }).limit(1).single();
  return data as AttendanceSession | null;
}
