/** Typography and limits shared by every element, in world units. */
export const ELEMENT_DEFAULTS = {
  fontFamily: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
  lineHeight: 1.35,
  /** Elements smaller than this (in either direction) aren't created or resized further. */
  minSize: 16,
} as const;
