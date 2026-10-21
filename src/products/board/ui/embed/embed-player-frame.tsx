import { useLayoutEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { SiYoutube } from "react-icons/si";

import { embedLayout, embedOf } from "@board";
import { openExternal } from "@platform";
import { youtubeEmbedUrl, youtubeVideo } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/components/ui/button";
import { useBoardEngine } from "../board-engine-context";
import type { EmbedPlayerFrameProps } from "./embed-player-frame.types";

/**
 * The YouTube player over a card's picture. It's only created when the card's play button is
 * pressed, follows the card as the board pans, zooms or the card moves, and closes when the card
 * goes away.
 */
export function EmbedPlayerFrame({ elementId, onClose }: EmbedPlayerFrameProps) {
  const engine = useBoardEngine();
  const frameRef = useRef<HTMLDivElement>(null);
  const card = embedOf(engine.getElement(elementId));
  const url = card?.url ?? null;
  const video = useMemo(() => (url ? youtubeVideo(new URL(url)) : null), [url]);

  useLayoutEffect(() => {
    const place = () => {
      const el = embedOf(engine.getElement(elementId));
      const preview = el && embedLayout(el).preview;
      const frame = frameRef.current;
      if (!el || !preview) return onClose();
      if (!frame) return;
      const rect = engine.worldRectToScreen({
        x: el.x + preview.x,
        y: el.y + preview.y,
        w: preview.w,
        h: preview.h,
      });
      Object.assign(frame.style, {
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: `${rect.w}px`,
        height: `${rect.h}px`,
      });
    };
    place();
    return engine.onViewChange(place);
  }, [engine, elementId, onClose]);

  if (!card || !video) return null;

  const openOnYoutube = () =>
    void openExternal(card.url).catch((error: unknown) =>
      notifyError("The video couldn't be opened", error),
    );

  return (
    <div ref={frameRef} className="pointer-events-auto absolute top-0 left-0 z-20">
      <div className="absolute right-0 bottom-full mb-1.5 flex gap-1">
        <Button variant="secondary" size="sm" className="shadow-soft" onClick={openOnYoutube}>
          <SiYoutube />
          Open on YouTube
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="size-7 shadow-soft"
          aria-label="Close video"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      <iframe
        src={youtubeEmbedUrl(video)}
        title={card.title}
        className="size-full rounded-[4px] bg-black"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
