import { BASE_THEME_ID, BUILT_IN_THEMES } from "./presets";
import type { RegisteredTheme, ThemeDefinition } from "./theme.types";

/**
 * Every theme the app can show: the built-in ones and what plugins register (`api.themes`).
 * App-level, like the sticker catalog. Ids are unique; listing keeps the built-ins first, then
 * plugins' themes in the order they were added.
 */
export class ThemeRegistry {
  private readonly themes = new Map<string, RegisteredTheme>();
  private readonly listeners = new Set<() => void>();
  private version = 0;

  constructor() {
    for (const theme of BUILT_IN_THEMES) this.register(theme, "app");
  }

  /** Adds a theme. Registering an id that exists throws. */
  register(theme: ThemeDefinition, owner: string): void {
    const taken = this.themes.get(theme.id);
    if (taken) {
      throw new Error(
        `The theme "${theme.id}" exists already${taken.owner === "app" ? "" : ` (from "${taken.owner}")`}.`,
      );
    }
    this.themes.set(theme.id, { theme, owner });
    this.changed();
  }

  /** Removes what `owner` registered (a plugin that failed or was turned off). */
  drop(owner: string): void {
    let dropped = false;
    for (const [id, entry] of this.themes) {
      if (entry.owner !== owner) continue;
      this.themes.delete(id);
      dropped = true;
    }
    if (dropped) this.changed();
  }

  get(id: string): ThemeDefinition | undefined {
    return this.themes.get(id)?.theme;
  }

  /** Who added a theme: `app`, or a plugin's id. */
  ownerOf(id: string): string | undefined {
    return this.themes.get(id)?.owner;
  }

  list(): readonly RegisteredTheme[] {
    return [...this.themes.values()];
  }

  /** The theme every chain ends at. */
  base(): ThemeDefinition {
    const base = this.get(BASE_THEME_ID);
    if (!base) throw new Error("The base theme isn't registered.");
    return base;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getVersion(): number {
    return this.version;
  }

  private changed(): void {
    this.version++;
    for (const listener of this.listeners) listener();
  }
}

export const themeRegistry = new ThemeRegistry();
