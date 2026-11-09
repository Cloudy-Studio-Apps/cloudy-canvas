import type { StylesBodyProps } from "./kind-body.types";
import { t } from "../project.i18n";

/** A library's effect styles by name; none yet shows the placeholder. */
export function EffectsBody({ styles }: StylesBodyProps) {
  if (styles.length === 0)
    return <p className="text-sm text-muted-foreground">{t("libraries.empty.effects")}</p>;
  return (
    <div className="divide-y rounded-card border bg-surface">
      {styles.map((style) => (
        <div key={style.id} className="px-3 py-2 text-sm">
          {style.name}
        </div>
      ))}
    </div>
  );
}
