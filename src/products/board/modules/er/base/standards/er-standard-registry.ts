import { BUILT_IN_ER_STANDARDS } from "./built-in-standards";
import { CLOUDY_STANDARD } from "./cloudy.standard";
import type { ErStandardDefinition } from "./er-standard.types";

/**
 * The standards installed: what the board's `erStandards` point holds once the modules have
 * loaded (the er module points it there with `useSource`), else the built-ins (scripts, tests).
 * Drawing, the text, the Check diagram and the picker read standards only through it.
 */
export class ErStandardRegistry {
  private source: () => readonly ErStandardDefinition[] = () => BUILT_IN_ER_STANDARDS;

  /** Where the standards come from (read on every lookup, so plugins loaded later count). */
  useSource(source: () => readonly ErStandardDefinition[]): void {
    this.source = source;
  }

  list(): readonly ErStandardDefinition[] {
    const standards = this.source();
    return standards.length > 0 ? standards : BUILT_IN_ER_STANDARDS;
  }

  /** The standard installed with this id, or `undefined`. */
  get(id: string): ErStandardDefinition | undefined {
    return this.list().find((standard) => standard.id === id);
  }

  /** The standard a diagram follows: its own if installed, else the default. */
  resolve(id: string | undefined): ErStandardDefinition {
    return (id !== undefined ? this.get(id) : undefined) ?? this.get("cloudy") ?? CLOUDY_STANDARD;
  }
}

/** The board's ER standards (see `ErStandardRegistry`). */
export const erStandards = new ErStandardRegistry();
