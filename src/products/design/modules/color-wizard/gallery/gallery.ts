import { seededRandom } from "../color";
import type { GalleryCategory } from "./gallery.types";
import { SEASON_CATEGORIES } from "./season-categories";
import { STYLE_CATEGORIES } from "./style-categories";
import { OCCASION_CATEGORIES } from "./occasion-categories";
import { SCENE_CATEGORIES } from "./scene-categories";

/** Every gallery category, by group. */
export const GALLERY_CATEGORIES: readonly GalleryCategory[] = [
  ...STYLE_CATEGORIES,
  ...SEASON_CATEGORIES,
  ...SCENE_CATEGORIES,
  ...OCCASION_CATEGORIES,
];

/** How many palettes "Generate more" adds. */
export const GALLERY_PAGE = 15;

/** A category's first `count` palettes: seeded by its id, so they're the same every time. */
export function galleryPalettes(category: GalleryCategory, count: number): string[][] {
  const seed = [...category.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return Array.from({ length: count }, (_, i) => category.generate(seededRandom(seed + i * 977)));
}
