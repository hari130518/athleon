"use client";

import { useState, useTransition } from "react";
import { assignCoach } from "../actions";

export default function AssignCoachSelect({
  athleteId,
  coachId,
  coaches,
}: {
  athleteId: string;
  coachId: string | null;
  coaches: { id: string; full_name: string }[];
}) {
  const [value, setValue] = useState(coachId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value;
          const previous = value;
          setValue(next);
          setError(null);
          startTransition(async () => {
            const result = await assignCoach(athleteId, next || null);
            if (!result.ok) {
              setValue(previous);
              setError(result.error);
            }
          });
        }}
        className="rounded border bg-[var(--color-panel)] px-2 py-1.5 text-xs outline-none focus:border-[var(--color-red)] disabled:opacity-50"
        style={{ borderColor: "var(--color-line)" }}
      >
        <option value="">Unassigned</option>
        {coaches.map((c) => (
          <option key={c.id} value={c.id}>
            {c.full_name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[var(--color-red-bright)]">{error}</p>}
    </div>
  );
}
