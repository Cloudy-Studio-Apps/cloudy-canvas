import type { ElementView, Rect } from "@canvas";

import {
  BoxShapeKind,
  drawPaints,
  withoutLayerOpacity,
  EMPTY_GEOMETRY,
  networkGeometry,
  rectNetwork,
  type DesignNode,
  type DesignNodeKind,
  type NodeGeometry,
} from "../core";
import { createSection } from "./section.factory";
import { SECTION_DEFAULTS } from "./section.defaults";
import { sectionTitleBox } from "./section-title";
import type { SectionElement } from "./section.types";

const TITLE_SLOT = "title";
const TITLE_LAYER = "titlePill";

/** Sections: labeled areas holding frames; they only go into other sections. */
export class SectionKind extends BoxShapeKind<SectionElement> {
  readonly type = "section";
  readonly label = "Section";
  readonly description = "A labeled area to organize frames on the page.";
  override readonly tool = "section";
  override readonly defaults = SECTION_DEFAULTS;
  override readonly container = true;

  createNode(rect: Rect, name: string, index: string, parentId: string | null): SectionElement {
    return createSection(rect, name, index, parentId);
  }

  override canGoInto(_parent: DesignNode, parentKind: DesignNodeKind): boolean {
    return parentKind instanceof SectionKind;
  }

  /** Its rounded box; sections don't become vectors, so it isn't their `vectorNetwork`. */
  protected override buildGeometry(el: SectionElement): NodeGeometry {
    return networkGeometry(rectNetwork(el.w, el.h, SECTION_DEFAULTS.radius), false);
  }

  draw(view: ElementView, el: SectionElement): void {
    // Its opacity covers what it holds, so its scope applies it.
    drawPaints(
      view,
      withoutLayerOpacity(el),
      this.geometry(el) ?? EMPTY_GEOMETRY,
      this.strokeOf(el),
    );
    const name = this.layerName(el);
    const box = sectionTitleBox(el, name);
    const { fontSize, color, background, border, padX, padY, radius } = SECTION_DEFAULTS.title;
    view
      .layer(TITLE_LAYER)
      .clear()
      .roundRect(box.x, box.y, box.w, box.h, radius)
      .fill({ color: background })
      .stroke({ color: border, width: 1 });
    view
      .setTextSlot(TITLE_SLOT, name, { fontSize, color })
      .position.set(box.x + padX, box.y + padY);
  }
}
