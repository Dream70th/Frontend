"use client";

import { useEffect, useRef } from "react";

/**
 * The map's moving artwork — drifting clouds, breaking sea.
 *
 * H.264 only, on purpose. The WebM cut of this loop is VP9 4:4:4, and iOS 17.4
 * onwards answers yes when asked whether it can play `video/webm`: Safari
 * picked that source, discovered its decoder does not do 4:4:4, and stopped.
 * A browser does not reach for a later <source> once a decode has failed, so
 * every iPhone sat on the poster frame while desktop Chrome played fine.
 */
export function TrailBackdrop() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Safari can decline the initial autoplay, and a home-screen app comes back
    // from the background with the video paused. Asking again costs nothing
    // when it is already running. (Low Power Mode refuses either way.)
    function start() {
      if (document.visibilityState !== "visible") return;
      void video?.play().catch(() => {});
    }

    start();
    document.addEventListener("visibilitychange", start);
    return () => document.removeEventListener("visibilitychange", start);
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-fill"
      style={{ imageRendering: "pixelated" }}
      poster="/images/trail-map-bg.png"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    >
      <source src="/images/trail-map-bg.mp4" type="video/mp4" />
    </video>
  );
}
