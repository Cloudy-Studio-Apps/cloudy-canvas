import type { RepeatSettings } from "../../repeat";
import type { RepeatRowsPatch } from "./repeat-rows-fields.types";

export interface LimitFieldsProps {
  repeat: Pick<RepeatSettings, "limit" | "designLimit">;
  apply: (patch: RepeatRowsPatch) => void;
  /** The design cap's label ("While designing, show" by default). */
  designLabel?: string;
  /** The design cap while unset (`DEFAULT_DESIGN_LIMIT` by default). */
  designDefault?: number;
}
