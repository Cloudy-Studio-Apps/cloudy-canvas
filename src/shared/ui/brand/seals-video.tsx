import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@shared/ui/hooks/use-prefers-reduced-motion";
import { cn } from "@shared/ui/lib/utils";
import posterUrl from "./seals-hopping-poster.jpg";
import videoUrl from "./seals-hopping.mp4";
import type { SealsVideoProps } from "./seals-video.types";

// The mascot's clip: a crowd of "focas watonas" hopping down a road. Silent, looped and
// decorative; the poster frame shows until it plays.

export function SealsVideo({ playing, preload = "none", className }: SealsVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const play = playing && !reducedMotion;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // Autoplay can be refused (a muted clip rarely is); the poster stays then.
    if (play) video.play().catch(() => {});
    else video.pause();
  }, [play]);

  return (
    <video
      ref={ref}
      src={videoUrl}
      poster={posterUrl}
      preload={preload}
      muted
      loop
      playsInline
      disablePictureInPicture
      aria-hidden="true"
      className={cn("size-full object-cover", className)}
    />
  );
}
