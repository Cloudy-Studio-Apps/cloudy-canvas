import { ImagePlus } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useEngine } from "../engine-context";
import { chooseImageAsset } from "./choose-image-asset";
import type { ImageChooseButtonProps } from "./image-choose-button.types";
import { t } from "./images.i18n";

/** A button that asks for a picture, adds it to the document and hands over its asset id. */
export function ImageChooseButton({
  onChoose,
  replace = false,
  title = t("chooseTitle"),
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
      {replace ? t("replace") : t("choose")}
    </Button>
  );
}
