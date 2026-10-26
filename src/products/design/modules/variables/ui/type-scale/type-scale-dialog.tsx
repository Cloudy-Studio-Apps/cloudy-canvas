import { useState } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast } from "@shared/stores/toast-store";
import { AppDialog, Button } from "@shared/ui/kit";
import { createTypeScale, DEFAULT_TYPE_SCALE } from "../../type-scale";
import type { TypeScaleSettings } from "../../type-scale";
import { TypeScaleForm } from "./type-scale-form";
import { TypeScalePreview } from "./type-scale-preview";
import type { TypeScaleDialogProps } from "./type-scale-ui.types";

/** The collection a new type scale goes in when the file has none ("Typography" is made then). */
const NEW_COLLECTION = "Typography";

/**
 * Makes a type scale: text styles from a base size and a ratio, their sizes number variables
 * that keep them linked (edit the scale and every style and text follows). Mount it only while
 * it's open, so each opening starts from the file as it is.
 */
export function TypeScaleDialog({ open, onOpenChange }: TypeScaleDialogProps) {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  // Made fresh each time it opens (the host mounts it only while open), from the file as it is.
  const [settings, setSettings] = useState<TypeScaleSettings>(() => {
    const font = store
      .variables()
      .find((v) => v.type === "string" && v.scopes.includes("font-family"));
    return {
      ...DEFAULT_TYPE_SCALE,
      collection: store.collections()[0]?.id ?? "",
      font: font ? { variable: font.id } : { name: "Inter" },
    };
  });
  const current = settings;

  const create = () => {
    try {
      const tokens = engine.service(DOCUMENT_TOKENS);
      const collection = current.collection || tokens.createCollection(NEW_COLLECTION).id;
      const made = createTypeScale(engine.doc, tokens, { ...current, collection });
      toast({ title: `Made ${made.styles.length} text styles` });
      onOpenChange(false);
    } catch (error) {
      notifyError("The type scale couldn't be made", error);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Type scale"
      description="Text styles from a base size and a ratio. Their sizes are variables, so changing the scale later resizes every style and every text using one."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={create}>Create styles</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TypeScaleForm settings={current} onChange={setSettings} />
        <TypeScalePreview settings={current} />
      </div>
    </AppDialog>
  );
}
