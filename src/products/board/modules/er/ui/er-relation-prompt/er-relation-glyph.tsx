import type { ErGlyphEndProps, ErRelationGlyphProps } from "./er-relation-prompt.types";

/**
 * Two boxes and a line with crow's-foot ends: a bar where one, a fork where many. Each end says
 * how many of the box beside it one of the other has.
 */
export function ErRelationGlyph({ from, to }: ErRelationGlyphProps) {
  return (
    <svg
      viewBox="0 0 72 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden
      className="h-7 w-[72px]"
    >
      <rect x="1" y="8" width="14" height="12" rx="1" />
      <rect x="57" y="8" width="14" height="12" rx="1" />
      <path d="M15 14 H57" />
      <End side={from} at={15} dir={1} />
      <End side={to} at={57} dir={-1} />
    </svg>
  );
}

function End({ side, at, dir }: ErGlyphEndProps) {
  if (side === "one") return <path d={`M${at + 5 * dir} 9 V19`} />;
  const tip = at + 8 * dir;
  return <path d={`M${tip} 14 L${at} 8.5 M${tip} 14 L${at} 19.5`} />;
}
