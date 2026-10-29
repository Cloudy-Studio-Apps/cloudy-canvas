export interface ViewerCodePanelProps {
  title: string;
  code: string;
  /** Shows everything instead (the whole schema); without it there's no "All code" button. */
  onAll?: () => void;
  onClose(): void;
}
