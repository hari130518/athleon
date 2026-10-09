"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        If an account exists for that email, we&apos;ve sent a link to choose a new password. Check your inbox
        (and spam folder).
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await requestPasswordReset(email);
          setSent(true);
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm">Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
          style={{ borderColor: "var(--color-line)" }}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded border px-6 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50"
        style={{ borderColor: "var(--color-line)" }}
      >
        {isPending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
