import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateAthleteProfile,
  listRaces,
  getAthleteRaces,
  updateAthleteEquipment,
  signOut,
} from "@/app/actions";
import type { AthleteProfile, Race } from "@/lib/types";
import DebouncedField from "@/components/DebouncedField";
import RacePicker from "./RacePicker";

const COACH_SET_FIELDS: { key: keyof AthleteProfile; label: string }[] = [
  { key: "i_intervals", label: "I - Intervals" },
  { key: "s_speed", label: "S - Speed (200m, 400m)" },
  { key: "t_tempo", label: "T - Tempo" },
  { key: "marathon_m", label: "Marathon M" },
  { key: "e_endurance", label: "E - Endurance" },
  { key: "vdot", label: "VDOT" },
  { key: "best_recent_timing", label: "Best Recent Timing" },
  { key: "pb_5km", label: "PB - 5km" },
  { key: "pb_10km", label: "PB - 10km" },
  { key: "pb_21km", label: "PB - 21km" },
  { key: "pb_42km", label: "PB - 42km" },
];

export default async function AthleteProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role !== "athlete") redirect("/coach/dashboard");

  const athleteProfile = (await getOrCreateAthleteProfile(profile.id)) as AthleteProfile;
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
        <h1 className="mb-6 font-display text-3xl tracking-wide">My Profile</h1>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl tracking-wide">Gear</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DebouncedField
              label="Watch"
              initialValue={athleteProfile.watch ?? ""}
              onSave={(value) => updateAthleteEquipment(profile.id, { watch: value })}
            />
            <DebouncedField
              label="Shoe"
              initialValue={athleteProfile.shoe ?? ""}
              onSave={(value) => updateAthleteEquipment(profile.id, { shoe: value })}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl tracking-wide">Training Numbers</h2>
          <p className="mb-3 text-xs text-[var(--color-muted)]">Set by your coach.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {COACH_SET_FIELDS.map(({ key, label }) => (
              <DebouncedField
                key={key}
                label={label}
                initialValue={athleteProfile[key] ?? ""}
                onSave={async () => {}}
                disabled
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl tracking-wide">Upcoming Races</h2>
          <RacePicker
            athleteId={profile.id}
            allRaces={allRaces}
            initialSelectedIds={selectedRaces.map((r) => r.id)}
          />
        </section>
      </main>
    </div>
  );
}
