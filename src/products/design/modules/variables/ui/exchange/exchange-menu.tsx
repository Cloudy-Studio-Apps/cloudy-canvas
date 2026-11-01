import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

import { readTokenSource } from "../../exchange";
import { DOCUMENT_TOKENS } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { openFile, type OpenFilePick } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/kit";

import type { ImportSource } from "./exchange.types";
import { openExportTokens } from "./export-tokens-store";
import { ImportTokensDialog } from "./import-tokens-dialog";
import { useTokenFormats } from "./use-token-formats";
import { t } from "../../variables.i18n";

/** What importing variables offers: designs and tokens JSON. */
const TOKEN_FILES: OpenFilePick = {
  title: t("exchange.dialogTitle"),
  filters: [
    { name: t("exchange.filters.designsTokens"), extensions: ["cdesign", "json"] },
    { name: t("exchange.filters.designs"), extensions: ["cdesign"] },
    { name: t("exchange.filters.tokens"), extensions: ["json"] },
  ],
};

/** The Variables window's Import… (a design or tokens JSON) and Export… (its dialog). */
export function ExchangeMenu() {
  const engine = useDesignEngine();
  const formats = useTokenFormats();
  const [source, setSource] = useState<ImportSource | null>(null);

  const importFile = async () => {
    try {
      const file = await openFile(TOKEN_FILES);
      if (!file) return;
      setSource({ name: file.name, ...readTokenSource(file.bytes, formats, engine.kinds) });
    } catch (error) {
      notifyError(t("exchange.readError"), error);
    }
  };
  const empty = engine.service(DOCUMENT_TOKENS).store().isEmpty;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" onPointerDown={(e) => e.stopPropagation()}>
            <ArrowDownUp className="size-3.5" /> {t("exchange.menu")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onPointerDown={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={() => void importFile()}>
            {t("exchange.importFile")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={empty} onSelect={openExportTokens}>
            {t("exchange.export")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* The dialog sits in the window's title bar: presses in it mustn't drag the window. */}
      <div className="contents" onPointerDown={(e) => e.stopPropagation()}>
        <ImportTokensDialog source={source} onClose={() => setSource(null)} />
      </div>
    </>
  );
}
