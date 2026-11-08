import { useEffect, useMemo, useReducer, type ReactElement } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { isScreen } from "../../model";
import { usePrototypePage } from "../hooks/use-prototype-page";
import { usePrototypeSelection } from "../hooks/use-prototype-selection";
import { usePrototypeViewStore } from "../stores/prototype-view-store";
import { collectLinks } from "./collect-links";
import { FlowFlag } from "./flow-flag";
import { LinkArrow } from "./link-arrow";
import { linkPath } from "./link-path";
import { LinkStub } from "./link-stub";

/** Screens drawn smaller than this on screen (px) get no flag. */
const MIN_SCREEN_SIZE = 48;

/**
 * What the Prototype mode draws over the canvas, following the view: an arrow from each layer to
 * the screen it opens (dashed for an overlay), a labelled stub for Back, Close and Open link, and a
 * flag over each flow's starting screen. The selection's arrows are thicker; "Show links:
 * Selection" draws only those.
 */
export function LinksLayer() {
  const engine = useDesignEngine();
  const { flows, screens, version } = usePrototypePage();
  const selection = usePrototypeSelection();
  const showLinks = usePrototypeViewStore((state) => state.showLinks);
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  useEffect(() => engine.onViewChange(redraw), [engine]);

  // The nodes with links are read when the document changes, not on every pan or zoom.
  const links = useMemo(
    () => collectLinks(engine, new Set(screens.map((screen) => screen.id))),
    // `version` is what says the document changed (`screens` changes with it).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, version],
  );
  const drawn: ReactElement[] = [];
  for (const link of links) {
    const el = engine.getElement(link.id);
    const own = engine.getElement(link.screenId);
    if (!el || !own) continue;
    const active =
      (selection.kind === "layer" && selection.id === link.id) ||
      (selection.kind === "screen" && selection.id === link.screenId);
    if (showLinks === "selection" && !active) continue;
    const from = engine.worldRectToScreen(el);
    const fromScreen = engine.worldRectToScreen(own);
    for (const ix of link.interactions) {
      const target = ix.to ? engine.getElement(ix.to) : undefined;
      const key = `${link.id}:${ix.id}`;
      if (ix.action === "back" || ix.action === "close" || ix.action === "link") {
        drawn.push(<LinkStub key={key} rect={from} action={ix.action} active={active} />);
      } else if (target && isScreen(target)) {
        const path = linkPath(from, fromScreen, engine.worldRectToScreen(target));
        drawn.push(
          <LinkArrow key={key} path={path} dashed={ix.action === "overlay"} active={active} />,
        );
      }
    }
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 size-full overflow-visible">{drawn}</svg>
      {flows.map((flow) => {
        const start = engine.getElement(flow.start);
        if (!start) return null;
        const rect = engine.worldRectToScreen(start);
        if (Math.max(rect.w, rect.h) < MIN_SCREEN_SIZE) return null;
        return <FlowFlag key={flow.id} rect={rect} flow={flow} />;
      })}
    </div>
  );
}
