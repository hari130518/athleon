import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <BrandLogo />
      </header>
      <main className="mx-auto w-full max-w-sm flex-1 px-6 py-10">
        <h1 className="mb-1 font-display text-3xl tracking-wide">Forgot your password?</h1>
        <p className="mb-6 text-sm text-[var(--color-muted)]">
          Enter your email and we&apos;ll send you a link to choose a new one.
        </p>
        <ForgotPasswordForm />
        <Link
          href="/login"
          className="mt-6 inline-block text-xs uppercase tracking-wide text-[var(--color-muted)] hover:text-[var(--color-paper)]"
        >
          ← Back to sign in
        </Link>
      </main>
    </div>
  );
}
