export type Role = "coach" | "athlete";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  group_code: string | null;
};

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayOfWeek = (typeof DAYS)[number];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday (Yoga)",
  saturday: "Saturday",
  sunday: "Sunday",
};

export type Workout = {
  id: string;
  week_id: string;
  day_of_week: DayOfWeek;
  planned: string | null;
  actual: string | null;
  actual_distance_km: number | null;
};

export type Week = {
  id: string;
  athlete_id: string;
  coach_id: string;
  week_start: string; // ISO date, always a Monday
  week_mileage: number | null;
  workouts: Workout[];
};

/** Sum of actual_distance_km across a week's workouts. */
export function weekTotalDistance(week: Week): number {
  const total = week.workouts.reduce((sum, w) => sum + (w.actual_distance_km ?? 0), 0);
  return Math.round(total * 100) / 100;
}

/** Returns the ISO date (YYYY-MM-DD) of the Monday of the week containing `date`. */
export function mondayOf(date: Date): string {
  // Do all arithmetic in UTC so the result doesn't drift depending on the
  // caller's local timezone offset (local-time getters mixed with the
  // UTC-based toISOString() below previously caused a day to be lost or
  // gained depending on the coach's timezone).
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function addDaysToISO(iso: string, days: number): string {
  // Parse and add in UTC (see mondayOf) to avoid local-timezone date drift.
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(addDaysToISO(weekStart, 6) + "T00:00:00");
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}
