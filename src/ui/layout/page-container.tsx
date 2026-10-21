import type { ComponentProps } from "react";

import { cn } from "@ui/lib/utils";

interface PageContainerProps extends ComponentProps<"div"> {
  as?: "div" | "main" | "header" | "section";
}

/** Centered max-width column with the app's page gutters. */
export function PageContainer({ as: Tag = "div", className, ...props }: PageContainerProps) {
  return <Tag className={cn("mx-auto w-full max-w-6xl px-6 sm:px-10", className)} {...props} />;
}
