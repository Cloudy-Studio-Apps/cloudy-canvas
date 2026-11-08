import { useDesignEngine } from "@design/ui/design-engine-context";
import { useProjectLibrariesState } from "@canvas-ui";
import { notifyError } from "@shared/stores/toast-store";
import { placeImage } from "../../image";
import type { AssetActions, AssetRef } from "./assets-ui.types";
import { t } from "../assets.i18n";

/**
 * What the tab does with a picture: reads its bytes and places it on the canvas as one undo step.
 * A library's picture is stored in the file under its own id as it is placed, so the file works
 * alone (the library mirror finds it there and skips it).
 */
export function useAssetActions(): AssetActions {
  const engine = useDesignEngine();
  const { hub } = useProjectLibrariesState();

  const bytesOf = async ({ source, asset }: AssetRef): Promise<Uint8Array> => {
    const own = engine.doc.getAsset(asset.id);
    if (own) return own;
    if (source.libraryId === null || !hub) throw new Error(`No bytes for the picture ${asset.id}`);
    return hub.readAssetBytes(source.libraryId, asset.id);
  };

  const place: AssetActions["place"] = async (ref, at) => {
    try {
      const bytes = await bytesOf(ref);
      const { id, width, height } = ref.asset;
      placeImage(engine, { assetId: id, bytes, width, height }, at);
    } catch (error) {
      notifyError(t("error.place"), error);
    }
  };
  return { place, bytesOf };
}
