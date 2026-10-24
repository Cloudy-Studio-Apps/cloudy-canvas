import type { BrochureCovers, BrochureLayout } from "./brochure.types";

/** The brochure record's element type. */
export const BROCHURE_TYPE = "brochure";

/** Every layout, as settings and agents offer them. */
export const BROCHURE_LAYOUTS: readonly BrochureLayout[] = ["book", "single"];

/** Every cover setup of the book layout. */
export const BROCHURE_COVERS: readonly BrochureCovers[] = ["both", "front", "back", "none"];
