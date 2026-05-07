import { create } from 'zustand';
import type { AttendanceSession, AttendanceStatus, BreakRecord } from '../types';

interface AttendanceState {
  currentSession: AttendanceSession | null;
  currentBreak: BreakRecord | null;
  status: AttendanceStatus | 'not_clocked_in' | 'absent';
  workElapsedSeconds: number;
  breakElapsedSeconds: number;
  overtimeElapsedSeconds: number;
  isOvertimeActive: boolean;
  lastSyncAt: string | null;

  setCurrentSession: (session: AttendanceSession | null) => void;
  setCurrentBreak: (breakRecord: BreakRecord | null) => void;
  setStatus: (status: AttendanceStatus | 'not_clocked_in' | 'absent') => void;
  setWorkElapsed: (seconds: number) => void;
  setBreakElapsed: (seconds: number) => void;
  setOvertimeElapsed: (seconds: number) => void;
  setOvertimeActive: (active: boolean) => void;
  setLastSyncAt: (date: string) => void;
  resetSession: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  currentSession: null,
  currentBreak: null,
  status: 'not_clocked_in',
  workElapsedSeconds: 0,
  breakElapsedSeconds: 0,
  overtimeElapsedSeconds: 0,
  isOvertimeActive: false,
  lastSyncAt: null,

  setCurrentSession: (currentSession) => set({ currentSession }),
  setCurrentBreak: (currentBreak) => set({ currentBreak }),
  setStatus: (status) => set({ status }),
  setWorkElapsed: (workElapsedSeconds) => set({ workElapsedSeconds }),
  setBreakElapsed: (breakElapsedSeconds) => set({ breakElapsedSeconds }),
  setOvertimeElapsed: (overtimeElapsedSeconds) => set({ overtimeElapsedSeconds }),
  setOvertimeActive: (isOvertimeActive) => set({ isOvertimeActive }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  resetSession: () =>
    set({
      currentSession: null,
      currentBreak: null,
      status: 'not_clocked_in',
      workElapsedSeconds: 0,
      breakElapsedSeconds: 0,
      overtimeElapsedSeconds: 0,
      isOvertimeActive: false,
    }),
}));
