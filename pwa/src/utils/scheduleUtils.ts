/** 0 = Sunday … 6 = Saturday (Date.getDay()) */
export function dayIndex(now: Date): number {
  return now.getDay();
}

export interface ScheduleDayConfig {
  workStartHour: number;
  workEndHour: number;
  breakDurationMinutes: number;
  workingDayIndices: number[];
}

export function isWorkingDay(now: Date, schedule: ScheduleDayConfig): boolean {
  const d = dayIndex(now);
  return schedule.workingDayIndices.includes(d);
}

/** Minutes clocked beyond workEndHour on the same calendar local day */
export function overtimeMinutesSameLocalDay(
  clockOut: Date,
  workEndHour: number,
): number {
  const endBoundary = new Date(clockOut);
  endBoundary.setHours(workEndHour, 0, 0, 0);
  const diffMs = clockOut.getTime() - endBoundary.getTime();
  return diffMs > 0 ? Math.round(diffMs / 60000) : 0;
}

export function formatMinutesAsHhMm(mins: number): string {
  if (mins <= 0) return '0h 00m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}
