import type { LibrarySummary } from "./library-summary.types";

export interface LibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  library: LibrarySummary;
}

export interface NewLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface LibraryMenuProps {
  library: LibrarySummary;
}
