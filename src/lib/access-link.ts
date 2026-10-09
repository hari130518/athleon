import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, escapeHtml } from "@/lib/email";

/** Emails an existing user a one-time link that signs them in and sends them
 * to the set-password page. Server-only: uses the service-role client. */
export async function emailAccessLink({
  email,
  fullName,
  subject,
  heading,
  linkText,
}: {
  email: string;
  fullName: string;
  subject: string;
  heading: string;
  linkText: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
  if (error || !data.properties?.hashed_token) {
    throw new Error(error?.message ?? "Could not create the sign-in link");
  }

  const link = `${process.env.SITE_URL}/auth/confirm?token_hash=${data.properties.hashed_token}`;
  await sendEmail({
    to: email,
    subject,
    html: `
      <p>Hi ${escapeHtml(fullName)},</p>
      <p>${heading}</p>
      <p><a href="${link}">${linkText}</a></p>
      <p>This link works once and expires soon. If it stops working, you can request a new one from the sign-in page ("Forgot your password?") or ask your coach.</p>
    `,
  });
}
