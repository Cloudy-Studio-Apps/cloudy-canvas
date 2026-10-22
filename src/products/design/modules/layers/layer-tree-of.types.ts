/** A layer in `get_layer_tree`, with what it holds. */
export interface LayerTreeNode {
  id: string;
  type: string;
  name: string;
  hidden?: true;
  locked?: true;
  /** Topmost first; absent when it holds nothing. */
  children?: LayerTreeNode[];
}
