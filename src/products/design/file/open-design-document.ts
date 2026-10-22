import { CanvasDocument, type ElementKinds } from "@canvas";

import type { DesignToolOptions } from "../design-options.types";
import { decodeDesignFile } from "./design-file";
import type { DesignMigration } from "./design-migration.types";

/**
 * A design's document from its `.cdesign` bytes, brought up to date by the modules' migrations
 * (in module order, not an undo step).
 */
export function openDesignDocument(
  bytes: Uint8Array,
  kinds: ElementKinds<DesignToolOptions>,
  migrations: readonly DesignMigration[],
): CanvasDocument {
  const doc = CanvasDocument.fromUpdate(kinds, decodeDesignFile(bytes));
  for (const migration of migrations) migration.migrate(doc);
  return doc;
}

/** A new, empty design, set up by the modules' migrations as an opened file is (e.g. its page). */
export function newDesignDocument(
  kinds: ElementKinds<DesignToolOptions>,
  migrations: readonly DesignMigration[],
): CanvasDocument {
  const doc = new CanvasDocument(kinds);
  for (const migration of migrations) migration.migrate(doc);
  return doc;
}
