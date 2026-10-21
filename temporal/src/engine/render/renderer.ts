import { Application, Container } from "pixi.js";

import type { Camera } from "../camera";
import type { Shape } from "../document";
import type { CanvasTheme } from "./canvas-theme.types";
import { DraftRelationLayer } from "./layers/draft-relation-layer";
import { DraftStrokeLayer } from "./layers/draft-stroke-layer";
import { ErLinkLayer } from "./layers/er-link-layer";
import { GridLayer } from "./layers/grid-layer";
import { OverlayLayer } from "./layers/overlay-layer";
import { RelationLayer } from "./layers/relation-layer";
import { ShapeLayer } from "./layers/shape-layer";
import type { OverlayState } from "./overlay-state.types";
import type { RelationState } from "./relation-state.types";

/**
 * Owns the Pixi application and composes the layers, bottom to top:
 * grid (screen) → world (sections, relations, shapes, drafts; follows the camera) → overlay (screen).
 */
export class Renderer {
  readonly app = new Application();
  /**
   * Sections (and ER aggregation boxes) live in their own layer so relation lines show above them
   * but below other shapes.
   */
  private readonly sections = new ShapeLayer();
  private readonly shapes = new ShapeLayer();
  readonly draftStroke = new DraftStrokeLayer();
  private readonly grid = new GridLayer();
  private readonly relations = new RelationLayer();
  private readonly erLinks = new ErLinkLayer();
  private readonly draftRelation = new DraftRelationLayer();
  private readonly world = new Container();
  private readonly overlay = new OverlayLayer();

  constructor(private theme: CanvasTheme) {}

  async init(width: number, height: number): Promise<void> {
    await this.app.init({
      width,
      height,
      background: this.theme.background,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      autoStart: false, // render on demand only
      preference: ["webgl", "canvas"],
    });
    this.world.addChild(
      this.sections,
      this.relations,
      this.erLinks,
      this.shapes,
      this.draftStroke,
      this.draftRelation,
    );
    this.app.stage.addChild(this.grid, this.world, this.overlay);
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas;
  }

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
  }

  setTheme(theme: CanvasTheme): void {
    this.theme = theme;
    this.app.renderer.background.color = theme.background;
  }

  syncShapes(shapes: Iterable<Shape>, removed: Iterable<string> = []): void {
    const sections: Shape[] = [];
    const others: Shape[] = [];
    for (const shape of shapes) {
      const behind = shape.type === "section" || shape.type === "er-aggregate";
      (behind ? sections : others).push(shape);
    }
    const gone = [...removed];
    this.sections.sync(sections, gone);
    this.shapes.sync(others, gone);
  }

  /** Re-rasterizes text for the zoom level. */
  setTextZoom(zoom: number): void {
    this.sections.setTextZoom(zoom);
    this.shapes.setTextZoom(zoom);
    this.erLinks.setTextZoom(zoom);
  }

  /** Hides a shape's canvas text while the DOM text editor shows it. */
  setHiddenText(id: string | null): void {
    this.sections.setHiddenText(id);
    this.shapes.setHiddenText(id);
  }

  render(camera: Camera, overlay: OverlayState, relations: RelationState): void {
    this.world.scale.set(camera.zoom);
    this.world.position.set(camera.x * camera.zoom, camera.y * camera.zoom);
    this.grid.draw(camera, this.theme.grid);
    this.relations.draw(relations, camera.zoom, this.theme.relation, this.theme.selection);
    this.erLinks.draw(relations.erLinks, relations.highlighted, this.theme.selection);
    this.draftRelation.draw(relations.draft, camera.zoom, this.theme.selection);
    this.overlay.draw(camera, overlay, this.theme.selection);
    this.app.render();
  }

  destroy(): void {
    this.app.destroy({ removeView: true }, { children: true });
  }
}
