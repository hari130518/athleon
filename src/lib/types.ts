export type Role = "coach" | "athlete" | "physio" | "strength_coach";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  group_code: string | null;
};

/** Where to send a signed-in user, or where to redirect them away from a
 * page that isn't theirs. */
export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "coach":
      return "/coach/dashboard";
    case "physio":
      return "/physio/dashboard";
    case "strength_coach":
      return "/strength/dashboard";
    case "athlete":
      return "/athlete/dashboard";
  }
}

export type AthleteProfile = {
  athlete_id: string;
  watch: string | null;
  shoes: string[];
  i_intervals: string | null;
  s_speed: string | null;
  t_tempo: string | null;
  marathon_m: string | null;
  e_endurance: string | null;
  vdot: string | null;
  best_recent_timing: string | null;
  pb_5km: string | null;
  pb_10km: string | null;
  pb_21km: string | null;
  pb_42km: string | null;
  strength: string | null;
  weakness: string | null;
  assessment: string | null;
  recommended_workouts: string | null;
  assessment_report_path: string | null;
  assessment_report_filename: string | null;
  assessment_report_uploaded_at: string | null;
};

/** Fields on AthleteProfile that the athlete themselves may edit. */
export const ATHLETE_EDITABLE_PROFILE_FIELDS = ["watch", "shoes"] as const;

export type Race = {
  id: string;
  name: string;
  race_date: string;
};

export const MAX_ATHLETE_RACES = 3;

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
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const WORKOUT_TYPES = [
  "easy",
  "intervals",
  "tempo",
  "long",
  "snc",
  "mobility",
  "cross_train",
  "rest",
] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  easy: "Easy",
  intervals: "Intervals",
  tempo: "Tempo",
  long: "Long",
  snc: "S&C",
  mobility: "Mobility",
  cross_train: "Cross Train",
  rest: "Rest",
};

/** Text/background colors per workout type, tuned for the app's dark theme. */
export const WORKOUT_TYPE_COLORS: Record<WorkoutType, { text: string; bg: string; border: string }> = {
  easy: { text: "#5fbf82", bg: "rgba(95, 191, 130, 0.12)", border: "rgba(95, 191, 130, 0.4)" },
  intervals: { text: "#e0a352", bg: "rgba(224, 163, 82, 0.12)", border: "rgba(224, 163, 82, 0.4)" },
  tempo: { text: "#b18ae0", bg: "rgba(177, 138, 224, 0.12)", border: "rgba(177, 138, 224, 0.4)" },
  long: { text: "#5fa8e0", bg: "rgba(95, 168, 224, 0.12)", border: "rgba(95, 168, 224, 0.4)" },
  snc: { text: "#e0708a", bg: "rgba(224, 112, 138, 0.12)", border: "rgba(224, 112, 138, 0.4)" },
  mobility: { text: "#4fc3c9", bg: "rgba(79, 195, 201, 0.12)", border: "rgba(79, 195, 201, 0.4)" },
  cross_train: { text: "#d4c05a", bg: "rgba(212, 192, 90, 0.12)", border: "rgba(212, 192, 90, 0.4)" },
  rest: { text: "#9a9a9a", bg: "rgba(154, 154, 154, 0.1)", border: "rgba(154, 154, 154, 0.35)" },
};

export type Workout = {
  id: string;
  week_id: string;
  day_of_week: DayOfWeek;
  planned: string | null;
  workout_type: WorkoutType | null;
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

/** Returns the short date (e.g. "Jul 27") for a given day within a week. */
export function dateForDay(weekStart: string, day: DayOfWeek): string {
  const iso = addDaysToISO(weekStart, DAYS.indexOf(day));
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(addDaysToISO(weekStart, 6) + "T00:00:00");
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}
