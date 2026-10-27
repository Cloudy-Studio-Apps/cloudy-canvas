import type { CreateTilesProps } from "./create-tiles.types";
import type { OpenFileTileProps } from "./open-file-tile.types";

export interface WelcomeProps {
  onCreate: CreateTilesProps["onCreate"];
  onOpenFile: OpenFileTileProps["onOpenFile"];
}
