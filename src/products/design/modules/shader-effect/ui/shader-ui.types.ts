import type { ColorChangeInfo } from "@canvas-ui";

import type { ShaderParam } from "../shader-params.types";

export interface ShaderParamFieldProps {
  param: ShaderParam;
  value: number[];
  onChange: (value: number[], info: ColorChangeInfo) => void;
}
