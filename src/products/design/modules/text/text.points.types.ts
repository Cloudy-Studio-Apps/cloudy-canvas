import type { ElementPatch } from "@canvas";

import type { TextNodeElement, TextNodeRun } from "./text.types";

/**
 * A text's own content, kept apart from what it shows (a data binding's `{product.name}`): the
 * text editor opens on it and writes edits back to it, while everything else (drawing, export,
 * layout, search, agents) keeps reading the text's `text` and `runs`.
 */
export interface TextTemplateSource {
  id: string;
  /** Whether this text is edited through this template. */
  claims(el: TextNodeElement): boolean;
  /** What the editor opens on. */
  read(el: TextNodeElement): { text: string; runs: TextNodeRun[] };
  /** The patch that writes the edited template (never the shown `text`/`runs`). */
  write(el: TextNodeElement, text: string, runs: TextNodeRun[]): ElementPatch<TextNodeElement>;
}

/** The template sources a text kind consults (the module's `textTemplates` entries). */
export type TextTemplates = () => readonly TextTemplateSource[];
