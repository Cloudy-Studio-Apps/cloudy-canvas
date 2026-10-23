import {
  BoxKind,
  type ElementBuildContext,
  type ElementClip,
  type ElementDescription,
  type ElementPatch,
  type ElementSpec,
  type ElementStyle,
  type ElementView,
  type Point,
  rotatePoint,
  scaleLength,
  type ScaleTransform,
  type StrokeOutlineOptions,
} from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { applyNodeSpec } from "./apply-node-spec";
import { checkNodePatch } from "./check-node-patch";
import type { DesignNode, NodeGeometry } from "./design-node.types";
import { GEOMETRY_CACHE } from "./node-geometry";
import type { NodeBuildContext } from "./node-build.types";
import { flipPaints } from "./flip-paints";
import { scaleTiles } from "./scale-tiles";
import { flipPlacement } from "./flip-placement";
import type { FlipAxis } from "./flip.types";
import { NODE_DEFAULTS } from "./node.defaults";
import { NODE_STYLE_FIELDS, nodeStylePatch } from "./node-style";

/**
 * The base of every design element type. It handles what all nodes share (name, place in the
 * tree, visibility, opacity, fills and strokes, the images they show); a subclass gives its
 * `type`, `label`, `description` and `draw` (with `drawPaints`). Plugins extend it the same way.
 */
export abstract class DesignNodeKind<E extends DesignNode = DesignNode> extends BoxKind<
  E,
  DesignToolOptions
> {
  override readonly connectable: boolean = false;
  /** Layers turn (`rotation`, round their top-left corner); the engine draws and hits them turned. */
  override readonly rotatable: boolean = true;
  /** Whether agents can create it (`create_nodes`); kinds that can give `nodeFromSpec`. */
  override readonly creatable: boolean = false;
  /**
   * Whether it holds other nodes (a frame). Nodes drawn or dropped inside a container go into the
   * topmost one under them; moving or deleting it takes its children along.
   */
  readonly container: boolean = false;
  /**
   * The area its children show in, when it clips them (a frame with "Clip content"), in world
   * units; `null` lets them overflow.
   */
  contentClip(_el: E): ElementClip | null {
    return null;
  }

  /**
   * Whether it may go into this container when drawn or dropped there (sections only go into
   * sections; everything else into any container).
   */
  canGoInto(_parent: DesignNode, _parentKind: DesignNodeKind): boolean {
    return true;
  }

  /** Opacity, fills and strokes; kinds add their own (a corner radius, a font). */
  override readonly styleFields: readonly string[] = NODE_STYLE_FIELDS;

  /** The pasted look as it can show it (no fills on a line, no strokes on a text). */
  override applyStyle(el: E, style: ElementStyle): ElementPatch<E> {
    return nodeStylePatch(this, super.applyStyle(el, style));
  }

  /** Whether it has an inside to fill (lines don't: they only show strokes). */
  readonly fillable: boolean = true;
  /** Whether it shows strokes (text doesn't yet). */
  readonly strokable: boolean = true;
  /** Whether its fills can be images (text can't: its fill is its color). */
  readonly imageFills: boolean = true;

  /**
   * Its shape in local coordinates (see `NodeGeometry`): what it draws, is hit by, masks with as a
   * vector mask and takes part in booleans with. `null` when it has none (a text whose font isn't
   * loaded yet), so it masks by its pixels. Cached by `geometryKey`; kinds give `buildGeometry`.
   */
  geometry(el: E): NodeGeometry | null {
    const key = `${this.type}|${this.geometryKey(el)}`;
    return GEOMETRY_CACHE.getOrSet(key, () => this.buildGeometry(el));
  }

  /**
   * Whether it's made of its children (a group, a boolean; see `ChildHostKind`): a click on a
   * child selects it until it's entered.
   */
  readonly childHost: boolean = false;

  /**
   * Whether what it holds is drawn on its own (a boolean's operands aren't: it draws their
   * result). What isn't drawn can still be clicked (selecting the boolean) and entered.
   */
  readonly drawsChildren: boolean = true;

  /**
   * Whether it has a shape of its own (a group's is its children's): masks and booleans made of
   * it take its geometry, else only its children's.
   */
  readonly ownsShape: boolean = true;

  /**
   * What its geometry depends on, as a string (its size by default; kinds add their shape's
   * fields). Two nodes with the same key share one geometry.
   */
  geometryKey(el: E): string {
    return `${el.w},${el.h}`;
  }

  /**
   * How its strokes are turned into an area (a boolean's operand that has no fill, Outline
   * stroke): square ends and corners by default.
   */
  strokeOutline(el: E): StrokeOutlineOptions {
    return { width: el.strokeWeight, cap: "butt", join: "miter" };
  }

  /** Works out its geometry (`geometry` caches it); none by default. */
  protected buildGeometry(_el: E): NodeGeometry | null {
    return null;
  }

  /** Its name in the layers panel: the one it was given, or one it derives (e.g. a text's). */
  layerName(el: E): string {
    return el.name || this.label;
  }

  /**
   * Draws the node in local coordinates, usually with `drawPaints(view, el, outline)`, which also
   * applies its opacity and visibility.
   */
  abstract override draw(view: ElementView, el: E): void;

  override hitTest(el: E, p: Point, tolerance: number): boolean {
    return el.visible && super.hitTest(el, p, tolerance);
  }

  /**
   * Whether it looks the same upside down (rectangles, ellipses, frames). Ones that don't (a
   * polygon's point) turn half round when flipped top to bottom, which draws them mirrored.
   */
  readonly symmetricVertically: boolean = true;

  /** Its angle as the panel shows it: its `rotation` (a line's runs along its ends). */
  turnOf(el: E): number {
    return el.rotation ?? 0;
  }

  /**
   * Patch that mirrors it across the line `at` on `axis` (flip horizontal or vertical): the same
   * shape in the mirrored place, turned the other way.
   */
  flip(el: E, axis: FlipAxis, at: number): ElementPatch<E> {
    const placement = flipPlacement(el, axis, at);
    if (axis === "x" || this.symmetricVertically) {
      return { ...placement, ...flipPaints(el, axis) } as ElementPatch<E>;
    }
    // Upside down: half a turn round its middle mirrors a shape symmetric left to right.
    const placed = { ...el, ...placement };
    const middle = rotatePoint(
      { x: placed.x + el.w / 2, y: placed.y + el.h / 2 },
      placed,
      placed.rotation ?? 0,
    );
    // Turned half round, its box is mirrored left to right where the shape looks mirrored.
    return {
      ...placement,
      ...this.rotate(placed, 180, middle),
      ...flipPaints(el, "x"),
    } as ElementPatch<E>;
  }

  /**
   * Scaled (the Scale tool): its geometry as the kind scales it, its stroke weight and its tiled
   * images' tiles.
   */
  override scale(el: E, t: ScaleTransform): ElementPatch<E> {
    return {
      ...super.scale(el, t),
      strokeWeight: scaleLength(t, el.strokeWeight),
      ...scaleTiles(el, t),
    };
  }

  /** Hidden layers aren't snapped to. */
  override snapTarget(el: E): boolean {
    return el.visible && super.snapTarget(el);
  }

  override fillDefaults(el: E): E {
    return {
      ...el,
      name: el.name ?? this.label,
      parentId: el.parentId ?? null,
      pageId: el.pageId ?? "",
      visible: el.visible ?? true,
      opacity: el.opacity ?? NODE_DEFAULTS.opacity,
      fills: el.fills ?? [],
      strokes: el.strokes ?? [],
      strokeWeight: el.strokeWeight ?? NODE_DEFAULTS.strokeWeight,
      rotation: el.rotation ?? 0,
      isMask: el.isMask ?? false,
      maskType: el.maskType ?? NODE_DEFAULTS.maskType,
      maskInverted: el.maskInverted ?? false,
    };
  }

  /** The images its paints show, so copies, exports and previews carry them. */
  override assets(el: E): string[] {
    return [...el.fills, ...el.strokes].flatMap((paint) =>
      paint.type === "image" ? [paint.assetId] : [],
    );
  }

  override describe(el: E): ElementDescription {
    return { label: this.layerName(el) };
  }

  /**
   * A new node from an agent's spec (`create_nodes`): the kind's own fields (`nodeFromSpec`),
   * then what every node takes (name, visibility, opacity, paints). The tool places it in a
   * container afterwards. Throws with a message the agent can act on.
   */
  buildNode(spec: ElementSpec, index: string, context: NodeBuildContext): E {
    return applyNodeSpec(this, this.nodeFromSpec(spec, index, context), spec);
  }

  /** The node a spec makes, at the top of the page; creatable kinds override it. */
  protected nodeFromSpec(_spec: ElementSpec, _index: string, _context: NodeBuildContext): E {
    throw new Error(`${this.label} layers can't be created by agents.`);
  }

  /** Checks an agent's patch of the shared fields; subclasses check their own, then call this. */
  override completePatch(
    el: E,
    patch: ElementPatch<E>,
    context: ElementBuildContext,
  ): ElementPatch<E> {
    return checkNodePatch(this, el, patch, context);
  }
}
