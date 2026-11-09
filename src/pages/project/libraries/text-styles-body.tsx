import type { StyleRecord } from "@canvas";
import type { StylesBodyProps } from "./kind-body.types";
import { t } from "../project.i18n";

/** The family, size and weight a text style's value names, for its sample and its caption. */
function sampleOf(style: StyleRecord) {
  const { fontFamily, fontSize, fontWeight } = style.value;
  return {
    family: typeof fontFamily === "string" ? fontFamily : null,
    size: typeof fontSize === "number" ? fontSize : null,
    weight: typeof fontWeight === "number" || typeof fontWeight === "string" ? fontWeight : null,
  };
}

/** A library's text styles: the name set in its own family, with the family and size beside it. */
export function TextStylesBody({ styles }: StylesBodyProps) {
  if (styles.length === 0)
    return <p className="text-sm text-muted-foreground">{t("libraries.empty.text")}</p>;
  return (
    <div className="divide-y rounded-card border bg-surface">
      {styles.map((style) => {
        const sample = sampleOf(style);
        return (
          <div key={style.id} className="flex items-baseline gap-4 px-3 py-2">
            <span
              className="min-w-0 flex-1 truncate"
              style={{
                fontFamily: sample.family ?? undefined,
                fontWeight: sample.weight ?? undefined,
                fontSize: Math.min(Math.max(sample.size ?? 16, 13), 28),
              }}
            >
              {t("libraries.sample")}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {[style.name, [sample.family, sample.size].filter(Boolean).join(" ")]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
