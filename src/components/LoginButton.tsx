"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogo } from "@/components/GoogleLogo";

/**
 * Positions itself nowhere on purpose. It shares a column with 물품 보기 on the
 * login screen, and a gap in design-% shrinks as the poster scales down while
 * the buttons stay the same height in CSS px — on a 667pt screen the two ended
 * up 2px apart. LoginScreen stacks them instead, so the gap is the same
 * everywhere.
 */
export function LoginButton({ isInAppBrowser }: { isInAppBrowser: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isInAppBrowser || isLoading}
      className="border-trail-orange flex w-max items-center justify-center gap-2.5 rounded-full border-[3px] border-dotted bg-[#D9C27E] px-6 py-3 text-base font-bold whitespace-nowrap text-black shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:opacity-60 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#cc4b00]"
    >
      <GoogleLogo className="h-6 w-6" />
      Google로 시작하기
    </button>
  );
}
