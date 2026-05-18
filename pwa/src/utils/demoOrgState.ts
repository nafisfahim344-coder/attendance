import { APP_CONFIG, SCHEDULE } from '../app/config';

export const TEAM_CONSULTANTS_ID = 'team_consultants';
export const TEAM_ADMINISTRATION_ID = 'team_administration';

export interface TeamDefinition {
  id: string;
  name: string;
  allowsOvertime: boolean;
}

export interface DemoRosterEmployee {
  id: string;
  name: string;
  teamId: string;
  branch: string; // references LocationBranch id
  status: 'On Site' | 'Remote' | 'Off Shift';
  role: 'Owner' | 'Admin' | 'Employee';
}

export interface LocationBranch {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

export interface DemoSchedulePersisted {
  workStartHour: number;
  workEndHour: number;
  breakDurationMinutes: number;
  workingDayIndices: number[];
}

const TEAMS_KEY = 'attendance_demo_teams_v1';
const ROSTER_KEY = 'attendance_demo_roster_v2'; // bumped to v2 for role addition
const SCHEDULE_KEY = 'attendance_demo_schedule_v1';
const BRANCHES_KEY = 'attendance_demo_branches_v1';

export function defaultTeams(): TeamDefinition[] {
  return [
    { id: TEAM_CONSULTANTS_ID, name: 'Consultants', allowsOvertime: false },
    {
      id: TEAM_ADMINISTRATION_ID,
      name: 'Administration Team',
      allowsOvertime: true,
    },
  ];
}

export function defaultBranches(): LocationBranch[] {
  return [
    {
      id: 'hq',
      name: 'Main Office (HQ)',
      latitude: 23.7808,
      longitude: 90.4193,
      radius: 200,
    },
    {
      id: 'branch2',
      name: 'Branch Office',
      latitude: 23.7461,
      longitude: 90.3742,
      radius: 200,
    }
  ];
}

export function seedRoster(): DemoRosterEmployee[] {
  return [
    {
      id: 'e1',
      name: 'Ariyan Hasan',
      teamId: TEAM_CONSULTANTS_ID,
      branch: 'hq',
      status: 'On Site',
      role: 'Owner',
    },
    {
      id: 'e2',
      name: 'Maliha Noor',
      teamId: TEAM_CONSULTANTS_ID,
      branch: 'hq',
      status: 'On Site',
      role: 'Admin',
    },
    {
      id: 'e3',
      name: 'Tariq Imam',
      teamId: TEAM_CONSULTANTS_ID,
      branch: 'hq',
      status: 'Remote',
      role: 'Employee',
    },
    {
      id: 'e4',
      name: 'Sadia Khan',
      teamId: TEAM_ADMINISTRATION_ID,
      branch: 'branch2',
      status: 'On Site',
      role: 'Employee',
    },
    {
      id: 'e5',
      name: 'Rafid Alam',
      teamId: TEAM_ADMINISTRATION_ID,
      branch: 'branch2',
      status: 'Off Shift',
      role: 'Employee',
    },
    {
      id: 'e6',
      name: 'Nafisa Jahan',
      teamId: TEAM_ADMINISTRATION_ID,
      branch: 'branch2',
      status: 'On Site',
      role: 'Employee',
    },
  ];
}

export function defaultSchedule(): DemoSchedulePersisted {
  return {
    workStartHour: APP_CONFIG.WORK_START_HOUR,
    workEndHour: APP_CONFIG.WORK_END_HOUR,
    breakDurationMinutes: APP_CONFIG.BREAK_DURATION_MINUTES,
    workingDayIndices: [...SCHEDULE.WORKING_DAYS].sort(),
  };
}

export function loadTeams(): TeamDefinition[] {
  try {
    const raw = localStorage.getItem(TEAMS_KEY);
    const defaults = defaultTeams();
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as TeamDefinition[];
    const byId = new Map(parsed.map((t) => [t.id, t]));
    defaults.forEach((t) => {
      if (!byId.has(t.id)) byId.set(t.id, t);
    });
    return Array.from(byId.values());
  } catch {
    return defaultTeams();
  }
}

export function saveTeams(teams: TeamDefinition[]) {
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

export function loadBranches(): LocationBranch[] {
  try {
    const raw = localStorage.getItem(BRANCHES_KEY);
    if (!raw) return defaultBranches();
    return JSON.parse(raw) as LocationBranch[];
  } catch {
    return defaultBranches();
  }
}

export function saveBranches(branches: LocationBranch[]) {
  localStorage.setItem(BRANCHES_KEY, JSON.stringify(branches));
}

export function loadRoster(): DemoRosterEmployee[] {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (!raw) return seedRoster();
    const parsed = JSON.parse(raw) as DemoRosterEmployee[];
    // Backwards compatibility for old saved state
    return parsed.map(e => ({
      ...e,
      role: e.role || 'Employee'
    }));
  } catch {
    return seedRoster();
  }
}

export function saveRoster(roster: DemoRosterEmployee[]) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
}

export function loadSchedulePersisted(): DemoSchedulePersisted {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return defaultSchedule();
    const s = JSON.parse(raw) as DemoSchedulePersisted;
    if (
      typeof s.workStartHour !== 'number' ||
      typeof s.workEndHour !== 'number'
    )
      return defaultSchedule();
    return {
      ...defaultSchedule(),
      ...s,
      workingDayIndices: Array.isArray(s.workingDayIndices)
        ? [...new Set(s.workingDayIndices)].sort()
        : defaultSchedule().workingDayIndices,
    };
  } catch {
    return defaultSchedule();
  }
}

export function saveSchedulePersisted(s: DemoSchedulePersisted) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(s));
}

export function teamAllowsOvertime(
  teams: TeamDefinition[],
  teamId: string,
): boolean {
  return teams.find((t) => t.id === teamId)?.allowsOvertime ?? false;
}
