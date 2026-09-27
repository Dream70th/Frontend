"use client";

import { useEffect, useState } from "react";

/**
 * TEMPORARY — a 62pt band of page background sits along the foot of the app on
 * an iPhone and none of the fixes aimed at it have moved it, so stop guessing
 * and read what the device actually reports.
 */
export function ViewportProbe() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    function read() {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;top:0;left:0;width:1px;visibility:hidden;" +
        "height:100dvh;padding-top:env(safe-area-inset-top);" +
        "padding-bottom:env(safe-area-inset-bottom)";
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const dvh = parseFloat(cs.height);
      const safeTop = parseFloat(cs.paddingTop);
      const safeBottom = parseFloat(cs.paddingBottom);
      probe.style.height = "100vh";
      const vh = parseFloat(getComputedStyle(probe).height);
      probe.style.height = "100lvh";
      const lvh = parseFloat(getComputedStyle(probe).height);
      probe.style.height = "100svh";
      const svh = parseFloat(getComputedStyle(probe).height);
      probe.remove();

      const de = document.documentElement;
      const vv = window.visualViewport;
      const app = document.querySelector(".bg-letterbox")?.getBoundingClientRect();

      setLines([
        `inner ${window.innerWidth}x${window.innerHeight} client ${de.clientWidth}x${de.clientHeight}`,
        `screen ${screen.width}x${screen.height} avail ${screen.availWidth}x${screen.availHeight}`,
        `vv ${vv ? `${Math.round(vv.width)}x${Math.round(vv.height)} off ${Math.round(vv.offsetTop)} scale ${vv.scale.toFixed(2)}` : "n/a"}`,
        `vh ${vh} dvh ${dvh} svh ${svh} lvh ${lvh}`,
        `safe top ${safeTop} bottom ${safeBottom} | dpr ${devicePixelRatio}`,
        `app box ${app ? `${Math.round(app.width)}x${Math.round(app.height)} @${Math.round(app.top)},${Math.round(app.left)}` : "n/a"}`,
        `standalone ${String(window.matchMedia("(display-mode: standalone)").matches)}`,
      ]);
    }

    read();
    window.addEventListener("resize", read);
    window.visualViewport?.addEventListener("resize", read);
    return () => {
      window.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("resize", read);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: "env(safe-area-inset-top, 0px)",
        zIndex: 95,
        background: "rgba(0,0,0,0.85)",
        color: "#7CFF9B",
        font: "600 10px/1.45 ui-monospace, monospace",
        padding: "3px 5px",
        wordBreak: "break-all",
      }}
    >
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
