import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWeek, signOut } from "@/app/actions";
import { mondayOf, addDaysToISO, formatWeekRange, type Week } from "@/lib/types";
import CoachWeekGrid from "./WeekGrid";

export default async function CoachDashboardPage({
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
  if (profile.role !== "coach") redirect("/athlete/dashboard");

  const params = await searchParams;
  const weekStart = params.week || mondayOf(new Date());
  const prevWeek = addDaysToISO(weekStart, -7);
  const nextWeek = addDaysToISO(weekStart, 7);

  const { data: athletes } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "athlete")
    .order("full_name");

  const weeks = await Promise.all(
    (athletes || []).map((a) => getOrCreateWeek(a.id, weekStart))
  );

  const rows = (athletes || []).map((athlete, i) => ({
    athlete,
    week: weeks[i] as Week,
  }));

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

      <main className="flex-1 px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Weekly Plan</h1>
            <p className="text-sm text-[var(--color-muted)]">{formatWeekRange(weekStart)}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/coach/dashboard?week=${prevWeek}`}
              className="rounded border px-3 py-1.5 text-sm hover:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            >
              ← Prev week
            </Link>
            <Link
              href={`/coach/dashboard?week=${mondayOf(new Date())}`}
              className="rounded border px-3 py-1.5 text-sm hover:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            >
              This week
            </Link>
            <Link
              href={`/coach/dashboard?week=${nextWeek}`}
              className="rounded border px-3 py-1.5 text-sm hover:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            >
              Next week →
            </Link>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No athletes yet. Add one from the Supabase table editor and set their role to
            &quot;athlete&quot;.
          </p>
        ) : (
          <CoachWeekGrid rows={rows} />
        )}
      </main>
    </div>
  );
}
