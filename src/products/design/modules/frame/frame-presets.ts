import type { Size } from "@canvas";

import { FRAME_DEFAULTS } from "./frame.defaults";
import type { FramePreset, FramePresetGroup } from "./frame.types";
import { t } from "./frame.i18n";

const preset = (id: string, group: string, label: string, w: number, h: number): FramePreset => ({
  id,
  group,
  label,
  size: { w, h },
});

/** The frame sizes the frame tool's sidebar and the frame section offer, by group. */
export const FRAME_PRESETS: readonly FramePreset[] = [
  preset("iphone-16", t("presets.groups.phone"), "iPhone 16", 393, 852),
  preset("iphone-16-pro", t("presets.groups.phone"), "iPhone 16 Pro", 402, 874),
  preset("iphone-16-pro-max", t("presets.groups.phone"), "iPhone 16 Pro Max", 440, 956),
  preset("iphone-14-15", t("presets.groups.phone"), "iPhone 14 & 15", 390, 844),
  preset("iphone-se", t("presets.groups.phone"), "iPhone SE", 320, 568),
  preset("android-compact", t("presets.groups.phone"), "Android Compact", 412, 917),
  preset("android-medium", t("presets.groups.phone"), "Android Medium", 700, 840),
  preset("ipad-mini", t("presets.groups.tablet"), "iPad mini 8.3", 744, 1133),
  preset("ipad-pro-11", t("presets.groups.tablet"), 'iPad Pro 11"', 834, 1194),
  preset("ipad-pro-13", t("presets.groups.tablet"), 'iPad Pro 12.9"', 1024, 1366),
  preset("surface-pro", t("presets.groups.tablet"), "Surface Pro 8", 1440, 960),
  preset("android-expanded", t("presets.groups.tablet"), "Android Expanded", 1280, 800),
  preset("macbook-air", t("presets.groups.desktop"), "MacBook Air", 1280, 832),
  preset("macbook-pro-14", t("presets.groups.desktop"), 'MacBook Pro 14"', 1512, 982),
  preset("macbook-pro-16", t("presets.groups.desktop"), 'MacBook Pro 16"', 1728, 1117),
  preset("desktop", t("presets.groups.desktop"), "Desktop", 1440, 1024),
  preset("wireframe", t("presets.groups.desktop"), "Wireframe", 1440, 1024),
  preset("tv", t("presets.groups.desktop"), "TV", 1280, 720),
  preset("slide-16-9", t("presets.groups.presentation"), t("presets.slide169"), 1920, 1080),
  preset("slide-4-3", t("presets.groups.presentation"), t("presets.slide43"), 1024, 768),
  preset("watch-41", t("presets.groups.watch"), "Apple Watch 41mm", 176, 215),
  preset("watch-45", t("presets.groups.watch"), "Apple Watch 45mm", 198, 242),
  preset("watch-49", t("presets.groups.watch"), "Apple Watch Ultra", 205, 251),
  preset("a4", t("presets.groups.paper"), "A4", 595, 842),
  preset("a5", t("presets.groups.paper"), "A5", 420, 595),
  preset("a6", t("presets.groups.paper"), "A6", 297, 420),
  preset("letter", t("presets.groups.paper"), "Letter", 612, 792),
  preset("tabloid", t("presets.groups.paper"), "Tabloid", 792, 1224),
  preset("x-post", t("presets.groups.social"), t("presets.xPost"), 1200, 675),
  preset("facebook-post", t("presets.groups.social"), t("presets.facebookPost"), 1200, 630),
  preset("instagram-post", t("presets.groups.social"), t("presets.instagramPost"), 1080, 1350),
  preset("instagram-story", t("presets.groups.social"), t("presets.instagramStory"), 1080, 1920),
  preset("linkedin-post", t("presets.groups.social"), t("presets.linkedinPost"), 1200, 627),
  preset("youtube-thumbnail", t("presets.groups.social"), t("presets.youtubeThumbnail"), 1280, 720),
];

/** The presets' groups, in order, each with its presets. */
export const FRAME_PRESET_GROUPS: readonly FramePresetGroup[] = [
  ...new Set(FRAME_PRESETS.map((item) => item.group)),
].map((group) => ({ group, presets: FRAME_PRESETS.filter((item) => item.group === group) }));

/** The preset with this id, if there's one. */
export function findPreset(id: string): FramePreset | undefined {
  return FRAME_PRESETS.find((item) => item.id === id);
}

/** The size a click with the frame tool places for a preset id (a small square for unknown ids). */
export function presetSize(id: string): Size {
  return findPreset(id)?.size ?? FRAME_DEFAULTS.size;
}
