import type { CreateTilesProps } from "./create-tiles.types";

export interface CreateColumnProps {
  onCreate: CreateTilesProps["onCreate"];
  onOpenFile: () => void;
}
