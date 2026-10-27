export interface SealsVideoProps {
  /** Plays while true and pauses where it is when false; with reduced motion it never plays. */
  playing: boolean;
  /** `none` waits until it plays (shown on open); `metadata` gets ready for a quick start (hover). */
  preload?: "none" | "metadata";
  className?: string;
}
