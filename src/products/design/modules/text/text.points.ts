import { definePoint } from "@shared/core";

import type { TextTemplateSource } from "./text.points.types";

/**
 * Templates texts are edited through, keyed by id: the first that claims a text is what the
 * editor opens on and commits to (data bindings' `dataText`).
 */
export const textTemplates = definePoint<TextTemplateSource>("design.text.templates", {
  keyOf: (s) => s.id,
});
