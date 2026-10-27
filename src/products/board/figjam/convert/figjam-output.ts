import type { CanvasElement } from "@canvas";
import { nKeysBetween } from "@canvas";

/**
 * The converted elements in drawing order. Some can only be built once every node is converted
 * (connectors need the elements their ends are on), so they're added as builders that run then.
 */
export class FigJamOutput {
  private readonly entries: (CanvasElement | (() => CanvasElement[]))[] = [];

  add(...elements: CanvasElement[]): void {
    this.entries.push(...elements);
  }

  /** Adds what `build` makes, in this place, once every node is converted. */
  defer(build: () => CanvasElement[]): void {
    this.entries.push(build);
  }

  /** Every element, bottom to top, each with its own index. */
  elements(): CanvasElement[] {
    const elements = this.entries.flatMap((entry) =>
      typeof entry === "function" ? entry() : [entry],
    );
    const keys = nKeysBetween(null, null, elements.length);
    return elements.map((el, i) => ({ ...el, index: keys[i] ?? el.index }));
  }
}
