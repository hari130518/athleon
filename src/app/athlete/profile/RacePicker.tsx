"use client";

import { useState, useTransition } from "react";
import { selectRace, deselectRace } from "@/app/actions";
import { MAX_ATHLETE_RACES, type Race } from "@/lib/types";

export default function RacePicker({
  athleteId,
  allRaces,
  initialSelectedIds,
}: {
  athleteId: string;
  allRaces: Race[];
  initialSelectedIds: string[];
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [isPending, startTransition] = useTransition();

  const atLimit = selectedIds.length >= MAX_ATHLETE_RACES;

  function toggle(raceId: string, isSelected: boolean) {
    if (isSelected) {
      setSelectedIds((prev) => prev.filter((id) => id !== raceId));
      startTransition(() => deselectRace(athleteId, raceId));
    } else {
      if (atLimit) return;
      setSelectedIds((prev) => [...prev, raceId]);
      startTransition(() => selectRace(athleteId, raceId));
    }
  }

  return (
    <div>
      <p className="mb-3 text-xs text-[var(--color-muted)]">
        Pick up to {MAX_ATHLETE_RACES} races ({selectedIds.length}/{MAX_ATHLETE_RACES} selected).
      </p>
      {allRaces.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">Your coach hasn&apos;t added any races yet.</p>
      ) : (
        <ul className="space-y-2">
          {allRaces.map((race) => {
            const isSelected = selectedIds.includes(race.id);
            return (
              <li key={race.id}>
                <label
                  className={`flex items-center justify-between rounded border px-3 py-2 text-sm ${
                    !isSelected && atLimit ? "opacity-50" : "cursor-pointer"
                  }`}
                  style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
                >
                  <span>
                    {race.name} — {race.race_date}
                  </span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isPending || (!isSelected && atLimit)}
                    onChange={() => toggle(race.id, isSelected)}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
