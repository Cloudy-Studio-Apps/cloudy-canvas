import { Unlink } from "lucide-react";
import { useState } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { countedUse } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { AppDialog, Button } from "@shared/ui/kit";
import type { TokenUsageProps } from "./token-usage.types";
import { useTokenUsage } from "./use-token-usage";

/** Detach everywhere: every layer stops using this token and keeps what it shows; the token stays. */
export function DetachEverywhere({ id }: TokenUsageProps) {
  const engine = useDesignEngine();
  const usage = useTokenUsage(id);
  const [asking, setAsking] = useState(false);
  if (usage.layerCount === 0 && usage.styles.length === 0) return null;
  return (
    <>
      <Button variant="outline" size="xs" onClick={() => setAsking(true)}>
        <Unlink /> Detach everywhere
      </Button>
      <AppDialog
        open={asking}
        onOpenChange={setAsking}
        title="Detach everywhere?"
        description={`${usage.layerCount} layers and ${usage.styles.length} styles stop using it and keep their look. It stays in the file.`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setAsking(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                engine.service(DOCUMENT_TOKENS).detachTokens([id], countedUse(engine.doc));
                setAsking(false);
              }}
            >
              Detach
            </Button>
          </>
        }
      />
    </>
  );
}
