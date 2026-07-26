"use client";

import Link from "next/link";
import { Fragment, useRef, useState, useTransition } from "react";
import { updatePlanned, updateActual } from "@/app/actions";
import { DAYS, DAY_LABELS, weekTotalDistance, dateForDay, type Profile, type Week, type DayOfWeek } from "@/lib/types";

type Row = { athlete: Profile; week: Week };

export default function CoachWeekGrid({ rows }: { rows: Row[] }) {
  const weekStart = rows[0]?.week.week_start;
  return (
    <div className="overflow-x-auto rounded border" style={{ borderColor: "var(--color-line)" }}>
      <table className="week-grid min-w-full text-left text-sm" style={{ background: "var(--color-panel)" }}>
        <thead>
          <tr style={{ background: "var(--color-panel-raised)" }}>
            <Th sticky>Name</Th>
            <Th>Week Mileage</Th>
            {DAYS.map((day) => (
              <Th key={day} colSpan={2}>
                {DAY_LABELS[day]}
                {weekStart ? ` (${dateForDay(weekStart, day)})` : ""}
              </Th>
            ))}
          </tr>
          <tr style={{ background: "var(--color-panel-raised)" }}>
            <Th sticky small>&nbsp;</Th>
            <Th small>&nbsp;</Th>
            {DAYS.map((day) => (
              <Fragment key={day}>
                <Th small>Planned</Th>
                <Th small>Actual</Th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <AthleteRow key={row.athlete.id} athlete={row.athlete} week={row.week} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  colSpan,
  small,
  sticky,
}: {
  children: React.ReactNode;
  colSpan?: number;
  small?: boolean;
  sticky?: boolean;
}) {
  return (
    <th
      colSpan={colSpan}
      className={`whitespace-nowrap px-3 py-2 font-display tracking-wide text-[var(--color-muted)] ${
        small ? "text-[0.65rem] uppercase" : "text-sm"
      } ${sticky ? "sticky left-0 z-10" : ""}`}
      style={sticky ? { background: "var(--color-panel-raised)" } : undefined}
    >
      {children}
    </th>
  );
}

function AthleteRow({ athlete, week }: { athlete: Profile; week: Week }) {
  const workoutFor = (day: DayOfWeek) => week.workouts.find((w) => w.day_of_week === day);

  return (
    <tr>
      <td
        className="sticky left-0 z-10 whitespace-nowrap px-3 py-2 font-semibold"
        style={{ background: "var(--color-panel)" }}
      >
        <Link href={`/coach/athletes/${athlete.id}`} className="hover:text-[var(--color-red)]">
          {athlete.full_name}
        </Link>
        {athlete.group_code ? (
          <span className="ml-1 text-[var(--color-muted)]">-{athlete.group_code}</span>
        ) : null}
      </td>
      <td className="px-3 py-2 text-center">{weekTotalDistance(week)} km</td>
      {DAYS.map((day) => {
        const workout = workoutFor(day);
        if (!workout) return <td key={day} colSpan={2} />;
        return (
          <DayCells
            key={workout.id}
            workoutId={workout.id}
            planned={workout.planned ?? ""}
            actual={workout.actual ?? ""}
          />
        );
      })}
    </tr>
  );
}

/** Debounce delay before an edited cell auto-saves. Keeping this off the
 * blur event avoids a race where clicking a week-navigation link right
 * after typing can fire the save with the *next* week's workoutId bound
 * to the handler instead of the one the text was actually typed into. */
const AUTOSAVE_DELAY_MS = 600;

function DayCells({
  workoutId,
  planned: initialPlanned,
  actual: initialActual,
}: {
  workoutId: string;
  planned: string;
  actual: string;
}) {
  const [planned, setPlanned] = useState(initialPlanned);
  const [actual, setActual] = useState(initialActual);
  const [, startTransition] = useTransition();
  const plannedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePlannedChange(value: string) {
    setPlanned(value);
    if (plannedTimer.current) clearTimeout(plannedTimer.current);
    plannedTimer.current = setTimeout(() => {
      startTransition(() => updatePlanned(workoutId, value));
    }, AUTOSAVE_DELAY_MS);
  }

  function handleActualChange(value: string) {
    setActual(value);
    if (actualTimer.current) clearTimeout(actualTimer.current);
    actualTimer.current = setTimeout(() => {
      startTransition(() => updateActual(workoutId, value));
    }, AUTOSAVE_DELAY_MS);
  }

  return (
    <>
      <td className="p-0 align-top">
        <textarea
          className="cell-input"
          rows={2}
          value={planned}
          onChange={(e) => handlePlannedChange(e.target.value)}
        />
      </td>
      <td className="p-0 align-top">
        <textarea
          className="cell-input"
          rows={2}
          value={actual}
          onChange={(e) => handleActualChange(e.target.value)}
        />
      </td>
    </>
  );
}
