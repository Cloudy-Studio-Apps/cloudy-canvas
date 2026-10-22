import { Square, SquareDashed } from "lucide-react";

import { IMAGE_BACKGROUND_COLOR, IMAGE_DEFAULTS } from "@board";
import { FloatingPanel, OptionButton, PanelDivider } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";

/** Background (transparent or white) and padding of the selected images. */
export function ImageOptions() {
  const engine = useBoardEngine();
  const { imageBackground, imagePadding } = useBoardState((state) => state.options);

  return (
    <FloatingPanel role="group" aria-label="Image options" className="gap-1 px-2">
      <OptionButton
        aria-label="Transparent background"
        title="Transparent background"
        selected={imageBackground === "none"}
        onClick={() => engine.setToolOptions({ imageBackground: "none" })}
      >
        <SquareDashed className="size-[18px]" />
      </OptionButton>
      <OptionButton
        aria-label="White background"
        title="White background"
        selected={imageBackground === "white"}
        onClick={() => engine.setToolOptions({ imageBackground: "white" })}
      >
        <Square className="size-[18px]" style={{ fill: IMAGE_BACKGROUND_COLOR }} />
      </OptionButton>
      <PanelDivider />
      {IMAGE_DEFAULTS.paddings.map(({ name, value }) => (
        <OptionButton
          key={value}
          aria-label={`${name} padding`}
          title={`${name} padding`}
          selected={imagePadding === value}
          onClick={() => engine.setToolOptions({ imagePadding: value })}
        >
          <span className="text-xs leading-none tabular-nums">{value}</span>
        </OptionButton>
      ))}
    </FloatingPanel>
  );
}
