import type { ExportDestination } from "@platform";

export interface ExportDestinationState {
  destination: ExportDestination;
  setDestination(destination: ExportDestination): void;
}
