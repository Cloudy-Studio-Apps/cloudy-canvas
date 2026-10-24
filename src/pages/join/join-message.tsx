import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

import { HoppingSeal } from "@shared/ui/brand/hopping-seal";
import { Button } from "@shared/ui/components/ui/button";
import type { JoinMessageProps } from "./join-page.types";

/** A centered message while joining (or when it can't), with a way back home. */
export function JoinMessage({ title, description, busy = false }: JoinMessageProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      {busy && <HoppingSeal size={80} />}
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      </div>
      <Button variant="outline" asChild>
        <Link to="/">
          <ArrowLeft />
          {busy ? "Cancel" : "Back to home"}
        </Link>
      </Button>
    </div>
  );
}
