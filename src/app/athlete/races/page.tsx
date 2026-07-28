import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRaces, getAthleteRaces, signOut } from "@/app/actions";
import { dashboardPathForRole, type Race } from "@/lib/types";
import RacePicker from "./RacePicker";

export default async function AthleteRacesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role !== "athlete") redirect(dashboardPathForRole(profile.role));

  const allRaces = (await listRaces()) as Race[];
  const selectedRaces = (await getAthleteRaces(profile.id)) as Race[];

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <div className="font-display text-2xl tracking-wide">
          ATHLE<span style={{ color: "var(--color-red)" }}>ON</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/athlete/profile" className="text-[var(--color-muted)] hover:text-[var(--color-paper)]">
            My Profile
          </Link>
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-6">
        <Link
          href="/athlete/dashboard"
          className="mb-2 inline-block text-xs uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-paper)]"
        >
          ← My Week
        </Link>
        <h1 className="mb-6 font-display text-3xl tracking-wide">Upcoming Races</h1>
        <RacePicker
          athleteId={profile.id}
          allRaces={allRaces}
          initialSelectedIds={selectedRaces.map((r) => r.id)}
        />
      </main>
    </div>
  );
}
