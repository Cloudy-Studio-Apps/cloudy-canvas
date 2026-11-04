import type { RepeatSettings, SetRepeatOptions } from "../../repeat";

/** Sets (or with `null` removes) a frame's repeat; a refusal is reported and its text returned. */
export type ApplyRepeat = (
  repeat: Partial<RepeatSettings> | null,
  opts?: SetRepeatOptions,
) => string | null;
