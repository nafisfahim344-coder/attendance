// --- Database Models ---

export type UserRole = 'master_owner' | 'admin' | 'employee';

export interface Employee {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  department: string | null;
  role: UserRole;
  is_admin_team: boolean;
  assigned_branch_id: string | null;
  device_id: string | null;
  device_pending_approval: boolean;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  is_active: boolean;
  created_at: string;
}

export type AttendanceStatus = 'clocked_in' | 'on_break' | 'clocked_out';

export interface AttendanceSession {
  id: string;
  employee_id: string;
  branch_id: string | null;
  date: string; // YYYY-MM-DD
  clock_in: string;
  clock_out: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
  is_friday: boolean;
  is_mock_detected: boolean;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export interface BreakRecord {
  id: string;
  session_id: string;
  employee_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  exceeded: boolean;
  excess_minutes: number;
}

export interface OvertimeRecord {
  id: string;
  session_id: string;
  employee_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface CorrectionRequest {
  id: string;
  session_id: string;
  employee_id: string;
  field_to_correct: string;
  current_value: string | null;
  requested_value: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  created_by: string | null;
}

export interface SecurityLog {
  id: string;
  employee_id: string | null;
  event_type: 'mock_gps_detected' | 'root_detected' | 'new_device_attempt' | 'geofence_violation' | 'break_exceeded' | 'missed_clockout';
  details: Record<string, unknown>;
  created_at: string;
}

// --- UI / Logic Types ---

export interface GeoLocation {
  latitude: number;
  longitude: number;
  isMocked: boolean;
}

export interface ClockValidation {
  isValid: boolean;
  error?: string;
  matchedBranch?: Branch;
}

export interface DashboardSummary {
  clockedIn: Employee[];
  onBreak: Employee[];
  clockedOut: Employee[];
  absent: Employee[];
  totalPresent: number;
  totalAbsent: number;
}

export interface ReportEntry {
  date: string;
  day: string;
  branch: string;
  clockIn: string;
  clockOut: string;
  breakDuration: string;
  workedHours: string;
  overtimeHours: string;
  flags: string[];
  isFriday: boolean;
}

// --- Navigation Types ---

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DevicePending: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  OTPVerify: { phone: string };
  EmailLogin: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Reports: undefined;
  More: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  EmployeeList: undefined;
  AddEmployee: undefined;
  EditEmployee: { employeeId: string };
  BranchList: undefined;
  AddBranch: undefined;
  EditBranch: { branchId: string };
  DeviceApprovals: undefined;
  LeaveRequests: undefined;
  LeaveRequestForm: undefined;
  Holidays: undefined;
  Corrections: undefined;
  SecurityLogs: undefined;
};
