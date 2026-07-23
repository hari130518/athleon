"use client";

import { Fragment, useState, useTransition } from "react";
import { updatePlanned, updateActual } from "@/app/actions";
import { DAYS, DAY_LABELS, weekTotalDistance, type Profile, type Week, type DayOfWeek } from "@/lib/types";

type Row = { athlete: Profile; week: Week };

export default function CoachWeekGrid({ rows }: { rows: Row[] }) {
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
        {athlete.full_name}
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
            key={day}
            workoutId={workout.id}
            planned={workout.planned ?? ""}
            actual={workout.actual ?? ""}
          />
        );
      })}
    </tr>
  );
}

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

  return (
    <>
      <td className="p-0 align-top">
        <textarea
          className="cell-input"
          rows={2}
          placeholder="e.g. 7kE + 5 strides"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
          onBlur={() => startTransition(() => updatePlanned(workoutId, planned))}
        />
      </td>
      <td className="p-0 align-top">
        <textarea
          className="cell-input"
          rows={2}
          placeholder="—"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          onBlur={() => startTransition(() => updateActual(workoutId, actual))}
        />
      </td>
    </>
  );
}
