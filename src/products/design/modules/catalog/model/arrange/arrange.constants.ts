/**
 * Spaces of the arranged layout, in world units: pages of one spread touch at the spine, spreads
 * sit 160 apart, and options 80 from their page and from each other (also how far other layers
 * are pushed clear of it).
 */
export const ARRANGE_GAPS = { spine: 0, spread: 160, option: 80 } as const;
