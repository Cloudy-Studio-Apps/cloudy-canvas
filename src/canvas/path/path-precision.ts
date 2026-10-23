/**
 * Clipper works in integers: world units are scaled by this before clipping (1/256 of a unit is
 * finer than any screen shows, and keeps products of coordinates within exact doubles).
 */
export const PATH_SCALE = 256;

/**
 * How far a flattened curve may stray from the real one, in world units. Booleans rebuild their
 * curves from the source ones (`rebuildContour`), so this only moves where shapes cross.
 */
export const FLATTEN_TOLERANCE = 0.05;

/** Subdivisions at most per curve while flattening (2^12 pieces). */
export const MAX_FLATTEN_DEPTH = 12;
