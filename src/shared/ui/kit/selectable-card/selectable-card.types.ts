import type * as React from "react";

export interface SelectableCardProps extends Omit<
  React.ComponentProps<"button">,
  "children" | "onSelect" | "title"
> {
  selected?: boolean;
  onSelect?: () => void;
  /** A picture above the text (a preview, an illustration). */
  media?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A tag beside the title ("Plugin", "Beta"). */
  badge?: React.ReactNode;
  /** Shown disabled with a "Coming soon" tag. */
  comingSoon?: boolean;
}
