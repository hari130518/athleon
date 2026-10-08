"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ONBOARDING_SECTIONS, normalizeName } from "@/lib/onboarding-form";
import { sendEmail, escapeHtml } from "@/lib/email";
import type { ActionResult } from "@/app/actions";

export type OnboardingInput = {
  answers: Record<string, string>;
  waiverAccepted: boolean;
  waiverSignature: string;
};

const MAX_LEN = 2000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Public: the invite token is the only credential, so every answer is
 * re-validated against the shared form schema and only a still-open invite
 * can be updated. */
export async function submitOnboarding(token: string, input: OnboardingInput): Promise<ActionResult> {
  const raw = input.answers ?? {};
  const clean = (value: unknown) => String(value ?? "").trim().slice(0, MAX_LEN);

  const details: Record<string, string | boolean> = {};
  let needsClearance = false;

  for (const section of ONBOARDING_SECTIONS) {
    for (const field of section.fields) {
      const value = clean(raw[field.name]);

      if (!value) {
        if (field.required) return { ok: false, error: `Please answer: ${field.label}` };
        continue;
      }
      if (field.type === "number" && !Number.isFinite(Number(value))) {
        return { ok: false, error: `Please enter a number for: ${field.label}` };
      }
      if (field.type === "date" && !DATE_RE.test(value)) {
        return { ok: false, error: `Please enter a valid date for: ${field.label}` };
      }
      if (field.type === "yesno" && value !== "Yes" && value !== "No") {
        return { ok: false, error: `Please answer Yes or No: ${field.label}` };
      }
      if (field.type === "select" && !field.options?.includes(value)) {
        return { ok: false, error: `Please choose an option for: ${field.label}` };
      }

      details[field.name] = value;
      if (field.type === "yesno" && value === "Yes") {
        if (field.clearance) needsClearance = true;
        const detail = clean(raw[`${field.name}_detail`]);
        if (detail) details[`${field.name}_detail`] = detail;
      }
    }
  }
  details.needsClearance = needsClearance;

  const firstName = String(details.firstName);
  const lastName = String(details.lastName);
  const signature = clean(input.waiverSignature);
  if (!input.waiverAccepted) return { ok: false, error: "Please accept the waiver to continue" };
  if (normalizeName(signature) !== normalizeName(`${firstName} ${lastName}`)) {
    return { ok: false, error: "Your signature must match your first and last name" };
  }

  const now = new Date().toISOString();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("onboarding_invites")
    .update({
      status: "submitted",
      full_name: `${firstName} ${lastName}`,
      waiver_signature: signature,
      waiver_accepted_at: now,
      submitted_at: now,
      details,
    })
    .eq("token", token)
    .eq("status", "sent")
    .gt("expires_at", now)
    .select("id");

  if (error) return { ok: false, error: "Something went wrong. Please try again." };
  if (!data || data.length === 0) {
    return { ok: false, error: "This invite is no longer valid. Please ask your coach for a new one." };
  }

  // Best effort: a failed notification must never fail the client's submission.
  try {
    const { data: coaches } = await admin.from("profiles").select("email").eq("role", "coach");
    const to = (coaches ?? []).map((c) => c.email).filter(Boolean);
    if (to.length > 0) {
      await sendEmail({
        to,
        subject: `New onboarding to review: ${firstName} ${lastName}`,
        html: `
          <p>${escapeHtml(`${firstName} ${lastName}`)} has submitted their onboarding.</p>
          ${needsClearance ? "<p><strong>Note: one or more health screening answers need medical clearance.</strong></p>" : ""}
          <p><a href="${process.env.SITE_URL}/coach/approvals">Review and approve</a></p>
        `,
      });
    }
  } catch {}

  return { ok: true };
}
