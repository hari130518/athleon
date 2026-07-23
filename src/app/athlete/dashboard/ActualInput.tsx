"use client";

import { useState, useTransition } from "react";
import { updateActual, updateActualDistance } from "@/app/actions";

export default function ActualInput({
  workoutId,
  initialActual,
  initialDistanceKm,
}: {
  workoutId: string;
  initialActual: string;
  initialDistanceKm: number | null;
}) {
  const [actual, setActual] = useState(initialActual);
  const [distanceKm, setDistanceKm] = useState(initialDistanceKm?.toString() ?? "");
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
        Actual
      </label>
      <textarea
        rows={2}
        className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
        style={{ borderColor: "var(--color-line)" }}
        placeholder="Log what you actually did..."
        value={actual}
        onChange={(e) => {
          setActual(e.target.value);
          setSaved(false);
        }}
        onBlur={() =>
          startTransition(async () => {
            await updateActual(workoutId, actual);
            setSaved(true);
          })
        }
      />

      <label className="mt-2 mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
        Total Distance (km)
      </label>
      <input
        type="number"
        step="0.1"
        className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
        style={{ borderColor: "var(--color-line)" }}
        placeholder="0"
        value={distanceKm}
        onChange={(e) => {
          setDistanceKm(e.target.value);
          setSaved(false);
        }}
        onBlur={() =>
          startTransition(async () => {
            await updateActualDistance(workoutId, distanceKm === "" ? null : Number(distanceKm));
            setSaved(true);
          })
        }
      />

      <div className="mt-1 text-right text-[0.65rem] text-[var(--color-muted)]">
        {isPending ? "Saving…" : saved ? "Saved" : "Unsaved changes"}
      </div>
    </div>
  );
}
