import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWeek, signOut } from "@/app/actions";
import { mondayOf, addDaysToISO, formatWeekRange, DAYS, DAY_LABELS, type Week } from "@/lib/types";
import ActualInput from "./ActualInput";

export default async function AthleteDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (profile.role !== "athlete") redirect("/coach/dashboard");

  const params = await searchParams;
  const weekStart = params.week || mondayOf(new Date());
  const prevWeek = addDaysToISO(weekStart, -7);
  const nextWeek = addDaysToISO(weekStart, 7);

  const week = (await getOrCreateWeek(profile.id, weekStart)) as Week | null;

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wide">My Week</h1>
            <p className="text-sm text-[var(--color-muted)]">
              {formatWeekRange(weekStart)}
              {week?.week_mileage ? ` · Target ${week.week_mileage} km` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/athlete/dashboard?week=${prevWeek}`}
              className="rounded border px-3 py-1.5 text-sm hover:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            >
              ←
            </Link>
            <Link
              href={`/athlete/dashboard?week=${nextWeek}`}
              className="rounded border px-3 py-1.5 text-sm hover:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            >
              →
            </Link>
          </div>
        </div>

        {!week ? (
          <p className="text-sm text-[var(--color-muted)]">
            Your coach hasn&apos;t published this week yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-3">
            {DAYS.map((day) => {
              const workout = week.workouts.find((w) => w.day_of_week === day);
              return (
                <div
                  key={day}
                  className="rounded-lg border p-4"
                  style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
                >
                  <div className="mb-2 font-display text-lg tracking-wide">{DAY_LABELS[day]}</div>
                  <p className="mb-3 text-sm text-[var(--color-muted)]">
                    {workout?.planned || "Rest day / nothing planned"}
                  </p>
                  {workout && (
                    <ActualInput workoutId={workout.id} initialActual={workout.actual ?? ""} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
