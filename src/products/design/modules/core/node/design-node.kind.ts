import {
  BoxKind,
  type ElementBuildContext,
  type ElementClip,
  type ElementDescription,
  type ElementPatch,
  type ElementSpec,
  type ElementView,
  type Point,
} from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { applyNodeSpec } from "./apply-node-spec";
import { checkNodePatch } from "./check-node-patch";
import type { DesignNode } from "./design-node.types";
import type { NodeBuildContext } from "./node-build.types";
import { NODE_DEFAULTS } from "./node.defaults";

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

  /** Whether it has an inside to fill (lines don't: they only show strokes). */
  readonly fillable: boolean = true;
  /** Whether it shows strokes (text doesn't yet). */
  readonly strokable: boolean = true;
  /** Whether its fills can be images (text can't: its fill is its color). */
  readonly imageFills: boolean = true;

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
