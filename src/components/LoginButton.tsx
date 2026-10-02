"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogo } from "@/components/GoogleLogo";
import { TrailButton } from "@/components/TrailButton";

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
    <TrailButton onClick={handleSignIn} disabled={isInAppBrowser || isLoading}>
      <GoogleLogo className="h-6 w-6" />
      Google로 시작하기
    </TrailButton>
  );
}
