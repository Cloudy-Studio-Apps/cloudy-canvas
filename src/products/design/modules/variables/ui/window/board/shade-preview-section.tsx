import { leafName } from "../group-paths";
import { draftShades } from "../shade-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { ShadePreviewSectionProps } from "./board.types";
import { CardGrid } from "./card-grid";
import { ColorCard } from "./color-card";
import { GhostShadeCard } from "./ghost-shade-card";
import { t } from "../../../variables.i18n";

/** The group the generator writes, previewed: its shades as ghost cards, then the rest. */
export function ShadePreviewSection({ group, rest }: ShadePreviewSectionProps) {
  const { store, collection, modes, shown } = useBoard();
  const draft = useVariablesWindowStore((state) => state.draft);
  if (!draft || !collection) return null;
  const { shades, colors } = draftShades(store, draft, shown, modes);
  const existing = new Set(
    store
      .variables(collection.id)
      .filter((v) => v.name.startsWith(group ? `${group}/` : ""))
      .map((v) => leafName(v)),
  );
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-sm font-semibold">{group || t("common.ungrouped")}</span>
        <span className="text-xs text-primary">{t("board.preview")}</span>
      </div>
      <CardGrid>
        {shades.map((shade, i) => (
          <GhostShadeCard
            key={shade.name}
            shade={shade}
            colors={colors[i] ?? []}
            state={shade.anchor ? "base" : existing.has(shade.name) ? "update" : "new"}
          />
        ))}
        {rest
          .filter((v) => !shades.some((shade) => shade.name === leafName(v)))
          .map((v) => (
            <ColorCard key={v.id} variable={v} shown={shown} selected={false} />
          ))}
      </CardGrid>
    </section>
  );
}
