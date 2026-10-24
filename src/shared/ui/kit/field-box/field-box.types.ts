import type * as React from "react";

export interface FieldBoxProps {
  children: React.ReactNode;
  className?: string;
  invalid?: boolean;
  title?: string;
}
