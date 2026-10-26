import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

import { codeTokens, toCss, toDtcg, TokenStore } from "@canvas";
import { readColorSource } from "../../../tokens";
import { useDocumentMeta } from "@canvas-ui";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { exportFile, pickTokenFile, type TokenFilePick } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import { IconButton } from "@shared/ui/kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import type { ColorImportSource } from "./colors-ui.types";
import { ImportColorsDialog } from "./import-colors-dialog";

/** What importing colors offers: designs, boards and tokens JSON. */
const COLOR_FILES: TokenFilePick = {
  title: "Import colors",
  filters: [
    { name: "Designs, boards and tokens", extensions: ["cdesign", "cboard", "json"] },
    { name: "Cloudy Canvas files", extensions: ["cdesign", "cboard"] },
    { name: "Tokens JSON", extensions: ["json"] },
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
      const file = await pickTokenFile(COLOR_FILES);
      if (file) setSource({ name: file.name, ...readColorSource(file.bytes) });
    } catch (error) {
      notifyError("Couldn't read that file", error);
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
        label: format === "dtcg" ? "Design tokens" : "CSS",
      });
      if (saved)
        toast({ title: format === "dtcg" ? "Exported as design tokens" : "Exported as CSS" });
    } catch (error) {
      notifyError("Couldn't export the colors", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="Import and export" size="sm">
            <ArrowDownUp />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => void importFile()}>
            Import colors from a file…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={empty} onSelect={() => void exportAs("dtcg")}>
            Export as design tokens (DTCG)
          </DropdownMenuItem>
          <DropdownMenuItem disabled={empty} onSelect={() => void exportAs("css")}>
            Export as CSS variables
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ImportColorsDialog source={source} onClose={() => setSource(null)} />
    </>
  );
}
