import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateAthleteProfile,
  getAthleteRaces,
  getAssessmentReportUrl,
  signOut,
} from "@/app/actions";
import { dashboardPathForRole, type AthleteProfile, type Race } from "@/lib/types";
import CoachProfileFields from "./CoachProfileFields";
import UploadReportForm from "./UploadReportForm";

export default async function CoachAthleteProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: athleteId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role !== "coach" && profile.role !== "physio") {
    redirect(dashboardPathForRole(profile.role));
  }

  const { data: athlete } = await supabase.from("profiles").select("*").eq("id", athleteId).single();
  if (!athlete) redirect("/coach/dashboard");

  const athleteProfile = (await getOrCreateAthleteProfile(athleteId)) as AthleteProfile;
  const races = (await getAthleteRaces(athleteId)) as Race[];
  const reportUrl = athleteProfile.assessment_report_path
    ? await getAssessmentReportUrl(athleteProfile.assessment_report_path)
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <div className="font-display text-2xl tracking-wide">
          ATHLE<span style={{ color: "var(--color-red)" }}>ON</span>{" "}
          <span className="ml-2 text-sm font-normal text-[var(--color-muted)]">
            {profile.role === "physio" ? "Physio" : "Coach"}
          </span>
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href={dashboardPathForRole(profile.role)}
              className="mb-2 inline-block text-xs uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-paper)]"
            >
              ← {profile.role === "physio" ? "Athletes" : "Weekly Plan"}
            </Link>
            <h1 className="font-display text-3xl tracking-wide">
              {athlete.full_name}
              {athlete.group_code ? (
                <span className="ml-2 text-lg text-[var(--color-muted)]">-{athlete.group_code}</span>
              ) : null}
            </h1>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl tracking-wide">
            {profile.role === "physio" ? "Assessment" : "Training Numbers & Assessment"}
          </h2>
          <CoachProfileFields
            athleteId={athleteId}
            profile={athleteProfile}
            showTrainingNumbers={profile.role !== "physio"}
          />
        </section>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl tracking-wide">Gear</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                Watch
              </div>
              <div className="text-sm text-[var(--color-paper)]">
                {athleteProfile.watch || <span className="text-[#666]">Not set by athlete</span>}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                Shoe
              </div>
              <div className="text-sm text-[var(--color-paper)]">
                {athleteProfile.shoe || <span className="text-[#666]">Not set by athlete</span>}
              </div>
            </div>
          </div>
        </section>

        {profile.role !== "physio" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-wide">Upcoming Races</h2>
              <Link
                href="/coach/races"
                className="text-xs uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-paper)]"
              >
                Manage race list →
              </Link>
            </div>
            {races.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                {athlete.full_name} hasn&apos;t picked any races yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {races.map((race) => (
                  <li
                    key={race.id}
                    className="rounded border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
                  >
                    {race.name} — {race.race_date}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl tracking-wide">Assessment Report</h2>
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
          {profile.role === "physio" && <UploadReportForm athleteId={athleteId} />}
        </section>
      </main>
    </div>
  );
}
