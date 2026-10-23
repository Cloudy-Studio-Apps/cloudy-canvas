import type { ReactNode } from "react";

import type { ErSettingPreviewProps } from "./diagram-settings.types";

const TEXT = { fontSize: 7, fill: "currentColor", stroke: "none", textAnchor: "middle" } as const;

/** A small drawing of what a setting's value looks like on the board. */
export function ErSettingPreview({ setting, value }: ErSettingPreviewProps) {
  return (
    <svg
      viewBox="0 0 96 44"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      aria-hidden
      className="h-11 w-full"
    >
      {PREVIEWS[`${setting}:${value}`]}
    </svg>
  );
}

/** An entity box centered at (x, 22). */
function box(x: number, label = "") {
  return (
    <>
      <rect x={x - 11} y={15} width={22} height={14} />
      {label && (
        <text x={x} y={25} {...TEXT}>
          {label}
        </text>
      )}
    </>
  );
}

/** A relation diamond centered at (x, 22). */
function diamond(x: number) {
  return <path d={`M${x} 13 L${x + 11} 22 L${x} 31 L${x - 11} 22 Z`} />;
}

/** Two entities and a relation between them, with the diamond's ratio label. */
function ratio(label: string): ReactNode {
  return (
    <>
      {box(13, "C")}
      <path d="M24 22 H37 M59 22 H72" />
      {diamond(48)}
      {box(83, "P")}
      <text x={48} y={9} {...TEXT} fontWeight={600}>
        {label}
      </text>
      <text x={30} y={36} {...TEXT}>
        (0,n)
      </text>
      <text x={66} y={36} {...TEXT}>
        (1,1)
      </text>
    </>
  );
}

/** An entity's mandatory side of a relation, as numbers, a double line or both. */
function participation(numbers: boolean, double: boolean): ReactNode {
  return (
    <>
      {box(20)}
      {double ? <path d="M31 20.5 H63 M31 23.5 H63" /> : <path d="M31 22 H63" />}
      {diamond(74)}
      {numbers && (
        <text x={47} y={15} {...TEXT}>
          (1,1)
        </text>
      )}
    </>
  );
}

/** A parent with two children through a triangle and an arc, or a d circle. */
function hierarchy(circle: boolean): ReactNode {
  return (
    <>
      <rect x={38} y={1} width={20} height={9} />
      <path d="M48 10 V16" />
      {circle ? (
        <>
          <circle cx={48} cy={22} r={6} />
          <text x={48} y={24.5} {...TEXT} fontWeight={600}>
            d
          </text>
          <path d="M44 26.5 L24 34 M52 26.5 L72 34" />
        </>
      ) : (
        <>
          <path d="M40 16 H56 L48 27 Z" />
          <path d="M38 28 Q48 34 58 28" />
          <path d="M45 26 L24 34 M51 26 L72 34" />
        </>
      )}
      <rect x={14} y={34} width={20} height={9} />
      <rect x={62} y={34} width={20} height={9} />
    </>
  );
}

/** A relation's line meeting an entity, with or without the crow's foot. */
function crowFeet(on: boolean): ReactNode {
  return (
    <>
      {diamond(18)}
      <path d="M29 22 H73" />
      {box(84)}
      {on && (
        <>
          <path d="M64 22 L73 17 M64 22 L73 27" />
          <circle cx={58} cy={22} r={2.5} fill="var(--color-surface)" />
        </>
      )}
      <text x={52} y={15} {...TEXT}>
        (0,n)
      </text>
    </>
  );
}

const PREVIEWS: Record<string, ReactNode> = {
  "style:ellipse": (
    <>
      {box(24)}
      <path d="M35 22 H54" />
      <ellipse cx={70} cy={22} rx={16} ry={8} />
      <text x={70} y={24.5} {...TEXT}>
        name
      </text>
    </>
  ),
  "style:lollipop": (
    <>
      {box(24)}
      <path d="M35 22 H62" />
      <circle cx={66} cy={22} r={4} />
      <text x={80} y={24.5} {...TEXT}>
        name
      </text>
    </>
  ),
  "ratio:across": ratio("1:N"),
  "ratio:own": ratio("N:1"),
  "participation:numbers": participation(true, false),
  "participation:lines": participation(false, true),
  "participation:both": participation(true, true),
  "isa:arc": hierarchy(false),
  "isa:circle": hierarchy(true),
  "crowFeet:on": crowFeet(true),
  "crowFeet:off": crowFeet(false),
};
