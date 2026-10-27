import type { MessageParams } from "./i18n.types";

const PLACEHOLDER = /\{(\w+)\}/g;

/** Fills `{name}` placeholders from `params`; one without a value stays as it is. */
export function formatMessage(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : String(value);
  });
}
