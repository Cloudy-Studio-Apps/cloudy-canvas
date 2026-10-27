import { appLifecycle } from "@platform";
import {
  getLocale,
  LOCALE_NAMES,
  matchLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "@shared/core";
import type { LocalePreference } from "@shared/core";
import { useLocaleStore } from "@shared/stores/locale-store";
import { notifyError } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/components/ui/button";
import { SelectField } from "@shared/ui/kit";
import type { SelectOption } from "@shared/ui/kit";
import { SettingsSection } from "../components/settings-section";
import { t } from "../settings.i18n";

/** Finishes pending saves, then reloads the window, which sets the locale again at boot. */
async function restart(): Promise<void> {
  try {
    await appLifecycle.runQuitTasks();
    window.location.reload();
  } catch (error) {
    notifyError(t("language.restartFailed"), error);
  }
}

/**
 * Settings › Language: the OS's language or a fixed one. The locale is set once at boot, so a
 * different choice offers Restart now (or applies on the next launch).
 */
export function LanguageSection() {
  const preference = useLocaleStore((s) => s.preference);
  const setPreference = useLocaleStore((s) => s.setPreference);
  const system = LOCALE_NAMES[matchLocale(navigator.languages)];
  const options: SelectOption<LocalePreference>[] = [
    { value: "system", label: t("language.system", { language: system }) },
    ...SUPPORTED_LOCALES.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] })),
  ];
  const pending = resolveLocale(preference, navigator.languages) !== getLocale();

  return (
    <SettingsSection
      id="language"
      title={t("language.title")}
      description={t("language.description")}
    >
      <div className="max-w-xs space-y-2">
        <SelectField
          label={t("language.label")}
          layout="stacked"
          value={preference}
          options={options}
          onChange={setPreference}
        />
        {pending && (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-muted-foreground">{t("language.restartNote")}</p>
            <Button size="sm" onClick={() => void restart()}>
              {t("language.restart")}
            </Button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
