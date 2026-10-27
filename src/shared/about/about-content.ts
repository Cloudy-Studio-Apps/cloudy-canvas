import type { AboutCredit } from "./about-content.types";
import { t } from "./about.i18n";

export const AUTHOR = "DarkRedgm";
export const WEBSITE_URL = "https://darkredgm.com/";
export const COPYRIGHT = `Copyright © 2026 ${AUTHOR}`;
export const TAGLINE = t("tagline");
export const LICENSE_NAME = "GNU Affero General Public License v3.0";

/** Paragraphs of the disclaimer shown in the About dialog. */
export const DISCLAIMER: readonly string[] = [
  t("disclaimer.warranty"),
  t("disclaimer.early"),
  t("disclaimer.trademarks"),
];

/** Third-party content shipped with the app. */
export const CREDITS: readonly AboutCredit[] = [
  { name: "Twemoji", by: "Twitter, Inc. and contributors", license: "CC BY 4.0" },
  { name: "Inter", by: "Rasmus Andersson", license: "SIL Open Font License 1.1" },
  { name: "Lucide", by: "Lucide contributors", license: "ISC" },
  { name: "Simple Icons", by: "Simple Icons contributors", license: "CC0 1.0" },
];
