"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DAYS, type Race } from "@/lib/types";

// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  redirect(profile?.role === "coach" ? "/coach/dashboard" : "/athlete/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  return { supabase, profile };
}

// ---------------------------------------------------------------
// Weeks / workouts
// ---------------------------------------------------------------

/** Fetches a week for an athlete, creating it (and its 7 blank workout rows) if missing. */
export async function getOrCreateWeek(athleteId: string, weekStart: string) {
  const { supabase, profile } = await requireProfile();

  if (profile.role !== "coach" && profile.id !== athleteId) {
    throw new Error("Not authorized to view this athlete's week");
  }

  const { data: existing } = await supabase
    .from("weeks")
    .select("*, workouts(*)")
    .eq("athlete_id", athleteId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (existing) return existing;

  if (profile.role !== "coach") {
    // Athletes can only view weeks the coach has already created.
    return null;
  }

  const { data: newWeek, error } = await supabase
    .from("weeks")
    .insert({ athlete_id: athleteId, coach_id: profile.id, week_start: weekStart })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const rows = DAYS.map((day) => ({ week_id: newWeek.id, day_of_week: day }));
  const { data: workouts, error: wErr } = await supabase
    .from("workouts")
    .insert(rows)
    .select();
  if (wErr) throw new Error(wErr.message);

  return { ...newWeek, workouts };
}

/** Coach-only: edit the planned workout text for a single day. */
export async function updatePlanned(workoutId: string, planned: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "coach") throw new Error("Only coaches can edit planned workouts");

  const { error } = await supabase.from("workouts").update({ planned }).eq("id", workoutId);
  if (error) throw new Error(error.message);
  revalidatePath("/coach/dashboard");
}

/** Coach or the owning athlete: log what actually happened. */
export async function updateActual(workoutId: string, actual: string) {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("workouts").update({ actual }).eq("id", workoutId);
  if (error) throw new Error(error.message);
  revalidatePath("/coach/dashboard");
  revalidatePath("/athlete/dashboard");
}

/** Coach or the owning athlete: log the total distance covered that day. */
export async function updateActualDistance(workoutId: string, distanceKm: number | null) {
  const { supabase } = await requireProfile();
  const { error } = await supabase
    .from("workouts")
    .update({ actual_distance_km: distanceKm })
    .eq("id", workoutId);
  if (error) throw new Error(error.message);
  revalidatePath("/coach/dashboard");
  revalidatePath("/athlete/dashboard");
}

// ---------------------------------------------------------------
// Athlete profile (training reference numbers + gear)
// ---------------------------------------------------------------

/** Fetches an athlete's profile row, creating a blank one if missing. */
export async function getOrCreateAthleteProfile(athleteId: string) {
  const { supabase, profile } = await requireProfile();

  if (profile.role !== "coach" && profile.id !== athleteId) {
    throw new Error("Not authorized to view this athlete's profile");
  }

  const { data: existing } = await supabase
    .from("athlete_profile")
    .select("*")
    .eq("athlete_id", athleteId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("athlete_profile")
    .insert({ athlete_id: athleteId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return created;
}

/** Coach-only: edit the training reference fields (everything except watch/shoe). */
export async function updateAthleteProfileCoachFields(
  athleteId: string,
  fields: Partial<
    Record<
      | "i_intervals"
      | "s_speed"
      | "t_tempo"
      | "marathon_m"
      | "e_endurance"
      | "vdot"
      | "best_recent_timing"
      | "pb_5km"
      | "pb_10km"
      | "pb_21km"
      | "pb_42km",
      string
    >
  >
) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "coach") throw new Error("Only coaches can edit these fields");

  const { error } = await supabase
    .from("athlete_profile")
    .update(fields)
    .eq("athlete_id", athleteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/coach/athletes/${athleteId}`);
}

/** Coach or the owning athlete: edit gear info. */
export async function updateAthleteEquipment(
  athleteId: string,
  fields: { watch?: string; shoe?: string }
) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "coach" && profile.id !== athleteId) {
    throw new Error("Not authorized to edit this athlete's profile");
  }

  const { error } = await supabase
    .from("athlete_profile")
    .update(fields)
    .eq("athlete_id", athleteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/coach/athletes/${athleteId}`);
  revalidatePath("/athlete/profile");
}

// ---------------------------------------------------------------
// Races
// ---------------------------------------------------------------

/** Any authenticated user: the full shared race calendar. */
export async function listRaces() {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("races")
    .select("*")
    .order("race_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

/** Coach-only: add a race to the shared calendar. */
export async function createRace(name: string, raceDate: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "coach") throw new Error("Only coaches can add races");

  const { error } = await supabase.from("races").insert({ name, race_date: raceDate });
  if (error) throw new Error(error.message);
  revalidatePath("/coach/races");
  revalidatePath("/athlete/profile");
}

/** Coach-only: remove a race from the shared calendar. */
export async function deleteRace(raceId: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "coach") throw new Error("Only coaches can remove races");

  const { error } = await supabase.from("races").delete().eq("id", raceId);
  if (error) throw new Error(error.message);
  revalidatePath("/coach/races");
  revalidatePath("/athlete/profile");
}

/** The races (full rows) an athlete has picked. */
export async function getAthleteRaces(athleteId: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "coach" && profile.id !== athleteId) {
    throw new Error("Not authorized to view this athlete's races");
  }

  const { data, error } = await supabase
    .from("athlete_races")
    .select("race_id, races(*)")
    .eq("athlete_id", athleteId);
  if (error) throw new Error(error.message);
  return (data as unknown as { races: Race }[]).map((row) => row.races);
}

/** Coach or the owning athlete: pick a race (max 3 per athlete). */
export async function selectRace(athleteId: string, raceId: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "coach" && profile.id !== athleteId) {
    throw new Error("Not authorized to edit this athlete's races");
  }

  const { count, error: countError } = await supabase
    .from("athlete_races")
    .select("*", { count: "exact", head: true })
    .eq("athlete_id", athleteId);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= 3) throw new Error("An athlete can only select up to 3 races");

  const { error } = await supabase
    .from("athlete_races")
    .insert({ athlete_id: athleteId, race_id: raceId });
  if (error) throw new Error(error.message);
  revalidatePath(`/coach/athletes/${athleteId}`);
  revalidatePath("/athlete/profile");
}

/** Coach or the owning athlete: remove a picked race. */
export async function deselectRace(athleteId: string, raceId: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "coach" && profile.id !== athleteId) {
    throw new Error("Not authorized to edit this athlete's races");
  }

  const { error } = await supabase
    .from("athlete_races")
    .delete()
    .eq("athlete_id", athleteId)
    .eq("race_id", raceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/coach/athletes/${athleteId}`);
  revalidatePath("/athlete/profile");
}

