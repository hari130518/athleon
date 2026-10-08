import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { dashboardPathForRole } from "@/lib/types";
import BrandLogo from "@/components/BrandLogo";

export default async function PhysioDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role !== "physio") redirect(dashboardPathForRole(profile.role));

  const { data: athletes } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "athlete")
    .order("full_name");

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <BrandLogo label="Physio" />
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-6">
        <h1 className="mb-6 font-display text-3xl tracking-wide">Athletes</h1>

        {!athletes || athletes.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No athletes yet.</p>
        ) : (
          <ul className="space-y-2">
            {athletes.map((athlete) => (
              <li key={athlete.id}>
                <Link
                  href={`/coach/athletes/${athlete.id}`}
                  className="block rounded border px-4 py-3 text-sm hover:border-[var(--color-red)]"
                  style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
                >
                  {athlete.full_name}
                  {athlete.group_code ? (
                    <span className="ml-1 text-[var(--color-muted)]">-{athlete.group_code}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
