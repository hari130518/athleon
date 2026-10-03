"use client";

import { useState, useTransition } from "react";
import { submitOnboarding } from "../actions";

const inputClass =
  "w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-[var(--color-red-bright)]"> *</span>}
      </label>
      {children}
    </div>
  );
}

export default function OnboardingForm({
  token,
  email,
  waiverText,
}: {
  token: string;
  email: string;
  waiverText: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const get = (name: string) => String(fd.get(name) ?? "");

    startTransition(async () => {
      const result = await submitOnboarding(token, {
        fullName: get("fullName"),
        phone: get("phone"),
        dateOfBirth: get("dateOfBirth"),
        experienceYears: get("experienceYears"),
        weeklyMileageKm: get("weeklyMileageKm"),
        recentResults: get("recentResults"),
        goalRace: get("goalRace"),
        goalDate: get("goalDate"),
        injuries: get("injuries"),
        emergencyName: get("emergencyName"),
        emergencyPhone: get("emergencyPhone"),
        waiverSignature: get("waiverSignature"),
        waiverAccepted: fd.get("waiverAccepted") === "on",
      });
      if (result.ok) setDone(true);
      else setError(result.error);
    });
  }

  if (done) {
    return (
      <div className="rounded-lg border p-6" style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}>
        <h2 className="mb-2 font-display text-2xl tracking-wide">Thank you</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Your details have been submitted. Your coach will review them and you&apos;ll get an email at{" "}
          {email} once your account is ready.
        </p>
      </div>
    );
  }

  const border = { borderColor: "var(--color-line)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <h2 className="mb-3 font-display text-xl tracking-wide">About you</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input name="fullName" required className={inputClass} style={border} />
          </Field>
          <Field label="Email">
            <input value={email} disabled className={`${inputClass} text-[#666]`} style={border} />
          </Field>
          <Field label="Phone" required>
            <input name="phone" type="tel" required className={inputClass} style={border} />
          </Field>
          <Field label="Date of birth" required>
            <input name="dateOfBirth" type="date" required className={inputClass} style={border} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl tracking-wide">Your running</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Years of running experience">
            <input name="experienceYears" type="number" min="0" step="0.5" className={inputClass} style={border} />
          </Field>
          <Field label="Current weekly mileage (km)">
            <input name="weeklyMileageKm" type="number" min="0" step="0.1" className={inputClass} style={border} />
          </Field>
          <Field label="Goal race">
            <input name="goalRace" className={inputClass} style={border} />
          </Field>
          <Field label="Goal race date">
            <input name="goalDate" type="date" className={inputClass} style={border} />
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Recent race results / personal bests">
            <textarea name="recentResults" rows={3} className={inputClass} style={border} />
          </Field>
          <Field label="Injuries or medical conditions we should know about">
            <textarea name="injuries" rows={3} className={inputClass} style={border} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl tracking-wide">Emergency contact</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contact name" required>
            <input name="emergencyName" required className={inputClass} style={border} />
          </Field>
          <Field label="Contact phone" required>
            <input name="emergencyPhone" type="tel" required className={inputClass} style={border} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl tracking-wide">Waiver</h2>
        <div
          className="mb-4 max-h-56 overflow-y-auto whitespace-pre-wrap rounded border p-4 text-xs text-[var(--color-muted)]"
          style={border}
        >
          {waiverText}
        </div>
        <label className="mb-4 flex items-start gap-2 text-sm">
          <input name="waiverAccepted" type="checkbox" required className="mt-1" />
          <span>I have read and agree to the waiver above.</span>
        </label>
        <Field label="Type your full name to sign" required>
          <input name="waiverSignature" required className={inputClass} style={border} />
        </Field>
      </section>

      {error && <p className="text-sm text-[var(--color-red-bright)]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded border px-6 py-2.5 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50"
        style={border}
      >
        {isPending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
