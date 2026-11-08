import { FolderKanban } from "lucide-react";
import { useNavigate } from "react-router";

import { projectsSupported } from "@platform";
import { CreateTile } from "./create-tile";
import { t } from "../home.i18n";

/** "New project": opens the Projects page with its New project dialog. Desktop only. */
export function NewProjectTile() {
  const navigate = useNavigate();
  if (!projectsSupported()) return null;
  return (
    <CreateTile
      icon={
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-muted-foreground [&_svg]:size-5">
          <FolderKanban />
        </span>
      }
      title={t("create.project")}
      hint={t("create.projectHint")}
      onSelect={() => void navigate("/projects?new")}
    />
  );
}
