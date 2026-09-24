"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogo } from "@/components/GoogleLogo";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { yPct } from "@/lib/design-coordinates";

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
    <>
      {isInAppBrowser && <InAppBrowserBanner />}
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isInAppBrowser || isLoading}
        className="border-trail-orange absolute flex w-max -translate-x-1/2 items-center justify-center gap-2.5 rounded-full border-[3px] border-dotted bg-[#D9C27E] px-6 py-3 text-base font-bold whitespace-nowrap text-black shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:opacity-60 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#cc4b00]"
        style={{
          left: "50%",
          top: yPct(673),
        }}
      >
        <GoogleLogo className="h-6 w-6" />
        Google로 시작하기
      </button>
    </>
  );
}
