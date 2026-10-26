import { onColor } from "../..";
import type { PreviewProps } from "./preview.types";

/** Social media: a square post in its feed chrome, a story and a cover banner. */
export function SocialPreview({ p }: PreviewProps) {
  const { t, deco, text, body } = p;
  const [a, b, c] = [deco[0]!, deco[1 % deco.length]!, deco[2 % deco.length]!];
  return (
    <div className="flex w-full flex-col items-center gap-4" style={{ fontFamily: body }}>
      <div className="flex flex-wrap items-start justify-center gap-4">
        <div
          className="w-70 shrink-0 overflow-hidden rounded-lg"
          style={{
            background: t("surface"),
            color: t("foreground"),
            border: `1px solid ${t("border")}`,
          }}
        >
          <div className="flex items-center gap-2 px-2.5 py-2">
            <span
              className="size-6.5 rounded-full"
              style={{ background: `linear-gradient(135deg, ${a}, ${c})` }}
            />
            <b className="text-xs">northwind</b>
            <span className="flex-1" />
            <span style={{ color: t("muted-foreground") }}>···</span>
          </div>
          <div
            className="relative flex aspect-square flex-col justify-end overflow-hidden p-5.5"
            style={{ background: a, color: onColor(a) }}
          >
            <span
              className="absolute -top-10 -right-10 size-40 rounded-full"
              style={{ background: b }}
            />
            <span
              className="absolute top-10 left-6 size-17.5 rotate-12"
              style={{ background: c }}
            />
            <div className="relative" style={{ ...text("4xl", 34), color: onColor(a) }}>
              Summer
              <br />
              launch
            </div>
            <div className="relative mt-1.5 text-xs opacity-85">Up to 30% off · This week only</div>
          </div>
          <div className="px-2.5 py-2 text-xs">
            <b>1,284 likes</b>
            <div style={{ color: t("muted-foreground") }}>northwind Our new palette is here ✨</div>
          </div>
        </div>
        <div
          className="flex aspect-[9/16] w-50 shrink-0 flex-col justify-between overflow-hidden rounded-lg p-3.5"
          style={{ background: `linear-gradient(180deg, ${deco.join(", ")})` }}
        >
          <div className="flex gap-0.5">
            {[1, 1, 0.4].map((o, i) => (
              <span
                key={i}
                className="h-0.5 flex-1"
                style={{ background: t("surface"), opacity: o }}
              />
            ))}
          </div>
          <div
            className="rounded-lg p-3"
            style={{ background: t("surface"), color: t("foreground") }}
          >
            <div style={text("xl", 20)}>New drop</div>
            <div className="mt-1 mb-2.5 text-[11px]" style={{ color: t("muted-foreground") }}>
              Tap to see the collection
            </div>
            <span
              className="block rounded-md py-1.5 text-center text-xs font-semibold"
              style={{ background: t("primary"), color: t("primary-foreground") }}
            >
              Shop now
            </span>
          </div>
        </div>
      </div>
      <div
        className="relative flex aspect-[3/1] w-full max-w-[560px] items-center gap-4 overflow-hidden rounded-lg px-5.5 py-4.5"
        style={{ background: t("primary"), color: t("primary-foreground") }}
      >
        <div className="relative flex-1">
          <div style={{ ...text("2xl", 26), color: t("primary-foreground") }}>
            Join 20,000 teams
          </div>
          <div className="text-xs opacity-85">Cover · LinkedIn / X header, 1500×500</div>
        </div>
        <span className="size-22 rounded-full" style={{ background: b }} />
        <span className="size-12" style={{ background: c }} />
      </div>
    </div>
  );
}
