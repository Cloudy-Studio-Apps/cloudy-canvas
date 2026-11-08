import { Layers } from "lucide-react";

import { setBindings, withoutBindingsUnder, type ElementPatch } from "@canvas";
import type { DesignNode } from "../../node/design-node.types";
import { solidPaint } from "../../node/solid-paint";
import { stackBindingsPatch } from "../../node/stack-bindings";
import { setRegionFills } from "../../network/network-region-fills";
import { regionFillsPath } from "../../network/region-fill-paths";
import { regionPaints } from "../../network/region-paints";
import { withRegionIds } from "../../network/region-ids";
import type { VectorNetwork } from "../../network/network.types";
import { PAINT_STYLE } from "../../styles/style-paths";
import { movedBindings } from "@canvas";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import { StyleChip, StyleControl, createNodeStyle, useNodeStyleBinding } from "../styles";
import { PaintStackSection } from "./paint-stack-section";
import type { RegionFillSectionProps } from "./region-fill-section.types";
import type { StyleBinding } from "../styles/styles.types";
import { t } from "../../core.i18n";

/** New fills are a light gray, like new rectangles. */
const NEW_FILL = "#D9D9D9";

/**
 * The Fill section while areas of a vector are picked in its edit mode: it edits those areas'
 * own fills, as in Figma, and "Use layer fill" gives them the layer's fills back. One picked area
 * also takes a color style and variables on its colors, as a layer's fills do.
 */
export function RegionFillSection({ node, regions }: RegionFillSectionProps) {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  const { network } = node;
  const picked = regions.flatMap((i) => (network.regions[i] ? [network.regions[i]] : []));
  const ownFills = picked.some((region) => region.fills !== undefined);
  const [only] = regions;
  const path = regions.length === 1 && only !== undefined ? regionFillsPath(only) : null;
  const fieldStyle = useNodeStyleBinding([node], path ?? "");
  /**
   * A style picked for an area that shows the layer's fills first gives it fills of its own (only
   * those take styles), in the same undo step.
   */
  const style: StyleBinding = {
    bound: fieldStyle.bound,
    bind: (styleId) => {
      if (path === null || only === undefined) return;
      engine.doc.checkpoint();
      engine.doc.batch(() => {
        const current = engine.getElement(node.id) as RegionFillSectionProps["node"] | undefined;
        const area = current?.network.regions[only];
        if (styleId !== null && current && area && !area.fills) {
          const own = setRegionFills(current.network, [only], [...current.fills]);
          engine.doc.update(node.id, {
            network: withRegionIds(own),
          } as ElementPatch<DesignNode>);
        }
        setBindings(engine.doc, [node.id], path, styleId);
      });
    },
  };
  const styled = path !== null && style.bound !== undefined;

  const write = (
    next: (net: VectorNetwork) => VectorNetwork,
    checkpoint: boolean,
    bindings?: (current: DesignNode) => ElementPatch<DesignNode>,
  ) =>
    edit(
      [node],
      (current) => {
        const net = (current as RegionFillSectionProps["node"]).network;
        return {
          network: withRegionIds(next(net)),
          ...bindings?.(current),
        } as ElementPatch<DesignNode>;
      },
      { checkpoint },
    );

  /** Each picked area's own fills, or the layer's back, with what was bound on them dropped. */
  const useLayerFill = () =>
    write(
      (net) => setRegionFills(net, regions, undefined),
      true,
      (current) => ({
        bindings: regions.reduce(
          (bindings, i) => withoutBindingsUnder(bindings, regionFillsPath(i)),
          current.bindings ?? {},
        ),
      }),
    );

  return (
    <PaintStackSection
      title={t("sections.fills")}
      stacks={picked.map((region) => regionPaints(region, node))}
      newPaint={() => solidPaint(NEW_FILL)}
      allowImage
      size={{ w: node.w, h: node.h }}
      bindPrefix={path ?? undefined}
      handlesField={path === null ? undefined : "fills"}
      handlesRegion={path === null ? undefined : only}
      hideAdd={styled}
      replacement={styled ? <StyleChip binding={style} /> : undefined}
      note={
        regions.length === 1
          ? t("sections.selectedArea")
          : t("sections.selectedAreas", { count: regions.length })
      }
      onChange={(paints, checkpoint, map) =>
        write(
          (net) =>
            regions.reduce((acc, i) => {
              const region = acc.regions[i];
              return region ? setRegionFills(acc, [i], paints(regionPaints(region, node))) : acc;
            }, net),
          checkpoint,
          path === null || map === undefined
            ? undefined
            : (current) => stackBindingsPatch(current, path, map),
        )
      }
      actions={
        <>
          {path !== null && (
            <StyleControl
              binding={style}
              styleType={PAINT_STYLE}
              createLabel={t("paints.createStyle", { name: t("sections.fills").toLowerCase() })}
              create={() =>
                createNodeStyle(
                  engine,
                  PAINT_STYLE,
                  () => ({ paints: structuredClone([...(picked[0]?.fills ?? node.fills)]) }),
                  (current) => movedBindings(current.bindings, path, "paints"),
                )
              }
            />
          )}
          {ownFills && (
            <PanelIconButton label={t("paints.useLayerFill")} onClick={useLayerFill}>
              <Layers className="size-3.5" />
            </PanelIconButton>
          )}
        </>
      }
    />
  );
}
