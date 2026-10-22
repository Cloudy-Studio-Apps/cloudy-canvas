import type { Size } from "@canvas";

import { FRAME_DEFAULTS } from "./frame.defaults";
import type { FramePreset, FramePresetGroup } from "./frame.types";

const preset = (id: string, group: string, label: string, w: number, h: number): FramePreset => ({
  id,
  group,
  label,
  size: { w, h },
});

/** The frame sizes the frame tool's sidebar and the frame section offer, by group. */
export const FRAME_PRESETS: readonly FramePreset[] = [
  preset("iphone-16", "Phone", "iPhone 16", 393, 852),
  preset("iphone-16-pro", "Phone", "iPhone 16 Pro", 402, 874),
  preset("iphone-16-pro-max", "Phone", "iPhone 16 Pro Max", 440, 956),
  preset("iphone-14-15", "Phone", "iPhone 14 & 15", 390, 844),
  preset("iphone-se", "Phone", "iPhone SE", 320, 568),
  preset("android-compact", "Phone", "Android Compact", 412, 917),
  preset("android-medium", "Phone", "Android Medium", 700, 840),
  preset("ipad-mini", "Tablet", "iPad mini 8.3", 744, 1133),
  preset("ipad-pro-11", "Tablet", 'iPad Pro 11"', 834, 1194),
  preset("ipad-pro-13", "Tablet", 'iPad Pro 12.9"', 1024, 1366),
  preset("surface-pro", "Tablet", "Surface Pro 8", 1440, 960),
  preset("android-expanded", "Tablet", "Android Expanded", 1280, 800),
  preset("macbook-air", "Desktop", "MacBook Air", 1280, 832),
  preset("macbook-pro-14", "Desktop", 'MacBook Pro 14"', 1512, 982),
  preset("macbook-pro-16", "Desktop", 'MacBook Pro 16"', 1728, 1117),
  preset("desktop", "Desktop", "Desktop", 1440, 1024),
  preset("wireframe", "Desktop", "Wireframe", 1440, 1024),
  preset("tv", "Desktop", "TV", 1280, 720),
  preset("slide-16-9", "Presentation", "Slide 16:9", 1920, 1080),
  preset("slide-4-3", "Presentation", "Slide 4:3", 1024, 768),
  preset("watch-41", "Watch", "Apple Watch 41mm", 176, 215),
  preset("watch-45", "Watch", "Apple Watch 45mm", 198, 242),
  preset("watch-49", "Watch", "Apple Watch Ultra", 205, 251),
  preset("a4", "Paper", "A4", 595, 842),
  preset("a5", "Paper", "A5", 420, 595),
  preset("a6", "Paper", "A6", 297, 420),
  preset("letter", "Paper", "Letter", 612, 792),
  preset("tabloid", "Paper", "Tabloid", 792, 1224),
  preset("x-post", "Social media", "X post", 1200, 675),
  preset("facebook-post", "Social media", "Facebook post", 1200, 630),
  preset("instagram-post", "Social media", "Instagram post", 1080, 1350),
  preset("instagram-story", "Social media", "Instagram story", 1080, 1920),
  preset("linkedin-post", "Social media", "LinkedIn post", 1200, 627),
  preset("youtube-thumbnail", "Social media", "YouTube thumbnail", 1280, 720),
];

/** The presets' groups, in order, each with its presets. */
export const FRAME_PRESET_GROUPS: readonly FramePresetGroup[] = [
  ...new Set(FRAME_PRESETS.map((item) => item.group)),
].map((group) => ({ group, presets: FRAME_PRESETS.filter((item) => item.group === group) }));

/** The size a click with the frame tool places for a preset id (a small square for unknown ids). */
export function presetSize(id: string): Size {
  return FRAME_PRESETS.find((item) => item.id === id)?.size ?? FRAME_DEFAULTS.size;
}
