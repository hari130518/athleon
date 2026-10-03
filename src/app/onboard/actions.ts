"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/app/actions";

export type OnboardingInput = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  experienceYears: string;
  weeklyMileageKm: string;
  recentResults: string;
  goalRace: string;
  goalDate: string;
  injuries: string;
  emergencyName: string;
  emergencyPhone: string;
  waiverSignature: string;
  waiverAccepted: boolean;
};

const MAX_LEN = 2000;

/** Public: the invite token is the only credential, so everything is
 * re-validated server-side and only a still-open invite can be updated. */
export async function submitOnboarding(token: string, input: OnboardingInput): Promise<ActionResult> {
  const clean = (value: string) => String(value ?? "").trim().slice(0, MAX_LEN);

  const fullName = clean(input.fullName);
  const phone = clean(input.phone);
  const dateOfBirth = clean(input.dateOfBirth);
  const emergencyName = clean(input.emergencyName);
  const emergencyPhone = clean(input.emergencyPhone);
  const waiverSignature = clean(input.waiverSignature);

  if (!fullName || !phone || !dateOfBirth || !emergencyName || !emergencyPhone) {
    return { ok: false, error: "Please fill in all required fields" };
  }
  if (!input.waiverAccepted || !waiverSignature) {
    return { ok: false, error: "You need to accept the waiver and type your full name to sign it" };
  }

  const now = new Date().toISOString();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("onboarding_invites")
    .update({
      status: "submitted",
      full_name: fullName,
      waiver_signature: waiverSignature,
      waiver_accepted_at: now,
      submitted_at: now,
      details: {
        phone,
        date_of_birth: dateOfBirth,
        experience_years: clean(input.experienceYears),
        weekly_mileage_km: clean(input.weeklyMileageKm),
        recent_results: clean(input.recentResults),
        goal_race: clean(input.goalRace),
        goal_date: clean(input.goalDate),
        injuries: clean(input.injuries),
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
      },
    })
    .eq("token", token)
    .eq("status", "sent")
    .gt("expires_at", now)
    .select("id");

  if (error) return { ok: false, error: "Something went wrong. Please try again." };
  if (!data || data.length === 0) {
    return { ok: false, error: "This invite is no longer valid. Please ask your coach for a new one." };
  }
  return { ok: true };
}
