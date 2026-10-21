import type { FileInfo } from "@shared/core";
import type { BoardEngine } from "@board";

export interface BoardSessionProps {
  id: string;
  engine: BoardEngine;
  info: FileInfo | null;
}
