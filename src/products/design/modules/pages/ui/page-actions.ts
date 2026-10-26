import { DESIGN_PAGES } from "../design-pages";
import type { DesignEngine } from "../../../design-engine.types";
import { notifyError } from "@shared/stores/toast-store";

/** Adds a page after the one on screen and shows it. */
export function addPage(engine: DesignEngine): void {
  const page = engine.service(DESIGN_PAGES).add(engine.scope);
  engine.setScope(page.id);
}

/** Adds a copy of a page right after it and shows it. */
export function duplicatePage(engine: DesignEngine, id: string): void {
  const page = engine.service(DESIGN_PAGES).duplicate(id);
  engine.setScope(page.id);
}

/** Deletes a page and what's on it (the last page can't be deleted). */
export function deletePage(engine: DesignEngine, id: string): void {
  try {
    engine.service(DESIGN_PAGES).remove(id);
  } catch (error) {
    notifyError("Couldn't delete the page", error);
  }
}

/** Shows the page `step` places before or after the one on screen (wrapping around). */
export function stepPage(engine: DesignEngine, step: number): void {
  const pages = engine.service(DESIGN_PAGES).pages();
  if (pages.length < 2) return;
  const at = pages.findIndex((page) => page.id === engine.scope);
  const next = pages[(at + step + pages.length) % pages.length];
  if (next) engine.setScope(next.id);
}
