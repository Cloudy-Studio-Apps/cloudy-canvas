/** Files in the chosen folder that saving would replace, waiting for the user's answer. */
export interface OverwriteRequest {
  existing: string[];
  resolve: (replace: boolean) => void;
}
