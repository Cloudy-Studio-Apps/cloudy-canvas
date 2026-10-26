import type {
  StyleguideCategory,
  StyleguideTemplate,
  TemplateOptions,
} from "../../styleguide.types";

export interface TemplatePickerProps {
  category: StyleguideCategory;
  /** One group's previews; unset: the category's first groups. */
  group?: string;
  /** The template in effect. */
  current: string;
  /** The options the previews are drawn with (the current template's). */
  options: TemplateOptions;
  onPick(template: StyleguideTemplate): void;
}

export interface TemplateCardProps {
  category: StyleguideCategory;
  group?: string;
  template: StyleguideTemplate;
  options: TemplateOptions;
  selected: boolean;
  onPick(): void;
}

export interface TemplateOptionsProps {
  template: StyleguideTemplate;
  options: TemplateOptions;
  onChange(options: TemplateOptions): void;
}

export interface OptionFieldProps {
  spec: TemplateOptionsProps["template"]["options"][number];
  value: unknown;
  onChange(value: unknown): void;
}
