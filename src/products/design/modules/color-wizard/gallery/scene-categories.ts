import { between, oklchColor } from "../color";
import type { GalleryCategory } from "./gallery.types";
import { mixPalette, rainbowPalette, rangePalette } from "./recipes";
import { t } from "../color-wizard.i18n";

/** Palettes of places and times: sunset, sky, sea, nature, earth, night, space, rainbow. */
export const SCENE_CATEGORIES: readonly GalleryCategory[] = [
  {
    group: "Themes",
    id: "sunset",
    label: t("gallery.scene.sunset"),
    description: t("gallery.scene.sunsetHint"),
    generate: mixPalette([
      [
        [0.85, 0.9],
        [0.08, 0.12],
        [65, 80],
      ],
      [
        [0.72, 0.78],
        [0.14, 0.18],
        [35, 50],
      ],
      [
        [0.6, 0.66],
        [0.18, 0.22],
        [20, 30],
      ],
      [
        [0.45, 0.52],
        [0.12, 0.16],
        [320, 340],
      ],
      [
        [0.25, 0.32],
        [0.08, 0.12],
        [285, 300],
      ],
    ]),
  },
  {
    group: "Themes",
    id: "sky",
    label: t("gallery.scene.sky"),
    description: t("gallery.scene.skyHint"),
    generate: rangePalette({ l: [0.6, 0.97], c: [0.02, 0.13], hues: [[220, 250]] }),
  },
  {
    group: "Themes",
    id: "sea",
    label: t("gallery.scene.sea"),
    description: t("gallery.scene.seaHint"),
    generate: rangePalette({ l: [0.3, 0.9], c: [0.05, 0.14], hues: [[180, 240]] }),
  },
  {
    group: "Themes",
    id: "nature",
    label: t("gallery.scene.nature"),
    description: t("gallery.scene.natureHint"),
    generate: mixPalette([
      [
        [0.88, 0.94],
        [0.04, 0.07],
        [100, 125],
      ],
      [
        [0.7, 0.78],
        [0.1, 0.14],
        [125, 145],
      ],
      [
        [0.5, 0.58],
        [0.1, 0.13],
        [140, 155],
      ],
      [
        [0.35, 0.42],
        [0.06, 0.09],
        [145, 165],
      ],
      [
        [0.4, 0.48],
        [0.05, 0.08],
        [50, 65],
      ],
    ]),
  },
  {
    group: "Themes",
    id: "earth",
    label: t("gallery.scene.earth"),
    description: t("gallery.scene.earthHint"),
    generate: rangePalette({ l: [0.35, 0.88], c: [0.03, 0.09], hues: [[40, 75]] }),
  },
  {
    group: "Themes",
    id: "night",
    label: t("gallery.scene.night"),
    description: t("gallery.scene.nightHint"),
    generate: (random) => [
      ...rangePalette({ l: [0.15, 0.4], c: [0.04, 0.1], hues: [[250, 290]] })(random).slice(0, 4),
      oklchColor(0.85, 0.12, between(random, 80, 95)),
    ],
  },
  {
    group: "Themes",
    id: "space",
    label: t("gallery.scene.space"),
    description: t("gallery.scene.spaceHint"),
    generate: mixPalette([
      [
        [0.12, 0.18],
        [0.02, 0.04],
        [270, 290],
      ],
      [
        [0.3, 0.38],
        [0.12, 0.16],
        [290, 310],
      ],
      [
        [0.55, 0.62],
        [0.2, 0.25],
        [320, 345],
      ],
      [
        [0.7, 0.78],
        [0.12, 0.16],
        [200, 220],
      ],
      [
        [0.92, 0.97],
        [0.02, 0.05],
        [260, 280],
      ],
    ]),
  },
  {
    group: "Themes",
    id: "rainbow",
    label: t("gallery.scene.rainbow"),
    description: t("gallery.scene.rainbowHint"),
    generate: rainbowPalette,
  },
];
