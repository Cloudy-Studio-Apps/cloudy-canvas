import { useState } from "react";
import { Download, EyeOff, FolderOpen, MoreHorizontal, Palette, Pencil } from "lucide-react";
import { useNavigate } from "react-router";

import { revealFile } from "@platform";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui/kit";
import { useProjectsStore } from "@shared/stores/projects-store";
import { notifyError, toast, toastProgress } from "@shared/stores/toast-store";
import { exportProjectZip } from "../export-project-zip";
import { useProjectContext } from "../project-context";
import { AppearanceDialog } from "./appearance-dialog";
import { RenameProjectDialog } from "./rename-project-dialog";
import { t } from "../project.i18n";

/** The header's ⋯ menu: rename, icon and color, show in folder, export as .zip, remove from list. */
export function ProjectMoreMenu() {
  const { record, manifest, project } = useProjectContext();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<"rename" | "appearance" | null>(null);

  const forget = async () => {
    await useProjectsStore.getState().forget(record.id);
    toast({ title: t("more.forgotten", { name: manifest.name }) });
    void navigate("/projects");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label={t("more.label")} variant="outline" size="md">
            <MoreHorizontal />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("rename")}>
            <Pencil />
            {t("more.rename")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("appearance")}>
            <Palette />
            {t("more.appearance")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() =>
              void revealFile(record.root).catch((e: unknown) =>
                notifyError(t("actions.revealFailed"), e),
              )
            }
          >
            <FolderOpen />
            {t("more.reveal")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              void toastProgress(
                async () => {
                  if (!project.manifestFile) throw new Error("The project's file isn't read yet");
                  return exportProjectZip(record.root, project.manifestFile, manifest.name);
                },
                {
                  loading: t("more.exporting"),
                  error: t("more.exportFailed"),
                },
              ).then((saved) => saved && toast({ title: t("more.exported") }))
            }
          >
            <Download />
            {t("more.export")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void forget()}>
            <EyeOff />
            {t("more.forget")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RenameProjectDialog open={dialog === "rename"} onOpenChange={(o) => !o && setDialog(null)} />
      <AppearanceDialog
        open={dialog === "appearance"}
        onOpenChange={(o) => !o && setDialog(null)}
      />
    </>
  );
}
