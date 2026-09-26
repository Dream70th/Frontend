import { createClient } from "@/lib/supabase/server";
import type { ZoneSlug } from "@/lib/zones";

/**
 * One row of the `get_my_progress()` RPC. Mirrors the return table in
 * `back/supabase/migrations/20260924120200_create_get_my_progress.sql`.
 */
export type ZoneProgress = {
  zone_slug: ZoneSlug;
  zone_name: string;
  sort_order: number;
  claim_method: "code" | "game";
  claimed: boolean;
  claimed_at: string | null;
};

/**
 * The visitor's stamp state, straight from the server. The client never
 * decides what is stamped — this is the only source of truth for the map.
 *
 * A failure here (migrations not applied yet, network blip on site) renders
 * every zone as uncleared rather than breaking the main screen, so a visitor
 * standing in the store still sees the map.
 */
export async function getMyProgress(): Promise<ZoneProgress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_progress");

  if (error) {
    console.error("get_my_progress failed:", error.message);
    return [];
  }

  return (data ?? []) as ZoneProgress[];
}

export function clearedZonesOf(progress: ZoneProgress[]): ZoneSlug[] {
  return progress.filter((zone) => zone.claimed).map((zone) => zone.zone_slug);
}
