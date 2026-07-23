"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DAYS } from "@/lib/types";

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

