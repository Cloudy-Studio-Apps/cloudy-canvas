import type { RepeatSettings } from "../repeat";

/** What `data_repeat_set` and `data_layer_repeat` were asked to change. */
export interface RepeatArgs {
  /** Only the settings that were given; a cleared optional one is present as `undefined`. */
  repeat: Partial<RepeatSettings>;
  /** Give a frame without an auto layout a wrapping row (true unless turned off). */
  addLayout: boolean;
}
