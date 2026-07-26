"use client";

import { useRef, useState, useTransition } from "react";
import { updateActual, updateActualDistance } from "@/app/actions";

/** Debounce delay before an edited field auto-saves. Keeping this off the
 * blur event avoids a race where navigating to another week right after
 * typing can fire the save with the *next* week's workoutId bound to the
 * handler instead of the one the text was actually typed into. */
const AUTOSAVE_DELAY_MS = 600;

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
  const actualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const distanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleActualChange(value: string) {
    setActual(value);
    setSaved(false);
    if (actualTimer.current) clearTimeout(actualTimer.current);
    actualTimer.current = setTimeout(() => {
      startTransition(async () => {
        await updateActual(workoutId, value);
        setSaved(true);
      });
    }, AUTOSAVE_DELAY_MS);
  }

  function handleDistanceChange(value: string) {
    setDistanceKm(value);
    setSaved(false);
    if (distanceTimer.current) clearTimeout(distanceTimer.current);
    distanceTimer.current = setTimeout(() => {
      startTransition(async () => {
        await updateActualDistance(workoutId, value === "" ? null : Number(value));
        setSaved(true);
      });
    }, AUTOSAVE_DELAY_MS);
  }

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
        onChange={(e) => handleActualChange(e.target.value)}
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
        onChange={(e) => handleDistanceChange(e.target.value)}
      />

      <div className="mt-1 text-right text-[0.65rem] text-[var(--color-muted)]">
        {isPending ? "Saving…" : saved ? "Saved" : "Unsaved changes"}
      </div>
    </div>
  );
}
