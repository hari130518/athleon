import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { dashboardPathForRole } from "@/lib/types";
import { ONBOARDING_SECTIONS } from "@/lib/onboarding-form";
import { PendingActions, ResendLinkButton } from "./ApprovalActions";

type Invite = {
  id: string;
  email: string;
  status: "sent" | "submitted" | "approved" | "rejected";
  full_name: string | null;
  waiver_signature: string | null;
  waiver_accepted_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  details: Record<string, string | boolean> | null;
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

function Answers({ invite }: { invite: Invite }) {
  const details = invite.details ?? {};
  return (
    <div className="mt-3 space-y-5 text-sm">
      {ONBOARDING_SECTIONS.map((section) => {
        const answered = section.fields.filter((f) => details[f.name] !== undefined);
        if (answered.length === 0) return null;
        return (
          <div key={section.id}>
            <h4 className="mb-2 font-display text-base tracking-wide">{section.title}</h4>
            <dl className="space-y-2">
              {answered.map((field) => (
                <div key={field.name}>
                  <dt className="text-xs text-[var(--color-muted)]">{field.label}</dt>
                  <dd className="whitespace-pre-wrap">
                    {String(details[field.name])}
                    {details[`${field.name}_detail`] ? ` — ${String(details[`${field.name}_detail`])}` : ""}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
      <p className="text-xs text-[var(--color-muted)]">
        Waiver signed as &ldquo;{invite.waiver_signature}&rdquo; on {formatDate(invite.waiver_accepted_at)}.
      </p>
    </div>
  );
}

export default async function ApprovalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role !== "coach") redirect(dashboardPathForRole(profile.role));

  const { data } = await supabase
    .from("onboarding_invites")
    .select("*")
    .order("created_at", { ascending: false });
  const invites = (data ?? []) as Invite[];

  const pending = invites.filter((i) => i.status === "submitted");
  const awaiting = invites.filter((i) => i.status === "sent");
  const reviewed = invites.filter((i) => i.status === "approved" || i.status === "rejected");

  const card = { borderColor: "var(--color-line)", background: "var(--color-panel)" };

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <div className="font-display text-2xl tracking-wide">
          ATHLE<span style={{ color: "var(--color-red)" }}>ON</span>{" "}
          <span className="ml-2 text-sm font-normal text-[var(--color-muted)]">Coach</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--color-muted)]">{profile.full_name}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded border px-3 py-1.5 text-xs uppercase tracking-wide hover:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-6">
        <Link
          href="/coach/dashboard"
          className="mb-2 inline-block text-xs uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-paper)]"
        >
          ← Weekly Plan
        </Link>
        <h1 className="mb-6 font-display text-3xl tracking-wide">Onboarding Approvals</h1>

        <section className="mb-10">
          <h2 className="mb-3 font-display text-xl tracking-wide">Waiting for review ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">Nothing to review right now.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((invite) => (
                <div key={invite.id} className="rounded-lg border p-4" style={card}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{invite.full_name}</div>
                      <div className="text-xs text-[var(--color-muted)]">
                        {invite.email} · submitted {formatDate(invite.submitted_at)}
                      </div>
                      {invite.details?.needsClearance === true && (
                        <div
                          className="mt-2 inline-block rounded border px-2 py-0.5 text-xs"
                          style={{ borderColor: "rgba(224, 163, 82, 0.4)", color: "#e0a352" }}
                        >
                          Needs medical clearance
                        </div>
                      )}
                    </div>
                    <PendingActions inviteId={invite.id} name={invite.full_name ?? invite.email} />
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      View answers
                    </summary>
                    <Answers invite={invite} />
                  </details>
                </div>
              ))}
            </div>
          )}
        </section>

        {awaiting.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-xl tracking-wide">Invited, not submitted ({awaiting.length})</h2>
            <ul className="space-y-1 text-sm text-[var(--color-muted)]">
              {awaiting.map((invite) => (
                <li key={invite.id}>
                  {invite.email} · invited {formatDate(invite.created_at)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {reviewed.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-xl tracking-wide">Reviewed</h2>
            <ul className="space-y-2 text-sm">
              {reviewed.map((invite) => (
                <li
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2"
                  style={card}
                >
                  <span>
                    {invite.full_name ?? invite.email}{" "}
                    <span
                      className="ml-1 text-xs uppercase"
                      style={{ color: invite.status === "approved" ? "#5fbf82" : "var(--color-muted)" }}
                    >
                      {invite.status} {formatDate(invite.reviewed_at)}
                    </span>
                  </span>
                  {invite.status === "approved" && <ResendLinkButton inviteId={invite.id} />}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
