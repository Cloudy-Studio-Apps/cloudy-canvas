import {
  readThemeDefinition,
  THEME_TOKEN_NAMES,
  themeRegistry,
  type ThemeDefinition,
} from "@shared/core";
import { onThemeChange, useActiveTheme } from "@shared/ui/theme";
import type { PluginThemeStage } from "./plugin-themes.types";

/**
 * `api.themes` for one plugin. Themes are checked when registered (so the plugin sees its
 * mistakes in `activate`) and added to the registry by `commit`, once `activate` succeeds.
 */
export function createPluginThemes(pluginId: string): PluginThemeStage {
  const staged: ThemeDefinition[] = [];

  return {
    api: {
      register: (theme) => {
        const { theme: read, ignored } = readThemeDefinition(theme);
        if (ignored.length > 0) {
          console.warn(
            `[plugins] "${pluginId}": the theme "${read.id}" sets tokens that don't exist: ${ignored.join(", ")}.`,
          );
        }
        if (staged.some((other) => other.id === read.id)) {
          throw new Error(`The theme "${read.id}" is registered twice.`);
        }
        staged.push(read);
      },
      useActiveTheme,
      onThemeChange,
      tokens: THEME_TOKEN_NAMES,
    },
    commit: () => {
      try {
        for (const theme of staged) themeRegistry.register(theme, pluginId);
      } catch (error) {
        themeRegistry.drop(pluginId);
        throw error;
      }
      return staged.length;
    },
  };
}
