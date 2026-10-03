"use client";

import { useState, useTransition } from "react";
import { submitOnboarding } from "../actions";
import {
  ONBOARDING_SECTIONS,
  ONBOARDING_STEP_TITLES,
  normalizeName,
  type Field,
} from "@/lib/onboarding-form";

const border = { borderColor: "var(--color-line)" };
const inputClass =
  "w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]";
const labelClass = "mb-1 block text-sm text-[var(--color-paper)]";

export default function OnboardingForm({
  token,
  email,
  waiverText,
}: {
  token: string;
  email: string;
  waiverText: string;
}) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const lastStep = ONBOARDING_SECTIONS.length;
  const isWaiverStep = step === lastStep;
  const section = ONBOARDING_SECTIONS[step];

  function set(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function goTo(next: number) {
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function validateSection(): string | null {
    for (const field of section.fields) {
      if (field.required && !(values[field.name] ?? "").trim()) {
        return `Please answer: ${field.label}`;
      }
    }
    return null;
  }

  function submit() {
    const fullName = `${values.firstName ?? ""} ${values.lastName ?? ""}`;
    if (!waiverAccepted) return setError("Please accept the waiver to continue");
    if (normalizeName(signature) !== normalizeName(fullName)) {
      return setError("Your signature must match your first and last name");
    }
    setError(null);
    startTransition(async () => {
      const result = await submitOnboarding(token, {
        answers: values,
        waiverAccepted,
        waiverSignature: signature,
      });
      if (result.ok) setDone(true);
      else setError(result.error);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isWaiverStep) return submit();
    const problem = validateSection();
    if (problem) return setError(problem);
    goTo(step + 1);
  }

  function renderField(field: Field) {
    const value = values[field.name] ?? "";

    if (field.type === "yesno") {
      return (
        <div>
          <div className="flex gap-2">
            {["Yes", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => set(field.name, option)}
                className="rounded border px-5 py-1.5 text-xs uppercase tracking-wide"
                style={{
                  borderColor: value === option ? "var(--color-red)" : "var(--color-line)",
                  background: value === option ? "rgba(192, 57, 43, 0.15)" : "transparent",
                }}
              >
                {option}
              </button>
            ))}
          </div>
          {value === "Yes" && field.detail && (
            <textarea
              rows={2}
              placeholder={field.detail}
              value={values[`${field.name}_detail`] ?? ""}
              onChange={(e) => set(`${field.name}_detail`, e.target.value)}
              className={`${inputClass} mt-2`}
              style={border}
            />
          )}
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => set(field.name, e.target.value)}
          className={inputClass}
          style={border}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => set(field.name, e.target.value)}
          className={`${inputClass} bg-[var(--color-panel)]`}
          style={border}
        >
          <option value="">Select…</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type === "text" ? "text" : field.type}
        step={field.type === "number" ? "any" : undefined}
        value={value}
        onChange={(e) => set(field.name, e.target.value)}
        className={inputClass}
        style={border}
      />
    );
  }

  if (done) {
    return (
      <div className="rounded-lg border p-6" style={{ ...border, background: "var(--color-panel)" }}>
        <h2 className="mb-2 font-display text-2xl tracking-wide">Thank you</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Your details have been submitted. Your coach will review them, and you&apos;ll get an email at{" "}
          {email} once your account is ready.
        </p>
      </div>
    );
  }

  const needsClearance =
    step === 1 &&
    section.fields.some((f) => f.clearance && values[f.name] === "Yes");

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-muted)]">
          <span className="uppercase tracking-wide">{ONBOARDING_STEP_TITLES[step]}</span>
          <span>
            Step {step + 1} of {lastStep + 1}
          </span>
        </div>
        <div className="h-1 rounded" style={{ background: "var(--color-line)" }}>
          <div
            className="h-1 rounded"
            style={{
              width: `${((step + 1) / (lastStep + 1)) * 100}%`,
              background: "var(--color-red)",
            }}
          />
        </div>
      </div>

      {isWaiverStep ? (
        <section>
          <h2 className="mb-3 font-display text-2xl tracking-wide">Waiver</h2>
          <div
            className="mb-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded border p-4 text-xs text-[var(--color-muted)]"
            style={border}
          >
            {waiverText}
          </div>
          <label className="mb-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={waiverAccepted}
              onChange={(e) => setWaiverAccepted(e.target.checked)}
              className="mt-1"
            />
            <span>I have read and agree to the waiver above.</span>
          </label>
          <label className={labelClass}>
            Type your full name to sign <span className="text-[var(--color-red-bright)]">*</span>
          </label>
          <input
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={`${values.firstName ?? ""} ${values.lastName ?? ""}`.trim()}
            className={inputClass}
            style={border}
          />
        </section>
      ) : (
        <section>
          <h2 className="mb-1 font-display text-2xl tracking-wide">{section.title}</h2>
          {section.intro && <p className="mb-4 text-sm text-[var(--color-muted)]">{section.intro}</p>}
          <div className="mt-4 space-y-5">
            {section.fields.map((field) => (
              <div key={field.name}>
                <label className={labelClass}>
                  {field.label}
                  {field.required && <span className="text-[var(--color-red-bright)]"> *</span>}
                </label>
                {field.hint && <p className="mb-1 text-xs text-[var(--color-muted)]">{field.hint}</p>}
                {renderField(field)}
              </div>
            ))}
          </div>
          {needsClearance && (
            <p
              className="mt-5 rounded border p-3 text-xs"
              style={{ borderColor: "rgba(224, 163, 82, 0.4)", background: "rgba(224, 163, 82, 0.1)", color: "#e0a352" }}
            >
              Because of one of your answers, you&apos;ll need medical clearance from a doctor before
              starting training. Your coach will follow up with you.
            </p>
          )}
        </section>
      )}

      {error && <p className="mt-5 text-sm text-[var(--color-red-bright)]">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => goTo(step - 1)}
          disabled={step === 0 || isPending}
          className="rounded border px-5 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-paper)] disabled:invisible"
          style={border}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded border px-6 py-2 text-xs uppercase tracking-wide hover:border-[var(--color-red)] disabled:opacity-50"
          style={border}
        >
          {isWaiverStep ? (isPending ? "Submitting…" : "Submit") : "Next"}
        </button>
      </div>
    </form>
  );
}
