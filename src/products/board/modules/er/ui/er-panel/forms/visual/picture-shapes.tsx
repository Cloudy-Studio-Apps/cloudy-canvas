import { useErGoTo } from "../use-er-go-to";
import type {
  PictureBoxProps,
  PictureDiamondProps,
  PictureHotProps,
  PictureLabelProps,
} from "./picture-shapes.types";
import { t } from "../../../../er.i18n";

const CHAR_W = 7;

/** Cut to what fits in `w` units of a picture. */
function fit(label: string, w: number): string {
  const room = Math.floor(w / CHAR_W);
  return label.length > room ? `${label.slice(0, Math.max(room - 1, 1))}…` : label;
}

/** Selects the shape when clicked, or with Enter or Space. */
function Hot({ id, label, children }: PictureHotProps) {
  const { goTo } = useErGoTo();
  if (!id) return <g>{children}</g>;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={t("form.select", { name: label })}
      className="cursor-pointer outline-none hover:opacity-75 focus-visible:opacity-75"
      onClick={() => goTo(id)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        goTo(id);
      }}
    >
      {children}
    </g>
  );
}

function Label({ x, y, text }: PictureLabelProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      stroke="none"
      fill="currentColor"
      className="text-[12px] font-semibold text-foreground"
    >
      {text}
    </text>
  );
}

/** An entity in a picture of the form. */
export function PictureBox({ x, y, w, h, label, color, id }: PictureBoxProps) {
  return (
    <Hot id={id} label={label}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        strokeWidth={2}
        className="fill-surface-sunken"
        style={{ stroke: color ?? "currentColor" }}
      />
      <Label x={x + w / 2} y={y + h / 2 + 4} text={fit(label, w)} />
    </Hot>
  );
}

/** A relation in a picture of the form. */
export function PictureDiamond({ cx, cy, w, h, label, id }: PictureDiamondProps) {
  const [rx, ry] = [w / 2, h / 2];
  return (
    <Hot id={id} label={label}>
      <path
        d={`M${cx} ${cy - ry} ${cx + rx} ${cy} ${cx} ${cy + ry} ${cx - rx} ${cy}Z`}
        strokeWidth={2}
        className="fill-surface-sunken stroke-primary"
      />
      <Label x={cx} y={cy + 4} text={fit(label, w * 0.7)} />
    </Hot>
  );
}
