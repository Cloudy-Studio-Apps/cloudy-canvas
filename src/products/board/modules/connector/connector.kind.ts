import {
  LineKind,
  scaleLength,
  scalePoint,
  type ElementBuildContext,
  type ElementDescription,
  type ElementHandle,
  type ElementInteraction,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type InteractionQuery,
  type Point,
  type ScaleTransform,
  type BindableField,
} from "@canvas";

import { colorField, colorTokenOptions, restyleColors } from "../../tokens";
import type { BoardToolOptions } from "../../board-options.types";
import { INK_COLOR } from "../../palette";
import { CONNECTOR_DEFAULTS } from "./connector.defaults";
import { connectorEndpoints } from "./connector-endpoints";
import { ConnectorDrag } from "./connector-drag";
import { createConnector } from "./connector.factory";
import { drawConnector } from "./connector.draw";
import {
  arrowHeadFrom,
  CONNECTOR_SPEC_PROPERTIES,
  connectorEnd,
  connectorEndFrom,
  connectorSizeFrom,
  connectorStyleFrom,
} from "./connector-spec";
import type {
  ConnectorDefaults,
  ConnectorElement,
  ConnectorEnd,
  ConnectorEndsPatch,
} from "./connector.types";
import { t } from "./connector.i18n";

/**
 * Lines between two ends that follow the elements they're attached to. The board resolves their
 * route on every change (`resolveConnectors`); selected, they show their ends, which can be
 * dragged onto another element.
 */
export class ConnectorKind extends LineKind<ConnectorElement, BoardToolOptions> {
  readonly type = "connector";
  readonly label = t("label");
  readonly description = t("description");
  override readonly tool = "connector";
  override readonly defaults: ConnectorDefaults = CONNECTOR_DEFAULTS;
  override readonly styleFields = ["color", "size", "style", "startHead", "endHead"];
  override readonly boxed = false;
  override readonly specProperties = CONNECTOR_SPEC_PROPERTIES;
  override readonly patchableFields: ReadonlySet<string> = new Set([
    "style",
    "color",
    "size",
    "startHead",
    "endHead",
    "from",
    "to",
  ]);
  protected override readonly reach = CONNECTOR_DEFAULTS.reach;

  draw(view: ElementView, el: ConnectorElement): void {
    drawConnector(view, el);
  }

  protected lineWidth(el: ConnectorElement): number {
    return el.size;
  }

  /** Only free ends move; attached ones follow their elements. */
  override move(origin: ConnectorElement, dx: number, dy: number): ElementPatch<ConnectorElement> {
    return { start: moveEnd(origin.start, dx, dy), end: moveEnd(origin.end, dx, dy) };
  }

  /**
   * Scaled (the Scale tool), its free ends scale and its line grows thicker; attached ends follow
   * their (scaled) elements.
   */
  override scale(el: ConnectorElement, t: ScaleTransform): ElementPatch<ConnectorElement> {
    const scaleEnd = (end: ConnectorEnd) => (end.shapeId ? end : { ...end, ...scalePoint(t, end) });
    return { start: scaleEnd(el.start), end: scaleEnd(el.end), size: scaleLength(t, el.size) };
  }

  override handles(el: ConnectorElement): ElementHandle[] {
    const { start, end } = connectorEndpoints(el);
    return [start, end];
  }

  override interactionAt(
    el: ConnectorElement,
    p: Point,
    query: InteractionQuery,
  ): ElementInteraction<BoardToolOptions> | null {
    if (!query.selected) return null;
    const ends = connectorEndpoints(el);
    for (const which of ["end", "start"] as const) {
      if (Math.hypot(p.x - ends[which].x, p.y - ends[which].y) > query.reach) continue;
      return {
        cursor: "move",
        press: (ctx, pointer) =>
          new ConnectorDrag(ctx, { kind: "existing", id: el.id, which }, pointer),
      };
    }
    return null;
  }

  override build(spec: ElementSpec, index: string, context: ElementBuildContext): ConnectorElement {
    const start = connectorEndFrom(spec, "from", context);
    const end = connectorEndFrom(spec, "to", context);
    const look = {
      style: connectorStyleFrom(spec.args.style) ?? "elbow",
      color: spec.color ?? INK_COLOR,
      startHead: arrowHeadFrom(spec.args.startHead, "startHead") ?? "none",
      endHead: arrowHeadFrom(spec.args.endHead, "endHead") ?? "arrow",
    };
    return createConnector(start, end, look, index);
  }

  /** Also re-attaches ends: `from`/`to` (as in a spec) become `start`/`end`. */
  override completePatch(
    _el: ConnectorElement,
    patch: ElementPatch<ConnectorElement>,
    context: ElementBuildContext,
  ): ElementPatch<ConnectorElement> {
    connectorStyleFrom(patch.style);
    connectorSizeFrom(patch.size);
    arrowHeadFrom(patch.startHead, "startHead");
    arrowHeadFrom(patch.endHead, "endHead");
    const { from, to, ...rest } = patch as ElementPatch<ConnectorElement> & ConnectorEndsPatch;
    return {
      ...rest,
      ...(from !== undefined && { start: connectorEnd(from, "from", context) }),
      ...(to !== undefined && { end: connectorEnd(to, "to", context) }),
    };
  }

  /** Its color binds to a color variable. */
  override bindable(): BindableField[] {
    return [colorField("color", t("color"), "stroke-color")];
  }

  override describe(el: ConnectorElement): ElementDescription {
    return { kind: el.style, ends: { from: el.start.shapeId, to: el.end.shapeId } };
  }

  override optionsOf(el: ConnectorElement): Partial<BoardToolOptions> {
    return {
      connectorStyle: el.style,
      connectorColor: el.color,
      connectorStartHead: el.startHead,
      connectorEndHead: el.endHead,
      ...colorTokenOptions(el, CONNECTOR_DEFAULTS.colorOptions),
    };
  }

  override restyle(
    el: ConnectorElement,
    o: Partial<BoardToolOptions>,
  ): ElementPatch<ConnectorElement> {
    const patch: ElementPatch<ConnectorElement> = restyleColors(
      el,
      o,
      CONNECTOR_DEFAULTS.colorOptions,
    );
    if (o.connectorStyle) patch.style = o.connectorStyle;
    if (o.connectorStartHead) patch.startHead = o.connectorStartHead;
    if (o.connectorEndHead) patch.endHead = o.connectorEndHead;
    return patch;
  }
}

function moveEnd(end: ConnectorEnd, dx: number, dy: number): ConnectorEnd {
  if (end.shapeId) return end;
  return { ...end, x: Math.round(end.x + dx), y: Math.round(end.y + dy) };
}
