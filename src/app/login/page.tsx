import { headers } from "next/headers";
import { LoginScreen } from "@/components/LoginScreen";
import { isInAppBrowser } from "@/lib/in-app-browser";

export default async function LoginPage() {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? "";

  return <LoginScreen isInAppBrowser={isInAppBrowser(userAgent)} />;
}
