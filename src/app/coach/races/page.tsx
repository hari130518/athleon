import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRaces, signOut } from "@/app/actions";
import { dashboardPathForRole, type Race } from "@/lib/types";
import RacesManager from "./RacesManager";
import BrandLogo from "@/components/BrandLogo";

export default async function CoachRacesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role !== "coach") redirect(dashboardPathForRole(profile.role));

  const races = (await listRaces()) as Race[];

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <BrandLogo label="Coach" />
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
        <Link
          href="/coach/dashboard"
          className="mb-2 inline-block text-xs uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-paper)]"
        >
          ← Weekly Plan
        </Link>
        <h1 className="mb-6 font-display text-3xl tracking-wide">Race Calendar</h1>
        <RacesManager initialRaces={races} />
      </main>
    </div>
  );
}
