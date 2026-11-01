import { cn } from "@shared/ui/kit";
import type { AttributeOvalProps } from "./attribute-oval.types";

const UNDERLINE = { pk: undefined, partial: "3 2", alternate: "1 2" } as const;
const SAMPLE = "abc";

/** An attribute's oval, drawn as it is on the board. */
export function AttributeOval({ attribute, label, className }: AttributeOvalProps) {
  const { key, multivalued, derived, optional } = attribute;
  return (
    <svg
      viewBox="0 0 54 30"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      className={cn("h-[25px] w-[44px]", className)}
    >
      <ellipse cx={25} cy={15} rx={23} ry={13} strokeDasharray={derived ? "4 3" : undefined} />
      {multivalued && <ellipse cx={25} cy={15} rx={19} ry={9.5} />}
      <text
        x={25}
        y={18.5}
        fill="currentColor"
        stroke="none"
        textAnchor="middle"
        className="text-[9.5px] font-semibold"
      >
        {label ?? SAMPLE}
      </text>
      {key !== "none" && <path d="M14 22h22" strokeDasharray={UNDERLINE[key]} />}
      {optional && (
        <>
          <circle cx={49} cy={7} r={4.2} />
          <path d="M49 2.8a4.2 4.2 0 0 1 0 8.4z" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
