import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for the one-time setup link emailed after approval: signs the
// new athlete in, then sends them to choose their own password.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/set-password`);
  }

  const message = "This link is invalid or has expired. Ask your coach to send a new one.";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
}
