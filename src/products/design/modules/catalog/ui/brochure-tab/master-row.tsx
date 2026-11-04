import { useState } from "react";
import { X } from "lucide-react";

import { LayerName } from "../../../layers/ui";
import { isPageFrame } from "../../model/page-frame";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { editInDesign, showPage } from "../page-actions";
import { MasterSideThumb } from "./master-side-thumb";
import type { MasterRowProps } from "./masters-section.types";
import { t } from "../../catalog.i18n";

/**
 * One master: its left and right sides, its name (double-click to rename) and whether it's the
 * default. A click shows its frames on the canvas, a double-click designs it in the Design mode,
 * and × takes it out of the brochure (its frames stay, as ordinary frames).
 */
export function MasterRow({ master, isDefault, selected }: MasterRowProps) {
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  const [renaming, setRenaming] = useState(false);
  const frame = (id: string | null) => {
    const el = id === null ? undefined : engine.doc.get(id);
    return isPageFrame(el) ? el : undefined;
  };
  const first = frame(master.left) ?? frame(master.right);

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        title={t("masters.rowHint")}
        aria-selected={selected}
        onClick={() => first && showPage(engine, first)}
        onDoubleClick={() => first && editInDesign(engine, first)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && first) showPage(engine, first);
        }}
        className={cn(
          "group flex cursor-default items-center gap-2 rounded-sm px-1 py-1 hover:bg-hover",
          selected && "bg-primary-soft hover:bg-primary-soft",
        )}
      >
        <span className="flex gap-px">
          <MasterSideThumb frame={master.left} label={t("masters.left")} />
          <MasterSideThumb frame={master.right} label={t("masters.right")} />
        </span>
        <span
          className="min-w-0 flex-1 text-sm text-foreground"
          onDoubleClick={(event) => {
            event.stopPropagation();
            setRenaming(true);
          }}
        >
          {renaming ? (
            <LayerName
              name={master.name}
              editing
              onRename={(name) => brochure?.masters.rename(master.id, name)}
              onDone={() => setRenaming(false)}
            />
          ) : (
            <span className="block truncate">{master.name}</span>
          )}
          {isDefault && (
            <span className="block text-xs text-muted-foreground">{t("masters.default")}</span>
          )}
        </span>
        <span
          className="opacity-0 group-hover:opacity-100"
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <PanelIconButton
            label={t("masters.remove")}
            onClick={() => brochure?.masters.remove(master.id)}
          >
            <X />
          </PanelIconButton>
        </span>
      </div>
    </li>
  );
}
