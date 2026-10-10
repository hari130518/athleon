"use client";

import { useState, useTransition } from "react";
import { deleteAthleteAccount } from "../actions";

export default function DeleteAthleteButton({
  athleteId,
  name,
  email,
}: {
  athleteId: string;
  name: string;
  email: string;
}) {
  const [isOpen, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleteOnboarding, setDeleteOnboarding] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const matches = typed.trim().toLowerCase() === name.trim().toLowerCase();

  function close() {
    if (isPending) return;
    setOpen(false);
    setTyped("");
    setError(null);
  }

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAthleteAccount(athleteId, deleteOnboarding);
      if (result.ok) {
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border px-3 py-1.5 text-xs uppercase tracking-wide hover:border-[var(--color-red)]"
        style={{ borderColor: "var(--color-line)", color: "var(--color-red-bright)" }}
      >
        Delete
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={close}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border p-5"
            style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
          >
            <h3 className="mb-2 font-display text-lg tracking-wide">Delete {name}?</h3>
            <p className="mb-3 text-sm text-[var(--color-muted)]">
              This permanently deletes <strong className="text-[var(--color-paper)]">{email}</strong> and
              everything attached: their login, all weekly plans and logged workouts, athlete profile, race
              selections and any uploaded assessment report. This cannot be undone.
            </p>

            <label className="mb-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={deleteOnboarding}
                onChange={(e) => setDeleteOnboarding(e.target.checked)}
                className="mt-1"
              />
              <span>
                Also delete their onboarding record (signed waiver and health answers). Untick to keep it.
              </span>
            </label>

            <label className="mb-1 block text-xs text-[var(--color-muted)]">
              Type <strong className="text-[var(--color-paper)]">{name}</strong> to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            />

            {error && <p className="mt-3 text-xs text-[var(--color-red-bright)]">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={isPending}
                className="rounded border px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-paper)] disabled:opacity-50"
                style={{ borderColor: "var(--color-line)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={!matches || isPending}
                className="rounded border px-4 py-2 text-xs uppercase tracking-wide disabled:opacity-40"
                style={{ borderColor: "var(--color-red)", background: "rgba(192, 57, 43, 0.2)" }}
              >
                {isPending ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
