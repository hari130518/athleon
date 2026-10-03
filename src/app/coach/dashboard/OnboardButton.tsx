"use client";

import { useState, useTransition } from "react";
import { inviteClient } from "@/app/actions";

export default function OnboardButton() {
  const [isOpen, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setEmail("");
    setMessage(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await inviteClient(email);
      if (result.ok) {
        setMessage({ kind: "ok", text: `Invite sent to ${email.trim()}` });
        setEmail("");
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border px-3 py-1.5 text-xs uppercase tracking-wide hover:border-[var(--color-red)]"
        style={{ borderColor: "var(--color-line)" }}
      >
        Onboard
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={close}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-lg border p-5"
            style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
          >
            <h3 className="mb-1 font-display text-lg tracking-wide">Onboard a new client</h3>
            <p className="mb-3 text-xs text-[var(--color-muted)]">
              We&apos;ll email them a link to sign the waiver and share their running details.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            />
            {message && (
              <p
                className="mt-3 text-xs"
                style={{ color: message.kind === "ok" ? "#5fbf82" : "var(--color-red-bright)" }}
              >
                {message.text}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded border px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-paper)]"
                style={{ borderColor: "var(--color-line)" }}
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded border px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50"
                style={{ borderColor: "var(--color-line)" }}
              >
                {isPending ? "Sending…" : "Send invite"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
