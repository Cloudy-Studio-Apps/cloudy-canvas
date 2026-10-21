export type ThemePreference = "system" | "light" | "dark";

export interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}
