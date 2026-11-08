import type { LinkStubProps } from "./link-path.types";
import { t } from "../../prototype.i18n";

/** The length of a stub's line (screen px). */
const STUB = 18;

/** An interaction with no screen to point at (Back, Close, Open link): a short line and a chip. */
export function LinkStub({ rect, action, active }: LinkStubProps) {
  const sx = rect.x + rect.w;
  const sy = rect.y + rect.h / 2;
  const label = t(`stub.${action === "close" ? "close" : action === "link" ? "link" : "back"}`);
  const width = label.length * 6 + 10;
  return (
    <g>
      <path
        d={`M ${sx} ${sy} h ${STUB}`}
        fill="none"
        className={active ? "stroke-primary" : "stroke-primary opacity-85"}
        strokeWidth={active ? 2.5 : 1.75}
      />
      <rect x={sx + STUB} y={sy - 8} width={width} height={16} rx={3} className="fill-primary" />
      <text
        x={sx + STUB + 5}
        y={sy + 3.5}
        className="fill-primary-foreground text-[10px] font-semibold"
      >
        {label}
      </text>
      <rect
        x={sx - 3}
        y={sy - 3}
        width={6}
        height={6}
        className="fill-surface stroke-primary"
        strokeWidth={1.75}
      />
    </g>
  );
}
