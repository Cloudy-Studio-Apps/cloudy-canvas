import { Unlink } from "lucide-react";
import { useState } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { countedUse } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { AppDialog, Button } from "@shared/ui/kit";
import { tCommon } from "@shared/core";
import type { TokenUsageProps } from "./token-usage.types";
import { useTokenUsage } from "./use-token-usage";
import { t } from "../../design-ui.i18n";

/** Detach everywhere: every layer stops using this token and keeps what it shows; the token stays. */
export function DetachEverywhere({ id }: TokenUsageProps) {
  const engine = useDesignEngine();
  const usage = useTokenUsage(id);
  const [asking, setAsking] = useState(false);
  if (usage.layerCount === 0 && usage.styles.length === 0) return null;
  return (
    <>
      <Button variant="outline" size="xs" onClick={() => setAsking(true)}>
        <Unlink /> {t("tokenUsage.detach.button")}
      </Button>
      <AppDialog
        open={asking}
        onOpenChange={setAsking}
        title={t("tokenUsage.detach.title")}
        description={t("tokenUsage.detach.description", {
          layers: usage.layerCount,
          styles: usage.styles.length,
        })}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setAsking(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() => {
                engine.service(DOCUMENT_TOKENS).detachTokens([id], countedUse(engine.doc));
                setAsking(false);
              }}
            >
              {t("tokenUsage.detach.confirm")}
            </Button>
          </>
        }
      />
    </>
  );
}
