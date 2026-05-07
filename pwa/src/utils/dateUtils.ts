import {
  format,
  parseISO,
  differenceInSeconds,
  isFriday as isDateFriday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { APP_CONFIG } from '../app/config';
import type { AttendanceSession } from '../types';

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
};

export const formatTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'hh:mm a');
};

export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const isFriday = (date: Date) => isDateFriday(date);

/**
 * Check if a given time is within official work hours
 */
export const isWithinWorkHours = (date: Date) => {
  const hour = date.getHours();
  return hour >= APP_CONFIG.WORK_START_HOUR && hour < APP_CONFIG.WORK_END_HOUR;
};

/**
 * Calculate worked hours for a session
 */
export const calculateWorkedHours = (clockIn: string, clockOut: string | null) => {
  const start = parseISO(clockIn);
  const end = clockOut ? parseISO(clockOut) : new Date();
  const totalSeconds = differenceInSeconds(end, start);
  
  // Deduct 1 hour break if worked more than 5 hours (simple logic)
  const breakSeconds = totalSeconds > 5 * 3600 ? APP_CONFIG.BREAK_DURATION_MINUTES * 60 : 0;
  const workedSeconds = Math.max(0, totalSeconds - breakSeconds);

  return {
    seconds: workedSeconds,
    formatted: formatDuration(workedSeconds),
    decimal: (workedSeconds / 3600).toFixed(2),
  };
};

/**
 * Detect flags like Late, Early Departure, etc.
 */
export const detectFlags = (session: AttendanceSession): string[] => {
  const flags: string[] = [];
  const clockIn = parseISO(session.clock_in);
  
  // Late check (after 9:15 AM)
  const shiftStart = new Date(clockIn);
  shiftStart.setHours(APP_CONFIG.WORK_START_HOUR, 15, 0, 0);
  if (clockIn > shiftStart && !session.is_friday) {
    flags.push('Late');
  }

  if (session.clock_out) {
    const clockOut = parseISO(session.clock_out);
    // Early departure check (before 5:45 PM)
    const shiftEnd = new Date(clockOut);
    shiftEnd.setHours(APP_CONFIG.WORK_END_HOUR, 45, 0, 0);
    if (clockOut < shiftEnd && !session.is_friday) {
      flags.push('Early Departure');
    }
  }

  if (session.is_friday) {
    flags.push('Day Off Visit');
  }

  return flags;
};

/**
 * Get date range for reports
 */
export const getDateRange = (period: 'weekly' | 'monthly') => {
  const now = new Date();
  if (period === 'weekly') {
    return {
      start: format(startOfWeek(now, { weekStartsOn: 6 }), 'yyyy-MM-dd'), // Sat
      end: format(endOfWeek(now, { weekStartsOn: 6 }), 'yyyy-MM-dd'),   // Fri
    };
  } else {
    return {
      start: format(startOfMonth(now), 'yyyy-MM-dd'),
      end: format(endOfMonth(now), 'yyyy-MM-dd'),
    };
  }
};

export const formatMinutesToHuman = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};
