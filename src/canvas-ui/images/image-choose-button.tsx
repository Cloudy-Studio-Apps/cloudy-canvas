import { ImagePlus } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useEngine } from "../engine-context";
import { chooseImageAsset } from "./choose-image-asset";
import type { ImageChooseButtonProps } from "./image-choose-button.types";

/** A button that asks for a picture, adds it to the document and hands over its asset id. */
export function ImageChooseButton({
  onChoose,
  replace = false,
  title = "Choose an image",
  ...props
}: ImageChooseButtonProps) {
  const engine = useEngine();
  const choose = async () => {
    const assetId = await chooseImageAsset(engine, { title });
    if (assetId) onChoose(assetId);
  };
  return (
    <Button {...props} onClick={() => void choose()}>
      <ImagePlus />
      {replace ? "Replace image…" : "Choose image…"}
    </Button>
  );
}
