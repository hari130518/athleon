import { signIn } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="font-display text-5xl tracking-wide">
            ATHLE<span style={{ color: "var(--color-red)" }}>ON</span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Sign in to your training dashboard
          </p>
        </div>

        <form
          action={signIn}
          className="space-y-4 rounded-lg border p-6"
          style={{ background: "var(--color-panel)", borderColor: "var(--color-line)" }}
        >
          {params.error && (
            <div
              className="rounded border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-red)", color: "var(--color-red-bright)" }}
            >
              {params.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-red)]"
              style={{ borderColor: "var(--color-line)" }}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded py-2 text-sm font-semibold uppercase tracking-wide transition-colors"
            style={{ background: "var(--color-red)", color: "#fff" }}
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
          Accounts are created by your coach. Contact Harish if you need access.
        </p>
      </div>
    </div>
  );
}
