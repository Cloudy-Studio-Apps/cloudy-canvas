import type { StrategyPictureProps } from "./er-to-tables.types";

/** A hierarchy's tables: a parent and its children's tables linked, or one table for all. */
export function StrategyPicture({ strategy }: StrategyPictureProps) {
  return (
    <svg
      viewBox="0 0 96 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      aria-hidden
      className="h-10 w-full"
    >
      {strategy === "per-entity" ? (
        <>
          <rect x={36} y={2} width={24} height={12} />
          <path d="M36 6 H60" />
          <rect x={10} y={26} width={24} height={12} />
          <path d="M10 30 H34" />
          <rect x={62} y={26} width={24} height={12} />
          <path d="M62 30 H86" />
          <path d="M22 26 L44 14 M74 26 L52 14" strokeDasharray="2 2" />
        </>
      ) : (
        <>
          <rect x={28} y={4} width={40} height={32} />
          <path d="M28 10 H68 M32 16 H60 M32 22 H64 M32 28 H56" />
        </>
      )}
    </svg>
  );
}
