import type { VariantPick } from "./variants";

export interface VariantsChooseArgs {
  ids: string[];
  labels?: string[];
  question?: string;
}

/** What the variant tools reach: the agent's tab and the app's pending choices. */
export interface VariantsAgentHost {
  /** Shows the chooser over the agent's tab; `null` when the user hasn't picked within the wait. */
  chooseVariants(args: VariantsChooseArgs): Promise<VariantPick | null>;
  variantChoice(): VariantPick | "pending" | null;
}
