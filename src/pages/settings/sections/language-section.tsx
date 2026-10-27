import { LOCALE_NAMES, matchLocale, SUPPORTED_LOCALES } from "@shared/core";
import type { LocalePreference } from "@shared/core";
import { useLocaleStore } from "@shared/stores/locale-store";
import { SelectField } from "@shared/ui/kit";
import type { SelectOption } from "@shared/ui/kit";
import { SettingsSection } from "../components/settings-section";
import { t } from "../settings.i18n";

/** Settings › Language: the OS's language or a fixed one, applied on the next launch. */
export function LanguageSection() {
  const preference = useLocaleStore((s) => s.preference);
  const setPreference = useLocaleStore((s) => s.setPreference);
  const system = LOCALE_NAMES[matchLocale(navigator.languages)];
  const options: SelectOption<LocalePreference>[] = [
    { value: "system", label: t("language.system", { language: system }) },
    ...SUPPORTED_LOCALES.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] })),
  ];

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
        <p className="text-xs text-muted-foreground">{t("language.restartNote")}</p>
      </div>
    </SettingsSection>
  );
}
