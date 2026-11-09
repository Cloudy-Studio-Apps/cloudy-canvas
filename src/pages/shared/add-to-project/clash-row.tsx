import { SegmentedControl, Swatch } from "@shared/ui/kit";
import type { ClashChoice } from "@canvas";
import type { ClashRowProps } from "./clash-row.types";
import { t } from "./add-to-project.i18n";

/** One clash: the name, both colors for a color variable, and Use project's / Keep both. */
export function ClashRow({ clash, colors, onChange }: ClashRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border px-2.5 py-2">
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="truncate font-medium" title={clash.name}>
          {clash.name}
        </span>
        {colors.file && colors.library ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Swatch color={colors.file} size="xs" />
            {t("dialog.fileValue")}
            <Swatch color={colors.library} size="xs" />
            {t("dialog.projectValue")}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {clash.kind === "variable" ? t("dialog.variable") : t("dialog.style")}
          </span>
        )}
      </span>
      <SegmentedControl<ClashChoice>
        size="sm"
        label={t("dialog.choice", { name: clash.name })}
        value={clash.choice}
        onChange={onChange}
        options={[
          { value: "project", label: t("dialog.useProject") },
          { value: "both", label: t("dialog.keepBoth") },
        ]}
      />
    </li>
  );
}
