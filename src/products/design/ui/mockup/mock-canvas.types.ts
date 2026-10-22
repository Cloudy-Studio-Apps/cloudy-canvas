import type { MockFrame } from "./mock-data.types";

export interface MockCanvasProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export interface MockFrameViewProps {
  frame: MockFrame;
  selected: boolean;
  onSelect: (id: string) => void;
}
