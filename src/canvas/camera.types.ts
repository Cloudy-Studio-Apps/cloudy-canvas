/** How `Camera.fitRect` fits a rect. */
export interface FitOptions {
  /** Screen pixels left round it (80 by default). */
  padding?: number;
  /** The most it zooms in to fit (1, 100%, by default); the camera's own limit still applies. */
  maxZoom?: number;
}
