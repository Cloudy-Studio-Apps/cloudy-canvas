import type { HomeFileKind } from "../file-kind.types";

export interface FileKindIconProps {
  kind: HomeFileKind;
  size?: "sm" | "md" | "lg";
  className?: string;
}
