import { AssetsBody } from "./assets-body";
import { ColorsBody } from "./colors-body";
import { EffectsBody } from "./effects-body";
import type { KindBodyProps } from "./kind-body.types";
import { TextStylesBody } from "./text-styles-body";
import { t } from "../project.i18n";

/** What one library holds of one kind. */
export function KindBody({ kind, library }: KindBodyProps) {
  switch (kind) {
    case "colors":
      return <ColorsBody library={library} />;
    case "text":
      return <TextStylesBody styles={library.textStyles} />;
    case "images":
      return <AssetsBody library={library} assets={library.images} kind="images" />;
    case "svg":
      return <AssetsBody library={library} assets={library.svgs} kind="svg" />;
    case "effects":
      return <EffectsBody styles={library.effects} />;
    case "components":
      return <p className="text-sm text-muted-foreground">{t("libraries.empty.components")}</p>;
  }
}
