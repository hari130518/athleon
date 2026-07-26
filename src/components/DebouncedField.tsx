"use client";

import { useRef, useState, useTransition } from "react";

/** Debounce delay before an edited field auto-saves (see WeekGrid.tsx /
 * ActualInput.tsx for why this isn't on blur). */
const AUTOSAVE_DELAY_MS = 600;

export default function DebouncedField({
  label,
  initialValue,
  onSave,
  disabled,
}: {
  label: string;
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    setValue(next);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startTransition(async () => {
        await onSave(next);
        setSaved(true);
      });
    }, AUTOSAVE_DELAY_MS);
  }

  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </label>
      <input
        type="text"
        disabled={disabled}
        className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)] disabled:cursor-not-allowed disabled:text-[#666]"
        style={{ borderColor: "var(--color-line)" }}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      {!disabled && (
        <div className="mt-0.5 text-right text-[0.6rem] text-[var(--color-muted)]">
          {isPending ? "Saving…" : saved ? "Saved" : "Unsaved changes"}
        </div>
      )}
    </div>
  );
}
