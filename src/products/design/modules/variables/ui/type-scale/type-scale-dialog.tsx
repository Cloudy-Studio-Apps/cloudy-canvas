import { useState } from "react";

import { DOCUMENT_TOKENS } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast } from "@shared/stores/toast-store";
import { tCommon } from "@shared/core";
import { AppDialog, Button } from "@shared/ui/kit";
import { createTypeScale, DEFAULT_TYPE_SCALE } from "../../type-scale";
import type { TypeScaleSettings } from "../../type-scale";
import { TypeScaleForm } from "./type-scale-form";
import { TypeScalePreview } from "./type-scale-preview";
import type { TypeScaleDialogProps } from "./type-scale-ui.types";
import { t } from "../../variables.i18n";

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
      toast({ title: t("typeScale.made", { count: made.styles.length }) });
      onOpenChange(false);
    } catch (error) {
      notifyError(t("typeScale.error"), error);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("typeScale.title")}
      description={t("typeScale.description")}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={create}>{t("typeScale.create")}</Button>
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
