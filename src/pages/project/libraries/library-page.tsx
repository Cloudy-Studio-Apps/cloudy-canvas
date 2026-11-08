import { ArrowLeft, ChevronDown, FileCode2, ImagePlus, Plus } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { LibraryStrip } from "@pages/shared/projects";
import { useProjectContext } from "../project-context";
import { KindSection } from "./kind-section";
import { LIBRARY_KINDS } from "./library-kinds";
import { LibraryMenu } from "./library-menu";
import type { LibraryPageProps } from "./library-page.types";
import { usedByText } from "./library-usage";
import { t } from "../project.i18n";

/** One library: its colors, text styles, pictures, effects and components, with Add and Edit. */
export function LibraryPage({ library }: LibraryPageProps) {
  const { libraryActions, nav, fileCount, manifest } = useProjectContext();
  const { entry } = library;
  const colors = library.colors.slice(0, 6).map((item) => item.color);
  const meta = [usedByText(entry, fileCount), ...library.modes].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => nav.openLibrary(null)}>
          <ArrowLeft />
          {t("libraries.all")}
        </Button>
        <LibraryStrip
          colors={colors.length > 0 ? colors : [manifest.color]}
          className="h-6 w-14 shrink-0 rounded-sm"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{entry.name}</h2>
          {meta && <p className="truncate text-xs text-muted-foreground">{meta}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => libraryActions.editInFile(library)}>
          {t("libraries.editInFile")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus />
              {t("libraries.add")}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => void libraryActions.addAssets(library)}>
              <ImagePlus />
              {t("libraries.addImages")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void libraryActions.importStyles(library, "file")}>
              <FileCode2 />
              {t("libraries.importFile")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void libraryActions.importStyles(library, "tokens")}>
              <FileCode2 />
              {t("libraries.importTokens")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <LibraryMenu library={library} />
      </div>
      {LIBRARY_KINDS.map(({ kind }) => (
        <KindSection key={kind} kind={kind} library={library} />
      ))}
    </div>
  );
}
