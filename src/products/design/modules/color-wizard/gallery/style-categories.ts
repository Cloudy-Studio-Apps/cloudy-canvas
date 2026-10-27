import { between, oklchColor } from "../color";
import type { GalleryCategory } from "./gallery.types";
import { gradientPalette, mixPalette, rangePalette } from "./recipes";
import { t } from "../color-wizard.i18n";

/** Palettes by style. */
export const STYLE_CATEGORIES: readonly GalleryCategory[] = [
  {
    group: "Styles",
    id: "pastel",
    label: t("gallery.style.pastel"),
    description: t("gallery.style.pastelHint"),
    generate: rangePalette({ l: [0.87, 0.95], c: [0.03, 0.08] }),
  },
  {
    group: "Styles",
    id: "vibrant",
    label: t("gallery.style.vibrant"),
    description: t("gallery.style.vibrantHint"),
    generate: rangePalette({ l: [0.55, 0.78], c: [0.16, 0.25], sorted: false }),
  },
  {
    group: "Styles",
    id: "neon",
    label: t("gallery.style.neon"),
    description: t("gallery.style.neonHint"),
    generate: (random) => [
      oklchColor(0.18, 0.03, between(random, 250, 300)),
      ...rangePalette({ l: [0.72, 0.88], c: [0.22, 0.32], sorted: false })(random).slice(0, 4),
    ],
  },
  {
    group: "Styles",
    id: "vintage",
    label: t("gallery.style.vintage"),
    description: t("gallery.style.vintageHint"),
    generate: rangePalette({
      l: [0.5, 0.85],
      c: [0.04, 0.1],
      hues: [
        [20, 100],
        [150, 200],
      ],
    }),
  },
  {
    group: "Styles",
    id: "retro",
    label: t("gallery.style.retro"),
    description: t("gallery.style.retroHint"),
    generate: mixPalette([
      [
        [0.85, 0.92],
        [0.05, 0.08],
        [80, 95],
      ],
      [
        [0.78, 0.84],
        [0.13, 0.17],
        [80, 95],
      ],
      [
        [0.65, 0.72],
        [0.15, 0.19],
        [40, 55],
      ],
      [
        [0.5, 0.6],
        [0.14, 0.18],
        [25, 35],
      ],
      [
        [0.45, 0.55],
        [0.06, 0.1],
        [190, 210],
      ],
    ]),
  },
  {
    group: "Styles",
    id: "gold",
    label: t("gallery.style.gold"),
    description: t("gallery.style.goldHint"),
    generate: (random) => [
      ...rangePalette({ l: [0.55, 0.9], c: [0.08, 0.14], hues: [[70, 92]] })(random).slice(0, 4),
      oklchColor(0.22, 0.02, between(random, 60, 260)),
    ],
  },
  {
    group: "Styles",
    id: "light",
    label: t("gallery.style.light"),
    description: t("gallery.style.lightHint"),
    generate: rangePalette({ l: [0.93, 0.985], c: [0.01, 0.04] }),
  },
  {
    group: "Styles",
    id: "dark",
    label: t("gallery.style.dark"),
    description: t("gallery.style.darkHint"),
    generate: rangePalette({ l: [0.15, 0.4], c: [0.02, 0.1], spread: 90 }),
  },
  {
    group: "Styles",
    id: "warm",
    label: t("gallery.style.warm"),
    description: t("gallery.style.warmHint"),
    generate: rangePalette({ l: [0.5, 0.9], c: [0.08, 0.2], hues: [[10, 95]] }),
  },
  {
    group: "Styles",
    id: "cold",
    label: t("gallery.style.cold"),
    description: t("gallery.style.coldHint"),
    generate: rangePalette({ l: [0.45, 0.92], c: [0.05, 0.16], hues: [[190, 290]] }),
  },
  {
    group: "Styles",
    id: "gradient",
    label: t("gallery.style.gradient"),
    description: t("gallery.style.gradientHint"),
    generate: gradientPalette,
  },
];
