import { ER_RELATION_RATIOS } from "../../connect/er-relation-ratios";
import { ErRelationGlyph } from "./er-relation-glyph";
import type { ErRatioPickerProps } from "./er-relation-prompt.types";
import { t } from "../../er.i18n";

/** Step one: what kind of relation links the two, each with its picture and a sentence. */
export function ErRatioPicker({ from, to, onPick }: ErRatioPickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-1 pb-1 text-xs text-muted-foreground">
        {t("prompt.howBefore")}
        <span className="font-medium text-foreground">{from}</span>
        {t("prompt.and")}
        <span className="font-medium text-foreground">{to}</span>
        {t("prompt.related")}
      </p>
      {ER_RELATION_RATIOS.map((ratio, i) => (
        // eslint-disable-next-line no-restricted-syntax -- bespoke: a ratio with its glyph and sentence
        <button
          key={ratio.id}
          type="button"
          autoFocus={i === 1}
          className="flex items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none hover:bg-hover focus-visible:bg-hover"
          onClick={() => onPick(ratio.id)}
        >
          <ErRelationGlyph from={ratio.from} to={ratio.to} />
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">{ratio.label}</span>
            <span className="text-xs text-muted-foreground">{ratio.describe(from, to)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
