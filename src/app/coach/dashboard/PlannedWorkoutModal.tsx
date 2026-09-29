"use client";

import { useState } from "react";
import { WORKOUT_TYPES, WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS, type WorkoutType } from "@/lib/types";

export default function PlannedWorkoutModal({
  initialPlanned,
  initialWorkoutType,
  isSaving,
  onSave,
  onClose,
}: {
  initialPlanned: string;
  initialWorkoutType: WorkoutType | null;
  isSaving: boolean;
  onSave: (planned: string, workoutType: WorkoutType | null) => void;
  onClose: () => void;
}) {
  const [planned, setPlanned] = useState(initialPlanned);
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(initialWorkoutType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border p-5"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 font-display text-lg tracking-wide">Planned Workout</h3>

        <div className="mb-3 flex flex-wrap gap-2">
          {WORKOUT_TYPES.map((type) => {
            const colors = WORKOUT_TYPE_COLORS[type];
            const isSelected = workoutType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setWorkoutType(isSelected ? null : type)}
                className="rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition"
                style={{
                  color: colors.text,
                  background: isSelected ? colors.bg : "transparent",
                  borderColor: isSelected ? colors.border : "var(--color-line)",
                }}
              >
                {WORKOUT_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>

        <textarea
          className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
          style={{ borderColor: "var(--color-line)" }}
          rows={4}
          placeholder="e.g. 8 km, Zone 2 - about 45 min"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
          autoFocus
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-paper)]"
            style={{ borderColor: "var(--color-line)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onSave(planned, workoutType)}
            className="rounded border px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50"
            style={{ borderColor: "var(--color-line)" }}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
