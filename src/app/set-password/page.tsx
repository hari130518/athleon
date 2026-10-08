import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SetPasswordForm from "./SetPasswordForm";

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
      >
        <div className="font-display text-2xl tracking-wide">
          ATHLE<span style={{ color: "var(--color-red)" }}>ON</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-sm flex-1 px-6 py-10">
        <h1 className="mb-1 font-display text-3xl tracking-wide">Choose your password</h1>
        <p className="mb-6 text-sm text-[var(--color-muted)]">
          Welcome to AthleOn. Set a password to finish setting up your account. You&apos;ll use it with{" "}
          {user.email} to sign in.
        </p>
        <SetPasswordForm />
      </main>
    </div>
  );
}
