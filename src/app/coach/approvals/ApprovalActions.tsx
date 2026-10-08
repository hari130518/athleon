"use client";

import { useState, useTransition } from "react";
import { approveOnboarding, rejectOnboarding, resendSetupLink } from "@/app/actions";

const border = { borderColor: "var(--color-line)" };
const buttonClass =
  "rounded border px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50";

export function PendingActions({ inviteId, name }: { inviteId: string; name: string }) {
  const [isRejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setMessage(result.error);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm(`Approve ${name}? This creates their login and emails them a setup link.`)) {
              run(() => approveOnboarding(inviteId));
            }
          }}
          className={buttonClass}
          style={{ ...border, color: "#5fbf82" }}
        >
          {isPending ? "Working…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setRejecting((v) => !v)}
          className={buttonClass}
          style={border}
        >
          Reject
        </button>
      </div>

      {isRejecting && (
        <div className="mt-3">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason (included in the email to the client)"
            className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
            style={border}
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm(`Reject ${name}? They'll be sent an email.`)) {
                run(() => rejectOnboarding(inviteId, reason));
              }
            }}
            className={`${buttonClass} mt-2`}
            style={{ ...border, color: "var(--color-red-bright)" }}
          >
            Confirm reject
          </button>
        </div>
      )}

      {message && <p className="mt-2 text-xs text-[var(--color-red-bright)]">{message}</p>}
    </div>
  );
}

export function ResendLinkButton({ inviteId }: { inviteId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <span>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await resendSetupLink(inviteId);
            setMessage(result.ok ? "Link sent" : result.error);
          })
        }
        className="text-xs uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-paper)] disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Resend setup link"}
      </button>
      {message && <span className="ml-2 text-xs text-[var(--color-muted)]">{message}</span>}
    </span>
  );
}
