export interface ProductsState {
  /** Both products' code has loaded, so their modules can be read. */
  ready: boolean;
  setReady: () => void;
}
