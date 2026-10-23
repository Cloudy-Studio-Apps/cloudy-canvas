import { ExternalLink } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import type { LinkButtonProps } from "./about-dialog.types";
import { openLink } from "./open-link";

/** A quiet button that opens a web page in the browser. */
export function LinkButton({ href, icon: Icon, children }: LinkButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={() => openLink(href)}>
      {Icon && <Icon />}
      {children}
      <ExternalLink />
    </Button>
  );
}
