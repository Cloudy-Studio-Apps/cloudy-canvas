/** A big model waiting for the user to continue or cancel. */
export interface ModelSizeRequest {
  name: string;
  bytes: number;
  resolve: (proceed: boolean) => void;
}
