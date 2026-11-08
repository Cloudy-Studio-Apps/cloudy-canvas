import type { HotspotRect } from "./hotspot-rects.types";

export interface HotspotsProps {
  /** Relative to the screen, in world units. */
  rects: readonly HotspotRect[];
  /** Outlined (a missed click flashes them, the hotspots button keeps them shown). */
  shown: boolean;
}
