import { createClient } from "@/lib/supabase/server";

/**
 * Whether this visitor has already been shown the first-visit guide.
 *
 * Server-owned on purpose: a visitor who scans the QR in KakaoTalk's in-app
 * browser and then reopens the site in Chrome is the same person, and should
 * not sit through the guide twice.
 *
 * On failure we say "already seen" rather than risk showing the guide on top
 * of the map to someone who has been walking the trail for ten minutes.
 */
export async function hasSeenGuide(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarded_at")
    .maybeSingle();

  if (error) {
    console.error("profile lookup failed:", error.message);
    return true;
  }

  return data?.onboarded_at != null;
}
