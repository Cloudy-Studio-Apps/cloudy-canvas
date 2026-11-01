export interface ErMermaidState {
  /** The diagram the dialog shows, or `null` while it's closed. */
  diagramId: string | null;
  open: (diagramId: string) => void;
  close: () => void;
}

export interface ErMermaidBodyProps {
  diagramId: string;
}
