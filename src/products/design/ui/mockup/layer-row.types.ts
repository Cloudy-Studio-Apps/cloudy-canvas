import type { MockLayer } from "./mock-data.types";

export interface LayerRowProps {
  layer: MockLayer;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}
