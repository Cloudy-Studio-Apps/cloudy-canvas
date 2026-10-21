import { useEffect, useState } from "react";

import type { StickerSection } from "@board";
import { notifyError } from "@shared/stores/toast-store";

let sections: readonly StickerSection[] | null = null;
let pending: Promise<readonly StickerSection[]> | null = null;

/** Loads the emoji catalog (its own chunk) once. */
function loadEmojiSections(): Promise<readonly StickerSection[]> {
  pending ??= import("@board/stickers/emoji").then((module) => {
    sections = module.EMOJI_SECTIONS;
    return sections;
  });
  return pending;
}

/** The emoji sections once loaded (`null` before, or while `enabled` is false). */
export function useEmojiSections(enabled = true): readonly StickerSection[] | null {
  const [loaded, setLoaded] = useState(sections);

  useEffect(() => {
    if (!enabled || loaded) return;
    let live = true;
    loadEmojiSections().then(
      (result) => live && setLoaded(result),
      (error: unknown) => {
        pending = null;
        notifyError("Couldn't load the emojis", error);
      },
    );
    return () => {
      live = false;
    };
  }, [enabled, loaded]);

  return enabled ? loaded : null;
}
