import type { LocalePreference } from "@shared/core";

export interface LocaleState {
  /** Settings › Language; read once at boot (`app/i18n-boot.ts`), so a change applies on restart. */
  preference: LocalePreference;
  setPreference: (preference: LocalePreference) => void;
}
