export const APP_CONFIG = {
  WORK_START_HOUR: 9, // 9:00 AM
  WORK_END_HOUR: 18, // 6:00 PM
  BREAK_DURATION_MINUTES: 60, // 1 hour
  DEFAULT_GEOFENCE_RADIUS: 150, // 150 meters
  MIN_GEOFENCE_RADIUS: 50,
  MAX_GEOFENCE_RADIUS: 500,
  DATA_RETENTION_MONTHS: 2,
  CLOCK_BUTTON_SIZE: 180,
  SYNC_INTERVAL_MS: 30000, // 30 seconds
};

export const WORK_DAYS = [1, 2, 3, 4, 6, 0]; // Saturday(6) to Thursday(4), Sunday(0)
// Wait, Saturday is 6, Sunday is 0. Mon 1, Tue 2, Wed 3, Thu 4. Friday is 5.
// Working days: Sat(6), Sun(0), Mon(1), Tue(2), Wed(3), Thu(4).
export const SCHEDULE = {
  WORKING_DAYS: [0, 1, 2, 3, 4, 6],
  OFF_DAYS: [5],
};
