import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

import { readTokenSource } from "../../exchange";
import { DOCUMENT_TOKENS, TokenStore } from "@canvas";
import { useDocumentMeta } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { exportFile, pickTokenFile } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@shared/ui/kit";

import type { ImportSource } from "./exchange.types";
import { ImportTokensDialog } from "./import-tokens-dialog";
import { useTokenFormats } from "./use-token-formats";

/** The Variables window's Import… (a design or tokens JSON) and Export ▸ (each format). */
export function ExchangeMenu() {
  const engine = useDesignEngine();
  const { title } = useDocumentMeta(engine.doc);
  const formats = useTokenFormats();
  const [source, setSource] = useState<ImportSource | null>(null);

  const importFile = async () => {
    try {
      const file = await pickTokenFile();
      if (!file) return;
      setSource({ name: file.name, ...readTokenSource(file.bytes, formats, engine.kinds) });
    } catch (error) {
      notifyError("Couldn't read that file", error);
    }
  };
  const exportAs = async (id: string) => {
    const format = formats.find((f) => f.id === id);
    if (!format?.write) return;
    try {
      const name = title.trim() || "Design tokens";
      const text = format.write(TokenStore.of(engine.doc), name);
      const saved = await exportFile(new Blob([text], { type: "text/plain" }), fileName(name), {
        extension: format.extension,
        label: format.fileLabel,
      });
      if (saved) toast({ title: `Exported as ${format.label}` });
    } catch (error) {
      notifyError("Couldn't export the variables", error);
    }
  };
  const empty = engine.service(DOCUMENT_TOKENS).store().isEmpty;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" onPointerDown={(e) => e.stopPropagation()}>
            <ArrowDownUp className="size-3.5" /> Import / Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onPointerDown={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={() => void importFile()}>
            Import from a file…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={empty}>Export as</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {formats
                .filter((f) => f.write)
                .map((f) => (
                  <DropdownMenuItem key={f.id} onSelect={() => void exportAs(f.id)}>
                    {f.label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* The dialog sits in the window's title bar: presses in it mustn't drag the window. */}
      <div className="contents" onPointerDown={(e) => e.stopPropagation()}>
        <ImportTokensDialog source={source} onClose={() => setSource(null)} />
      </div>
    </>
  );
}

/** A title fit for a file name. */
function fileName(title: string): string {
  return title.replace(/[\\/:*?"<>|]+/g, "-").trim() || "Design tokens";
}
