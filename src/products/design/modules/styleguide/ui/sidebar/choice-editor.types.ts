import type { StyleguideCategory, StyleguideTemplate, TemplateOptions } from "@design";

export interface ChoiceEditorProps {
  category: StyleguideCategory;
  group?: string;
  /** The template in effect and its options. */
  choice: { template: StyleguideTemplate; options: TemplateOptions };
  /** Picks a template or changes its options. */
  onChoose(template: StyleguideTemplate, options: TemplateOptions): void;
}
