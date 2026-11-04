import type { RepeatSettings } from "../repeat";

/** What `set_repeat` and `repeat_layer` were asked to change. */
export interface RepeatArgs {
  /** Only the settings that were given; a cleared optional one is present as `undefined`. */
  repeat: Partial<RepeatSettings>;
  /** Give a frame without an auto layout a wrapping row (true unless turned off). */
  addLayout: boolean;
}
