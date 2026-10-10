"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/app/actions";

/** Permanently delete an athlete's account and everything attached to it:
 * login, profile, weekly plans and workouts, athlete profile, race picks,
 * assessment report files and (optionally) their onboarding record.
 * Admin-only; athletes only (deleting a coach would cascade-delete every
 * weekly plan they created). */
export async function deleteAthleteAccount(
  athleteId: string,
  deleteOnboardingRecord: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: me } = await supabase.from("profiles").select("full_name, is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return { ok: false, error: "Only an admin can delete accounts" };
  if (athleteId === user.id) return { ok: false, error: "You can't delete your own account" };

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", athleteId)
    .maybeSingle();
  if (!target) return { ok: false, error: "Account not found" };
  if (target.role !== "athlete") {
    return { ok: false, error: "Only athlete accounts can be deleted here" };
  }

  // Deleting the login cascades to profile, weeks, workouts, athlete_profile
  // and race picks in the database.
  const { error: deleteError } = await admin.auth.admin.deleteUser(athleteId);
  if (deleteError) return { ok: false, error: deleteError.message };

  // Things the database cascade can't reach.
  const { data: files } = await admin.storage.from("assessment-reports").list(athleteId, { limit: 1000 });
  if (files && files.length > 0) {
    await admin.storage.from("assessment-reports").remove(files.map((f) => `${athleteId}/${f.name}`));
  }

  if (deleteOnboardingRecord) {
    await admin
      .from("onboarding_invites")
      .delete()
      .ilike("email", target.email.replace(/[\\%_]/g, "\\$&"));
  }

  await admin.from("admin_actions").insert({
    admin_id: user.id,
    admin_name: me.full_name,
    action: deleteOnboardingRecord ? "deleted athlete and onboarding record" : "deleted athlete",
    target_name: target.full_name,
    target_email: target.email,
  });

  revalidatePath("/admin/users");
  revalidatePath("/coach/dashboard");
  return { ok: true };
}
