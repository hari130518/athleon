"use client";

import { useState, useTransition } from "react";
import { createRace, deleteRace } from "@/app/actions";
import type { Race } from "@/lib/types";

export default function RacesManager({ initialRaces }: { initialRaces: Race[] }) {
  const [races, setRaces] = useState(initialRaces);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !date) return;
    startTransition(async () => {
      await createRace(name, date);
      setRaces((prev) =>
        [...prev, { id: crypto.randomUUID(), name, race_date: date }].sort((a, b) =>
          a.race_date.localeCompare(b.race_date)
        )
      );
      setName("");
      setDate("");
    });
  }

  function handleDelete(raceId: string) {
    startTransition(async () => {
      await deleteRace(raceId);
      setRaces((prev) => prev.filter((r) => r.id !== raceId));
    });
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Race name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
            style={{ borderColor: "var(--color-line)" }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
            style={{ borderColor: "var(--color-line)" }}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded border px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50"
          style={{ borderColor: "var(--color-line)" }}
        >
          Add race
        </button>
      </form>

      {races.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No races added yet.</p>
      ) : (
        <ul className="space-y-2">
          {races.map((race) => (
            <li
              key={race.id}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
            >
              <span>
                {race.name} — {race.race_date}
              </span>
              <button
                onClick={() => handleDelete(race.id)}
                disabled={isPending}
                className="text-xs uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-red)] disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
