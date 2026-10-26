import type { StyleguideCategory, StyleguideTemplate } from "../styleguide.types";

/** What the styleguide's agent tools read from the modules. */
export interface StyleguideToolSources {
  categories(): readonly StyleguideCategory[];
  templates(): readonly StyleguideTemplate[];
}
