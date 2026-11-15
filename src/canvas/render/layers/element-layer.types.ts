/** An element's entrance while it plays: when it started and its look at each moment. */
export interface Entrance {
  start: number;
  /** The look `elapsed` ms in, `null` once it's over (`entranceAt`, `fadeInAt`). */
  look: (elapsed: number) => { scale: number; alpha: number } | null;
}
