import type { OverwriteRequest } from "./use-save-code.types";

export interface OverwriteDialogProps {
  request: OverwriteRequest | null;
  onAnswer: (replace: boolean) => void;
}
