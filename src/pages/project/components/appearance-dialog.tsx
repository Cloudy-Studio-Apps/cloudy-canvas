import { useState } from "react";

import { pickImageFiles } from "@platform";
import { ColorPopover } from "@canvas-ui";
import type { ImageFile } from "@shared/core";
import { AppDialog, Button, Field } from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import {
  ProjectIcon,
  writeProjectImage,
  useImageUrl,
  useProjectImage,
} from "@pages/shared/projects";
import { useProjectContext } from "../project-context";
import type { ProjectDialogProps } from "./project-dialog.types";
import { t } from "../project.i18n";

/** Icon and color: the project's color and the optional picture shown instead of its initials. */
export function AppearanceDialog(props: ProjectDialogProps) {
  return props.open ? <AppearanceForm {...props} /> : null;
}

function AppearanceForm({ open, onOpenChange }: ProjectDialogProps) {
  const { manifest, record, project } = useProjectContext();
  const [color, setColor] = useState(manifest.color);
  const [picked, setPicked] = useState<ImageFile | null>(null);
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const current = useProjectImage(record.root, removed ? null : manifest.icon, project.rev);
  const pickedUrl = useImageUrl(picked);
  const image = pickedUrl ?? current;

  const pick = async () => {
    try {
      const [file] = await pickImageFiles({ title: t("appearance.pick"), multiple: false });
      if (file) {
        setPicked(file);
        setRemoved(false);
      }
    } catch (error) {
      notifyError(t("appearance.failed"), error);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const icon = picked
        ? await writeProjectImage(record.root, "icon", picked)
        : removed
          ? null
          : manifest.icon;
      await project.saveManifest({ color, icon });
      onOpenChange(false);
    } catch (error) {
      notifyError(t("appearance.failed"), error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("appearance.title")}
      description={t("appearance.description")}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("appearance.cancel")}
          </Button>
          <Button disabled={saving} onClick={() => void save()}>
            {t("appearance.save")}
          </Button>
        </>
      }
    >
      <Field label={t("appearance.label")}>
        <div className="flex items-center gap-2">
          <ProjectIcon name={manifest.name} color={color} image={image} size="lg" />
          <ColorPopover
            color={color}
            label={t("appearance.colorLabel")}
            onChange={(next) => setColor(next.color)}
          />
          <Button variant="outline" size="sm" onClick={() => void pick()}>
            {t("appearance.choose")}
          </Button>
          {image && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPicked(null);
                setRemoved(true);
              }}
            >
              {t("appearance.remove")}
            </Button>
          )}
        </div>
      </Field>
    </AppDialog>
  );
}
