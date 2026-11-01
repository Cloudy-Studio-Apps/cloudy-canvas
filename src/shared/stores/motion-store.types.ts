export interface MotionState {
  /** Whether animated GIFs play on the canvas; off, they show their first frame. */
  playGifs: boolean;
  setPlayGifs: (playGifs: boolean) => void;
}
