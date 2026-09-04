import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateAthleteProfile,
  getAssessmentReportUrl,
  getWeeklyMileageHistory,
  signOut,
} from "@/app/actions";
import { dashboardPathForRole, type AthleteProfile } from "@/lib/types";
import GearFields from "./GearFields";
import MileageChart from "@/components/MileageChart";

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

const ASSESSMENT_FIELDS: { key: keyof AthleteProfile; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "weakness", label: "Weakness" },
  { key: "assessment", label: "Assessment" },
  { key: "recommended_workouts", label: "Recommended Workouts" },
];

export default async function AthleteProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role !== "athlete") redirect(dashboardPathForRole(profile.role));

  const athleteProfile = (await getOrCreateAthleteProfile(profile.id)) as AthleteProfile;
  const reportUrl = athleteProfile.assessment_report_path
    ? await getAssessmentReportUrl(athleteProfile.assessment_report_path)
    : null;
  const mileageHistory = await getWeeklyMileageHistory(profile.id, 8);

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
          <Link href="/athlete/races" className="text-[var(--color-muted)] hover:text-[var(--color-paper)]">
            Races
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
        <h1 className="mb-6 font-display text-3xl tracking-wide">My Profile</h1>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl tracking-wide">Weekly Mileage (Last 8 Weeks)</h2>
          <MileageChart data={mileageHistory} />
        </section>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl tracking-wide">Gear</h2>
          <GearFields
            athleteId={profile.id}
            watch={athleteProfile.watch ?? ""}
            shoe={athleteProfile.shoe ?? ""}
          />
        </section>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl tracking-wide">Training Numbers</h2>
          <p className="mb-3 text-xs text-[var(--color-muted)]">Set by your coach.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {COACH_SET_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <div className="mb-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {label}
                </div>
                <div className="text-sm text-[var(--color-paper)]">
                  {athleteProfile[key] || <span className="text-[#666]">Not set yet</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl tracking-wide">Coach Assessment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ASSESSMENT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <div className="mb-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {label}
                </div>
                <div className="whitespace-pre-wrap text-sm text-[var(--color-paper)]">
                  {athleteProfile[key] || <span className="text-[#666]">Not set yet</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="mb-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Assessment Report
            </div>
            {reportUrl ? (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-red-bright)] hover:underline"
              >
                Download {athleteProfile.assessment_report_filename}
              </a>
            ) : (
              <p className="text-sm text-[#666]">No report uploaded yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
