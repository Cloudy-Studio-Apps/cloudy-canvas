import {
  stickerCatalog,
  stickerSvg,
  svgDataUrl,
  type StickerDef,
  type StickerGroup,
} from "@shared/core";
import type {
  PluginSticker,
  PluginStickerGroup,
  PluginStickerStage,
} from "./plugin-stickers.types";

/**
 * `api.stickers` for one plugin. Calls are checked right away (so the plugin sees its mistakes
 * in `activate`) and kept until `commit`, which runs only when `activate` succeeds.
 */
export function createPluginStickers(pluginId: string): PluginStickerStage {
  const groups: StickerGroup[] = [];
  const sets: { groupId: string; stickers: StickerDef[] }[] = [];
  const names = new Set<string>();

  return {
    api: {
      registerGroup: (group) => groups.push(readGroup(group)),
      registerSet: (groupId, stickers) => {
        if (typeof groupId !== "string" || !groupId) {
          throw new Error("registerSet needs the id of a sticker group.");
        }
        if (!Array.isArray(stickers)) throw new Error("registerSet needs a list of stickers.");
        sets.push({ groupId, stickers: stickers.map((s) => readSticker(pluginId, s, names)) });
      },
      stickerSvg: (art, defs) => stickerSvg(art, defs),
    },
    commit: () => {
      try {
        for (const group of groups) stickerCatalog.registerGroup(group, pluginId);
        for (const set of sets) stickerCatalog.registerSet(set.groupId, set.stickers, pluginId);
      } catch (error) {
        stickerCatalog.drop(pluginId);
        throw error;
      }
      return sets.reduce((count, set) => count + set.stickers.length, 0);
    },
  };
}

function readGroup(group: PluginStickerGroup): StickerGroup {
  if (typeof group?.id !== "string" || !group.id) throw new Error("A sticker group needs an id.");
  if (typeof group.label !== "string") throw new Error(`The group "${group.id}" needs a label.`);
  if (typeof group.order !== "number") throw new Error(`The group "${group.id}" needs an order.`);
  if (group.tab !== undefined && group.tab !== "stickers" && group.tab !== "emojis") {
    throw new Error(`The group "${group.id}" has an unknown tab "${String(group.tab)}".`);
  }
  return {
    id: group.id,
    label: group.label,
    description: group.description,
    order: group.order,
    tab: group.tab,
  };
}

function readSticker(pluginId: string, sticker: PluginSticker, names: Set<string>): StickerDef {
  const { name, label } = sticker ?? {};
  if (typeof name !== "string" || !/^[a-z0-9-]+$/.test(name)) {
    throw new Error("A sticker's name must be lowercase letters, digits and dashes.");
  }
  if (names.has(name)) throw new Error(`The sticker "${name}" is registered twice.`);
  if (typeof label !== "string") throw new Error(`The sticker "${name}" needs a label.`);
  names.add(name);
  const base = {
    id: `plugin:${pluginId}:${name}`,
    label,
    keywords: Array.isArray(sticker.keywords) ? sticker.keywords.map(String) : [],
  };
  if (typeof sticker.art === "string") {
    const { art, defs = "" } = sticker;
    return {
      ...base,
      url: svgDataUrl(stickerSvg(art, defs)),
      restyle: (look) => stickerSvg(art, defs, look),
    };
  }
  if (typeof sticker.svg === "string") return { ...base, url: svgDataUrl(sticker.svg) };
  if (sticker.data instanceof Uint8Array) {
    const blob = new Blob([sticker.data as Uint8Array<ArrayBuffer>], {
      type: sticker.type ?? "image/png",
    });
    return { ...base, url: URL.createObjectURL(blob) };
  }
  if (typeof sticker.url === "string") return { ...base, url: sticker.url };
  throw new Error(`The sticker "${name}" needs its picture: art, svg, data or url.`);
}
