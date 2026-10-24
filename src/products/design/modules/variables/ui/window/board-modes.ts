import { DEFAULT_VALUE, type ModeAxisRecord, type TokenStore } from "@canvas";

import type { BoardMode } from "./board-model.types";

/** The axis the board shows: the one picked, else the first with several modes, else the first. */
export function boardAxis(store: TokenStore, axisId: string | null): ModeAxisRecord | undefined {
  return (axisId ? store.axis(axisId) : undefined) ?? store.switchableAxes()[0] ?? store.axes()[0];
}

/** The modes the board shows values in: the axis's (or one default value without modes). */
export function boardModes(axis: ModeAxisRecord | undefined): BoardMode[] {
  if (!axis || axis.modes.length < 2) {
    return [
      {
        id: axis?.modes[0]?.id ?? DEFAULT_VALUE,
        name: axis?.modes[0]?.name ?? "Value",
        context: {},
      },
    ];
  }
  return axis.modes.map((mode) => ({
    id: mode.id,
    name: mode.name,
    context: { [axis.id]: mode.id },
  }));
}
