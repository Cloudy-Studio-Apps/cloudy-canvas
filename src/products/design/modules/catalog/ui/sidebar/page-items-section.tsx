import { useMemo, useState } from "react";

import { DragGhost, useEditorModules } from "@canvas-ui";
import type { Point } from "@canvas";
import { insertPageItems } from "../../model/page-items/insert-page-items";
import { itemTargetAt, itemTargets } from "../../model/page-items/item-targets";
import { isPageFrame } from "../../model/page-frame";
import { mmToUnits } from "../../model/paper-size";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { CheckboxField, ListRow } from "@shared/ui/kit";
import { catalogPageItems } from "../catalog.points";
import { useBrochure } from "../hooks/use-brochure";
import { useDropOnCanvas } from "../hooks/use-drop-on-canvas";
import { itemPreview } from "../page-items/item-preview";
import type { PageItemsSectionProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/**
 * The page items (page number, title, …, `catalogPageItems`) for the selected page or master
 * side: a click adds one to it (to both sides of a master, unless "Add to both sides" is off;
 * a left side mirrors the right, so "outer" stays away from the spine), and dragging one onto
 * any page or master on the canvas drops it there.
 */
export function PageItemsSection({ frame }: PageItemsSectionProps) {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const view = useBrochure();
  const { pages, layout, numbers, masters, settings } = view;
  const [both, setBoth] = useState(true);
  const items = useMemo(() => [...host.get(catalogPageItems)], [host]);
  const input = { pages, layout, numbers, masters };
  const master = masters.find((item) => item.left === frame.id || item.right === frame.id);
  const other = master && (master.left === frame.id ? master.right : master.left);
  const otherFrame = other ? engine.doc.get(other) : undefined;
  const targets = [
    ...itemTargets(frame, input),
    ...(both && isPageFrame(otherFrame) ? itemTargets(otherFrame, input) : []),
  ];
  const margin = mmToUnits(settings.margin);

  const targetAt = (world: Point) => {
    const ids = [
      ...pages.flatMap((page) => page.options.map((option) => option.id)),
      ...masters.flatMap((item) => [item.left, item.right]),
    ];
    for (const id of ids) {
      const el = id === null ? undefined : engine.getElement(id);
      if (!isPageFrame(el)) continue;
      const target = itemTargetAt(el, input, world);
      if (target) return target;
    }
    return null;
  };
  const drop = useDropOnCanvas({
    targetAt,
    onDrop: (id, target, at) => {
      const item = items.find((entry) => entry.id === id);
      if (item) insertPageItems(engine.doc, item, [target], margin, at);
    },
  });
  const dragged = items.find((item) => item.id === drop.drag?.id);

  return (
    <PanelSection title={t("items.panel.title")}>
      {dragged && drop.drag && (
        <DragGhost
          label={drop.drag.over ? dragged.label : t("items.panel.dropHere")}
          pointer={drop.drag.pointer}
          muted={!drop.drag.over}
        />
      )}
      <p className="mb-1.5 text-xs text-muted-foreground">
        {master ? t("items.panel.hintMaster") : t("items.panel.hintPage")}
      </p>
      {master && isPageFrame(otherFrame) && (
        <CheckboxField
          label={t("items.panel.bothSides")}
          checked={both}
          onChange={setBoth}
          className="mb-1.5"
        />
      )}
      <ul className="-mx-1.5 flex flex-col">
        {items.map((item) => {
          const Icon = item.icon;
          const preview = itemPreview(item.template, targets[0], view);
          return (
            <li key={item.id}>
              <ListRow
                {...drop.grabProps(item.id)}
                size="md"
                icon={<Icon />}
                label={item.label}
                meta={preview ?? undefined}
                title={item.template}
                onSelect={() => insertPageItems(engine.doc, item, targets, margin)}
              />
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
