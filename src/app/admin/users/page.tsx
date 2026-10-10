import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signOut } from "@/app/actions";
import { dashboardPathForRole } from "@/lib/types";
import BrandLogo from "@/components/BrandLogo";
import DeleteAthleteButton from "./DeleteAthleteButton";

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect(dashboardPathForRole(profile.role));

  const admin = createAdminClient();
  const { data: athletes } = await admin
    .from("profiles")
    .select("id, email, full_name, group_code")
    .eq("role", "athlete")
    .order("full_name");

  const lastSignIn = new Map<string, string | null>();
  await Promise.all(
    (athletes ?? []).map(async (a) => {
      const { data } = await admin.auth.admin.getUserById(a.id);
      lastSignIn.set(a.id, data?.user?.last_sign_in_at ?? null);
    })
  );

  const { data: log } = await admin
    .from("admin_actions")
    .select("id, admin_name, action, target_name, target_email, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  const card = { borderColor: "var(--color-line)", background: "var(--color-panel)" };

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <BrandLogo label="Admin" />
        <div className="flex items-center gap-4 text-sm">
          <span className="text-xs tracking-wide text-[var(--color-paper)]">{profile.full_name}</span>
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
        <h1 className="mb-1 font-display text-3xl tracking-wide">Manage Athletes</h1>
        <p className="mb-6 text-sm text-[var(--color-muted)]">
          Permanently remove an athlete who has left. Coach, physio and strength-coach accounts aren&apos;t
          deletable here.
        </p>

        {!athletes || athletes.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No athlete accounts.</p>
        ) : (
          <ul className="space-y-2">
            {athletes.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded border px-4 py-3"
                style={card}
              >
                <div>
                  <div className="text-sm font-semibold">
                    {a.full_name}
                    {a.group_code ? <span className="ml-1 text-[var(--color-muted)]">-{a.group_code}</span> : null}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {a.email} ·{" "}
                    {lastSignIn.get(a.id) ? `last signed in ${formatDate(lastSignIn.get(a.id))}` : "never signed in"}
                  </div>
                </div>
                <DeleteAthleteButton athleteId={a.id} name={a.full_name} email={a.email} />
              </li>
            ))}
          </ul>
        )}

        {log && log.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-display text-xl tracking-wide">Recent activity</h2>
            <ul className="space-y-1 text-xs text-[var(--color-muted)]">
              {log.map((entry) => (
                <li key={entry.id}>
                  {formatDate(entry.created_at)} · {entry.admin_name ?? "An admin"} {entry.action}:{" "}
                  {entry.target_name} ({entry.target_email})
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
