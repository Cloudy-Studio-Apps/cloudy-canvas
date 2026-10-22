export interface LayerNameProps {
  name: string;
  editing: boolean;
  onRename: (name: string) => void;
  onDone: () => void;
}
