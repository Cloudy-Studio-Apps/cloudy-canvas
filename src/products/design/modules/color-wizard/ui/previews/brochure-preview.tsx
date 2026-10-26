import type { ReactNode } from "react";

import { onColor } from "../..";
import type { PreviewProps } from "./preview.types";

/** A tri-fold brochure's outside: the inside flap, the back and the cover. */
export function BrochurePreview({ p }: PreviewProps) {
  const { t, deco, text, body } = p;
  const [a, b, c] = [deco[0]!, deco[1 % deco.length]!, deco[2 % deco.length]!];
  const panel = (inner: ReactNode, bg = t("surface"), fg = t("foreground")) => (
    <div
      className="relative flex min-w-45 flex-1 flex-col gap-2.5 overflow-hidden px-4.5 py-5"
      style={{ background: bg, color: fg }}
    >
      {inner}
    </div>
  );
  const item = (color: string, label: string) => (
    <div key={label} className="flex items-start gap-2 text-xs">
      <span className="mt-1 size-2 shrink-0" style={{ background: color }} />
      {label}
    </div>
  );
  return (
    <div
      className="flex w-full max-w-[860px] flex-col items-center gap-1.5"
      style={{ fontFamily: body }}
    >
      <div className="flex aspect-[11/8.5] w-full flex-wrap overflow-hidden rounded-xs shadow-popover">
        {panel(
          <>
            <div style={{ ...text("xl", 20), color: t("primary") }}>What we do</div>
            <div className="text-xs" style={{ color: t("muted-foreground") }}>
              We help small teams plan, build and grow with tools that stay out of the way.
            </div>
            {item(a, "Planning workshops")}
            {item(b, "Product design")}
            {item(c, "Launch support")}
            <div
              className="mt-auto pl-2.5 text-xs italic"
              style={{ borderLeft: `3px solid ${t("accent")}` }}
            >
              “They turned our idea into a launch in six weeks.”
            </div>
          </>,
        )}
        {panel(
          <>
            <div
              className="-mx-4.5 -mt-5 h-[38%]"
              style={{ background: `linear-gradient(135deg, ${deco.join(", ")})` }}
            />
            <div style={text("lg", 17)}>Visit us</div>
            <div className="text-xs" style={{ color: t("muted-foreground") }}>
              12 Harbour Street
              <br />
              Valencia, Spain
              <br />
              hello@northwind.co
            </div>
            <span
              className="mt-auto self-start rounded-md px-3 py-1.5 text-xs font-semibold"
              style={{ background: t("accent"), color: onColor(t("accent")) }}
            >
              Book a call
            </span>
          </>,
          t("background"),
        )}
        {panel(
          <>
            <span
              className="absolute -right-17.5 -bottom-20 size-55 rounded-full opacity-55"
              style={{ background: b }}
            />
            <b
              className="flex items-center gap-2 text-[13px]"
              style={{ color: t("primary-foreground") }}
            >
              <span className="size-4 rounded-xs" style={{ background: t("primary-foreground") }} />
              NORTHWIND
            </b>
            <div
              className="relative mt-auto"
              style={{ ...text("4xl", 34), color: t("primary-foreground") }}
            >
              Ideas,
              <br />
              shipped.
            </div>
            <div className="relative text-xs opacity-85" style={{ color: t("primary-foreground") }}>
              Studio guide 2026
            </div>
          </>,
          t("primary"),
          t("primary-foreground"),
        )}
      </div>
      <div className="flex w-full text-[11px] text-muted-foreground">
        <span className="flex-1 text-center">Inside flap</span>
        <span className="flex-1 text-center">Back</span>
        <span className="flex-1 text-center">Cover</span>
      </div>
    </div>
  );
}
