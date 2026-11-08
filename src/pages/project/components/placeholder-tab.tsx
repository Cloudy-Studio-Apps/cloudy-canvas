import { EmptyState } from "@shared/ui/kit";
import type { PlaceholderTabProps } from "./placeholder-tab.types";

/** A tab whose content comes later: libraries and trash. */
export function PlaceholderTab({ title, description }: PlaceholderTabProps) {
  return <EmptyState title={title} description={description} className="mx-auto max-w-md py-16" />;
}
