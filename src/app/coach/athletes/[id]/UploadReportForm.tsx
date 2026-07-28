"use client";

import { useRef, useState, useTransition } from "react";
import { uploadAssessmentReport } from "@/app/actions";

export default function UploadReportForm({ athleteId }: { athleteId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await uploadAssessmentReport(athleteId, formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mt-3 flex flex-wrap items-center gap-3">
      <input
        type="file"
        name="file"
        accept=".pdf,.doc,.docx"
        required
        className="text-sm text-[var(--color-muted)]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded border px-4 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50"
        style={{ borderColor: "var(--color-line)" }}
      >
        {isPending ? "Uploading…" : "Upload report"}
      </button>
      {error && <span className="text-xs text-[var(--color-red-bright)]">{error}</span>}
    </form>
  );
}
