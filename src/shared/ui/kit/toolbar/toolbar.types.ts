import type * as React from "react";

export interface ToolbarProps extends React.ComponentProps<"div"> {
  /** Its name for screen readers. */
  label: string;
}

export type ToolbarGroupProps = React.ComponentProps<"div">;
