import { CanvasDocument } from "@canvas";
import { saveNewCanvasFile } from "@canvas-ui";
import type { FileInfo } from "@shared/core";
import { DESIGN_FILE_FORMAT } from "@design/ui/file/design-file-format";
import { DESIGN_PAGES } from "../../design-pages";
import { copyPageInto, copyUsedAssets } from "../../split";
import type { PageSplitContext } from "../pages.points.types";
import type { SplitPageInput } from "./split-page.types";

/**
 * Moves a page into a new file: builds it in memory (the page, its layers, the project link in a
 * project), runs every step's `before` (one returning `false` cancels), then every `copy`, copies
 * the pictures the result uses and writes it. The page leaves the design (one undo step) only once
 * the file is written and on the disk, so a crash or power cut never loses it (at worst it's in both). Resolves the new file, or `null` when a step or the Save dialog cancelled.
 */
export async function splitPage(input: SplitPageInput): Promise<FileInfo | null> {
  const { engine, pageId, inProject, folder, dialog } = input;
  const source = engine.doc;
  const page = engine.service(DESIGN_PAGES).page(pageId);
  if (!page) throw new Error(`No page ${pageId}`);
  const target = new CanvasDocument(engine.kinds);
  try {
    const nodes = copyPageInto(source, target, pageId);
    const link = source.projectLink();
    if (inProject && link) target.setProjectLink(link);
    target.setMeta({ title: page.name });

    const ctx: PageSplitContext = { source, target, page, nodes, inProject, dialog };
    const steps = [...input.steps].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
    const prepared = new Map<string, unknown>();
    for (const step of steps) {
      if (!step.before) continue;
      const result: unknown = await step.before(ctx);
      if (result === false) return null;
      prepared.set(step.id, result);
    }
    for (const step of steps) await step.copy?.(ctx, prepared.get(step.id));
    copyUsedAssets(source, target);

    const file = await saveNewCanvasFile({
      doc: target,
      format: DESIGN_FILE_FORMAT,
      name: page.name,
      folder,
    });
    if (file) engine.service(DESIGN_PAGES).remove(pageId);
    return file;
  } finally {
    target.destroy();
  }
}
