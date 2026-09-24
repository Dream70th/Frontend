"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogo } from "@/components/GoogleLogo";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { xPct, yPct } from "@/lib/design-coordinates";

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
        className="absolute flex -translate-x-1/2 items-center justify-center gap-2 rounded-[26.5px] bg-white text-[12px] font-medium tracking-[0.72px] text-black disabled:opacity-60"
        style={{
          left: "50%",
          top: yPct(673),
          width: xPct(312),
          height: yPct(53),
        }}
      >
        <GoogleLogo />
        Google로 시작하기
      </button>
    </>
  );
}
