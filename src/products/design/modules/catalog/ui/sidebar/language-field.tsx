import { getLocale } from "@shared/core";

import { BROCHURE_LANGUAGES } from "../../model/language/brochure-languages";
import { SelectField } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { t } from "../../catalog.i18n";

/** The choice for a brochure from before languages, which follows the app's. */
const APP = "app";

/**
 * The language the brochure is written in (its dates, page items and PDF), each named in itself;
 * changing it rewrites its built-in page items in it.
 */
export function LanguageField() {
  const { brochure, settings } = useBrochure();
  if (!brochure) return null;
  const options = [
    ...BROCHURE_LANGUAGES.map((language) => ({ value: language.code, label: language.name })),
    ...(settings.language === null ? [{ value: APP, label: t("settings.language.app") }] : []),
  ];
  // A tag the list doesn't name (an agent's "fr-CA") still shows as itself.
  if (settings.language && !options.some((option) => option.value === settings.language)) {
    options.push({ value: settings.language, label: settings.language });
  }

  return (
    <SelectField
      label={t("settings.language.label")}
      layout="inline"
      value={settings.language ?? APP}
      options={options}
      onChange={(code) => brochure.setSettings({ language: code === APP ? getLocale() : code })}
    />
  );
}
