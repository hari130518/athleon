"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { emailAccessLink } from "@/lib/access-link";

/** Public. Always reports success so the form can't be used to discover which
 * email addresses have accounts. */
export async function requestPasswordReset(email: string): Promise<void> {
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return;

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .ilike("email", clean.replace(/[\\%_]/g, "\\$&"))
      .maybeSingle();
    if (!profile) return;

    await emailAccessLink({
      email: profile.email,
      fullName: profile.full_name,
      subject: "Reset your AthleOn password",
      heading:
        "We received a request to reset your AthleOn password. Use the link below to choose a new one. If you didn't ask for this, you can ignore this email.",
      linkText: "Choose a new password",
    });
  } catch {}
}
