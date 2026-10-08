import { createAdminClient } from "@/lib/supabase/admin";
import { WAIVER_TEXT } from "@/lib/waiver";
import OnboardingForm from "./OnboardingForm";
import BrandLogo from "@/components/BrandLogo";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <BrandLogo />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <h1 className="mb-2 font-display text-3xl tracking-wide">{title}</h1>
      <p className="text-sm text-[var(--color-muted)]">{body}</p>
    </Shell>
  );
}

export default async function OnboardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("onboarding_invites")
    .select("email, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return <Notice title="Link not found" body="This onboarding link isn't valid. Please check the link in your email or ask your coach for a new one." />;
  }
  if (invite.status !== "sent") {
    return <Notice title="Already submitted" body="You've already completed onboarding with this link. Your coach will be in touch once your account is ready." />;
  }
  if (new Date(invite.expires_at) < new Date()) {
    return <Notice title="Link expired" body="This onboarding link has expired. Please ask your coach to send you a new one." />;
  }

  return (
    <Shell>
      <h1 className="mb-1 font-display text-3xl tracking-wide">Welcome to AthleOn</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">
        Tell us a bit about yourself and your running, then sign the waiver. It takes a few minutes.
      </p>
      <OnboardingForm token={token} email={invite.email} waiverText={WAIVER_TEXT} />
    </Shell>
  );
}
