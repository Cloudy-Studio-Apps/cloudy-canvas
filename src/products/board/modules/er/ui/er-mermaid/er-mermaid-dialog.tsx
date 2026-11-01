import { tCommon } from "@shared/core";
import { Copy, Download } from "lucide-react";

import { clipboard, exportFile } from "@platform";
import { CodeEditor } from "@shared/ui/components/code-editor";
import { notifyError, toast } from "@shared/stores/toast-store";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/kit";
import { useErModel, useErVersion } from "../model";
import { useErMermaidStore } from "./er-mermaid-store";
import type { ErMermaidBodyProps } from "./er-mermaid.types";
import { t } from "../../er.i18n";

const NO_LANGUAGE: never[] = [];
const ignore = () => {};

/** The diagram as a Mermaid block for Markdown files, read-only, to copy or save as a `.md`. */
export function ErMermaidDialog() {
  const diagramId = useErMermaidStore((state) => state.diagramId);
  const close = useErMermaidStore((state) => state.close);
  return (
    <Dialog open={diagramId !== null} onOpenChange={(open) => !open && close()}>
      {diagramId !== null && <DialogBody key={diagramId} diagramId={diagramId} />}
    </Dialog>
  );
}

function DialogBody({ diagramId }: ErMermaidBodyProps) {
  const er = useErModel();
  useErVersion();
  const text = er.diagram(diagramId).mermaid();
  const label = er.diagrams().find((d) => d.id === diagramId)?.label ?? t("toTables.theDiagram");

  const copy = async () => {
    try {
      await clipboard.writeText(text);
      toast({ title: t("mermaid.copied") });
    } catch (error) {
      notifyError(t("mermaid.copyError"), error);
    }
  };

  const save = async () => {
    try {
      const file = new Blob([text], { type: "text/markdown" });
      const saved = await exportFile(file, label, {
        extension: "md",
        label: t("mermaid.fileType"),
      });
      if (saved) toast({ title: t("mermaid.saved") });
    } catch (error) {
      notifyError(t("mermaid.saveError"), error);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{t("mermaid.title", { label })}</DialogTitle>
        <DialogDescription>{t("mermaid.description")}</DialogDescription>
      </DialogHeader>
      <CodeEditor
        value={text}
        onChange={ignore}
        language={NO_LANGUAGE}
        label={t("mermaid.code")}
        readOnly
        className="h-80"
      />
      <DialogFooter>
        <Button variant="secondary" onClick={() => void save()}>
          <Download />
          {tCommon("save")}
        </Button>
        <Button onClick={() => void copy()}>
          <Copy />
          {t("mermaid.copy")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
