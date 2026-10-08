"use client";

import { useState, useTransition } from "react";
import { setPassword } from "@/app/actions";

const border = { borderColor: "var(--color-line)" };
const inputClass =
  "w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]";

export default function SetPasswordForm() {
  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError("The two passwords don't match");
    setError(null);
    startTransition(async () => {
      const result = await setPassword(password);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm">New password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          className={inputClass}
          style={border}
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">At least 8 characters.</p>
      </div>
      <div>
        <label className="mb-1 block text-sm">Confirm password</label>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          style={border}
        />
      </div>
      {error && <p className="text-sm text-[var(--color-red-bright)]">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded border px-6 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50"
        style={border}
      >
        {isPending ? "Saving…" : "Save and continue"}
      </button>
    </form>
  );
}
