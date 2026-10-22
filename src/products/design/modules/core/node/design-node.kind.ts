import { BoxKind, type ElementDescription, type ElementView, type Point } from "@canvas";
import type { Graphics } from "pixi.js";

import type { DesignToolOptions } from "../../../design-options.types";
import type { DesignNode } from "./design-node.types";
import { NODE_DEFAULTS } from "./node.defaults";

/**
 * The base of every design element type. It handles what all nodes share (name, place in the
 * tree, visibility, opacity, fills and strokes); a subclass gives its `type`, `label`,
 * `description` and draws its body in `drawNode`. Plugins extend it the same way.
 */
export abstract class DesignNodeKind<E extends DesignNode = DesignNode> extends BoxKind<
  E,
  DesignToolOptions
> {
  override readonly connectable: boolean = false;
  /** Agents can't create design nodes yet. */
  override readonly creatable: boolean = false;
  /**
   * Whether it holds other nodes (a frame). Nodes drawn or dropped inside a container go into the
   * topmost one under them; moving or deleting it takes its children along.
   */
  readonly container: boolean = false;

  /** Draws the node's body into `g` (its view's graphics, already cleared), in local coordinates. */
  protected abstract drawNode(view: ElementView, el: E, g: Graphics): void;

  draw(view: ElementView, el: E): void {
    const g = view.graphics.clear();
    g.visible = el.visible;
    g.alpha = el.opacity;
    this.drawNode(view, el, g);
  }

  override hitTest(el: E, p: Point, tolerance: number): boolean {
    return el.visible && super.hitTest(el, p, tolerance);
  }

  override fillDefaults(el: E): E {
    return {
      ...el,
      name: el.name ?? this.label,
      parentId: el.parentId ?? null,
      visible: el.visible ?? true,
      opacity: el.opacity ?? NODE_DEFAULTS.opacity,
      fills: el.fills ?? [],
      strokes: el.strokes ?? [],
      strokeWeight: el.strokeWeight ?? NODE_DEFAULTS.strokeWeight,
    };
  }

  override describe(el: E): ElementDescription {
    return { label: el.name };
  }
}
