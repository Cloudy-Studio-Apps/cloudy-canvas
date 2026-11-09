import { useEffect, useState } from "react";

import { DeviceFrame } from "./device-frame";
import { fitScale } from "./fit-scale";
import { PlayerOverlay } from "./player-overlay";
import type { PlayerStageProps } from "./player-stage.types";
import { PlayerSurfaceView } from "./player-surface";
import { useElementSize } from "./use-element-size";
import { useTriggers } from "./use-triggers";

/**
 * The stage: the device, scaled to fit (at most 2.4×), round a layer at the device's size in world
 * units. In it, bottom to top: where an old screen plays its way out, the screen and the overlays.
 */
export function PlayerStage({
  flow,
  run,
  surfaces,
  device,
  address,
  pictures,
  hints,
  onMiss,
}: PlayerStageProps) {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const size = useElementSize(stage);
  const scale = size ? fitScale(size, device, flow.platform) : 0;
  // Sharp on this screen, in steps of ½ so a resize doesn't draw every screen again each pixel.
  const pictureScale = Math.ceil(scale * window.devicePixelRatio * 2) / 2;
  useEffect(() => run.setScale(pictureScale), [run, pictureScale]);
  useTriggers({ run, box, surfaces, scale, onMiss });

  return (
    <div ref={setStage} className="relative grid min-h-0 flex-1 place-items-center overflow-hidden">
      {scale > 0 && (
        <DeviceFrame
          flow={flow}
          address={address}
          width={device.w * scale}
          height={device.h * scale}
        >
          <div
            ref={setBox}
            className="absolute top-0 left-0 origin-top-left"
            style={{ width: device.w, height: device.h, transform: `scale(${scale})` }}
          >
            <div ref={(el) => run.setGhost(el)} className="absolute inset-0" />
            {surfaces.base && (
              <PlayerSurfaceView
                key={surfaces.base.key}
                ref={(el) => run.setBase(el)}
                surface={surfaces.base}
                pictures={pictures}
                scale={pictureScale}
                hints={hints}
              />
            )}
            {surfaces.overlays.map((surface) => (
              <PlayerOverlay
                key={surface.key}
                surface={surface}
                run={run}
                pictures={pictures}
                scale={pictureScale}
                hints={hints}
              />
            ))}
          </div>
        </DeviceFrame>
      )}
    </div>
  );
}
