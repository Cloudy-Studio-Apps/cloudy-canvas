import type { BindDataPatch } from "../../bindings";

/** Applies a data edit to the layer, reporting a refusal. */
export type ApplyBindData = (patch: BindDataPatch) => void;
