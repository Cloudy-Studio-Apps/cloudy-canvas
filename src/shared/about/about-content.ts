import type { AboutCredit } from "./about-content.types";

export const AUTHOR = "DarkRedgm";
export const WEBSITE_URL = "https://darkredgm.com/";
export const COPYRIGHT = `Copyright © 2026 ${AUTHOR}`;
export const TAGLINE = "Boards and designs on one canvas. Part of Cloudy Studio.";
export const LICENSE_NAME = "GNU Affero General Public License v3.0";

/** Paragraphs of the disclaimer shown in the About dialog. */
export const DISCLAIMER: readonly string[] = [
  "Cloudy Canvas is provided “as is”, without warranty of any kind, express or implied. In no event shall the authors be liable for any claim, damages or other liability arising from its use (see sections 15 and 16 of the license).",
  "This is an early version under active development. Keep backups of files that matter to you.",
  "Figma and FigJam are trademarks of Figma, Inc. Cloudy Canvas is not affiliated with or endorsed by Figma.",
];

/** Third-party content shipped with the app. */
export const CREDITS: readonly AboutCredit[] = [
  { name: "Twemoji", by: "Twitter, Inc. and contributors", license: "CC BY 4.0" },
  { name: "Inter", by: "Rasmus Andersson", license: "SIL Open Font License 1.1" },
  { name: "Lucide", by: "Lucide contributors", license: "ISC" },
  { name: "Simple Icons", by: "Simple Icons contributors", license: "CC0 1.0" },
];
