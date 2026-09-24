/**
 * Placeholder earned-stamp badge. Figma has no design for the "stamp
 * acquired" state, so this is an original design (camping rubber-stamp
 * look) to unblock Phase 2 wiring later. Not rendered anywhere yet —
 * Phase 1's map is intentionally stamp-less per spec.
 */
export function StampBadge({ zoneName }: { zoneName: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className="text-trail-orange h-24 w-24"
      role="img"
      aria-label={`${zoneName} 도장`}
    >
      <circle
        cx="48"
        cy="48"
        r="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      <circle
        cx="48"
        cy="48"
        r="36"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      <text
        x="48"
        y="54"
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="currentColor"
        style={{ fontFamily: "var(--font-inter, sans-serif)" }}
      >
        {zoneName}
      </text>
    </svg>
  );
}
