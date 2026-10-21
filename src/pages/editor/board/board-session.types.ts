import type { FileInfo } from "@core";
import type { CanvasEngine } from "@engine";

export interface BoardSessionProps {
  id: string;
  engine: CanvasEngine;
  info: FileInfo | null;
}
