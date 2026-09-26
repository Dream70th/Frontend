import Image from "next/image";
import { headers } from "next/headers";
import { LetterboxViewport } from "@/components/LetterboxViewport";
import { LoginButton } from "@/components/LoginButton";
import { isInAppBrowser } from "@/lib/in-app-browser";

export default async function LoginPage() {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? "";

  return (
    <LetterboxViewport backdrop="/images/login-bg.png">
      <Image
        src="/images/login-bg.png"
        alt="WHO MADE THIS TRAIL — 70주년 팝업플레이스"
        fill
        priority
        className="object-cover"
      />
      <LoginButton isInAppBrowser={isInAppBrowser(userAgent)} />
    </LetterboxViewport>
  );
}
