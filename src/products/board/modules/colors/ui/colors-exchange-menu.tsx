import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

import { codeTokens, toCss, toDtcg, TokenStore } from "@canvas";
import { readColorSource } from "../../../tokens";
import { useDocumentMeta } from "@canvas-ui";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { exportFile, openFile, type OpenFilePick } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui/kit";
import type { ColorImportSource } from "./colors-ui.types";
import { ImportColorsDialog } from "./import-colors-dialog";
import { t } from "../colors.i18n";

/** What importing colors offers: designs, boards and tokens JSON. */
const COLOR_FILES: OpenFilePick = {
  title: t("exchange.importTitle"),
  filters: [
    { name: t("exchange.filterAll"), extensions: ["cdesign", "cboard", "json"] },
    { name: t("exchange.filterFiles"), extensions: ["cdesign", "cboard"] },
    { name: t("exchange.filterJson"), extensions: ["json"] },
  ],
};

/** The colors panel's Import (a design, a board or tokens JSON) and Export (DTCG, CSS). */
export function ColorsExchangeMenu() {
  const engine = useBoardEngine();
  const { title } = useDocumentMeta(engine.doc);
  const [source, setSource] = useState<ColorImportSource | null>(null);
  const empty = TokenStore.of(engine.doc).isEmpty;

  const importFile = async () => {
    try {
      const file = await openFile(COLOR_FILES);
      if (file) setSource({ name: file.name, ...readColorSource(file.bytes) });
    } catch (error) {
      notifyError(t("exchange.readFailed"), error);
    }
  };
  const exportAs = async (format: "dtcg" | "css") => {
    try {
      const name = title.trim() || "Board colors";
      const store = TokenStore.of(engine.doc);
      const text =
        format === "dtcg" ? JSON.stringify(toDtcg(store), null, 2) : toCss(codeTokens(store, name));
      const file = name.replace(/[\\/:*?"<>|]+/g, "-").trim() || "Board colors";
      const saved = await exportFile(new Blob([text], { type: "text/plain" }), file, {
        extension: format === "dtcg" ? "tokens.json" : "css",
        label: format === "dtcg" ? t("exchange.formatTokens") : "CSS",
      });
      if (saved)
        toast({
          title: format === "dtcg" ? t("exchange.exportedTokens") : t("exchange.exportedCss"),
        });
    } catch (error) {
      notifyError(t("exchange.exportFailed"), error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label={t("exchange.menu")} size="sm">
            <ArrowDownUp />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => void importFile()}>
            {t("exchange.import")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={empty} onSelect={() => void exportAs("dtcg")}>
            {t("exchange.exportTokens")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={empty} onSelect={() => void exportAs("css")}>
            {t("exchange.exportCss")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ImportColorsDialog source={source} onClose={() => setSource(null)} />
    </>
  );
}
