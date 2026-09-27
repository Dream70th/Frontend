import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - manifest.json, icons/, images/ (static assets)
     * - favicon.ico, icon.png, apple-icon.png — the files Next generates from
     *   src/app for the icon convention. These are fetched without a session,
     *   so leaving them in sent the browser a redirect to /login instead of an
     *   image and the favicon never appeared. Anything added to src/app under
     *   that convention has to be listed here too.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|icons|images).*)",
  ],
};
