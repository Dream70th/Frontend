import { createClient } from "@/lib/supabase/server";

export type Department = { slug: string; name: string };

export type VisitorProfile = {
  /** Name from the Google account — a starting point for the signup form. */
  displayName: string | null;
  /** Real name, once the visitor has given one. */
  realName: string | null;
  department: string | null;
  seenGuide: boolean;
  /** Whether the completion screen has already been shown. */
  celebrated: boolean;
};

/**
 * The visitor's own row. Server-owned on purpose: someone who scans the QR in
 * KakaoTalk's in-app browser and then reopens the site in Chrome is the same
 * person, and should not sit through the guide or the signup form twice.
 *
 * On failure we report the guide as seen and the signup as done, rather than
 * risk dropping either on top of the map for someone who has been walking the
 * trail for ten minutes.
 */
export async function getVisitorProfile(): Promise<VisitorProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, real_name, department, onboarded_at, celebrated_at")
    .maybeSingle();

  if (error) {
    console.error("profile lookup failed:", error.message);
    return {
      displayName: null,
      realName: "",
      department: "",
      seenGuide: true,
      celebrated: true,
    };
  }

  return {
    displayName: data?.display_name ?? null,
    realName: data?.real_name ?? null,
    department: data?.department ?? null,
    seenGuide: data?.onboarded_at != null,
    celebrated: data?.celebrated_at != null,
  };
}

export function hasSignedUp(profile: VisitorProfile): boolean {
  return Boolean(profile.realName && profile.department);
}

/**
 * The department list, straight from the table so the picker and the server
 * agree on it. An empty list would leave the form unanswerable, so a failure
 * here is reported and the caller skips the form rather than trapping anyone.
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("slug, name")
    .order("sort_order");

  if (error) {
    console.error("departments lookup failed:", error.message);
    return [];
  }

  return (data ?? []) as Department[];
}

/** Whether this visitor is already in the draw. */
export async function hasEnteredRaffle(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("raffle_entries")
    .select("entered_at")
    .maybeSingle();

  if (error) {
    console.error("raffle lookup failed:", error.message);
    return false;
  }

  return data != null;
}
