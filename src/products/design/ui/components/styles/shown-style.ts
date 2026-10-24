import { resolveStyle, type StyleRecord, type TokenStore } from "@canvas";

/**
 * A style as the file shows it: its value with its variables' current values (in the file's
 * modes). Its stored value keeps what they were when bound, so lists and previews read this.
 */
export function shownStyle(store: TokenStore, style: StyleRecord): StyleRecord {
  return style.bindings && Object.keys(style.bindings).length > 0
    ? { ...style, value: resolveStyle(store, style, {}) }
    : style;
}
