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
     * - favicon.ico, icon.svg (app icon convention), manifest.json,
     *   icons/, and images/ (static assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|icons|images).*)",
  ],
};
