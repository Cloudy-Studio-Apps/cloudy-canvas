import { ImagePlus, Palette } from "lucide-react";

import { pickImageFiles } from "@platform";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import { writeProjectImage, useProjectImage } from "@pages/shared/projects";
import { useProjectContext } from "../project-context";
import { t } from "../project.i18n";

/**
 * The band across the top of the project home: the manifest's cover image, else a band of the
 * project's color (the libraries' colors take its place once a project has libraries).
 */
export function ProjectCover() {
  const { record, manifest, project } = useProjectContext();
  const file = manifest.cover?.kind === "image" ? manifest.cover.file : null;
  const image = useProjectImage(record.root, file, project.rev);

  const chooseImage = async () => {
    try {
      const [picked] = await pickImageFiles({ title: t("cover.pick"), multiple: false });
      if (!picked) return;
      const name = await writeProjectImage(record.root, "cover", picked);
      await project.saveManifest({ cover: { kind: "image", file: name } });
    } catch (error) {
      notifyError(t("cover.failed"), error);
    }
  };

  return (
    <div
      className="relative h-28 w-full bg-cover bg-center"
      style={{
        backgroundColor: manifest.color,
        backgroundImage: image ? `url("${image}")` : undefined,
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="absolute right-4 bottom-3">
            {t("cover.change")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => void chooseImage()}>
            <ImagePlus />
            {t("cover.image")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={manifest.cover === null || manifest.cover.kind === "colors"}
            onSelect={() => void project.saveManifest({ cover: { kind: "colors" } })}
          >
            <Palette />
            {t("cover.colors")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
