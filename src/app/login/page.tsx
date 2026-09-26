import Image from "next/image";
import { headers } from "next/headers";
import { AppViewport } from "@/components/AppViewport";
import { ArtStage } from "@/components/ArtStage";
import { LoginButton } from "@/components/LoginButton";
import { isInAppBrowser } from "@/lib/in-app-browser";

export default async function LoginPage() {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? "";

  return (
    <AppViewport>
      {/* The poster is typeset edge to edge — the anniversary line at the top
          and the compass at the foot both sit close to the margin — so it has
          far less to spare than the map and leans on stretch instead. */}
      <ArtStage topSlack={55} bottomSlack={60} bleed="/images/login-bg.png">
        <Image
          src="/images/login-bg.png"
          alt="WHO MADE THIS TRAIL — 70주년 팝업플레이스"
          fill
          priority
          // ArtStage has already decided the exact box the artwork should occupy,
          // stretch and all; object-cover here would crop it a second time.
          className="object-fill"
        />
        <LoginButton isInAppBrowser={isInAppBrowser(userAgent)} />
      </ArtStage>
    </AppViewport>
  );
}
