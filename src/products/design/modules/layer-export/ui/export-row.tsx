import { Minus } from "lucide-react";

import { commitFieldProps, useCommitField } from "@canvas-ui";
import { FieldBox, PanelIconButton } from "@design/ui/components/panel";
import { SelectField } from "@shared/ui/kit";
import { cn } from "@shared/ui/kit";
import type { NodeExportFormat } from "../../core";
import { t } from "../layer-export.i18n";
import { EXPORT_FILE_TYPES, EXPORT_SCALES, hasSize, withScale } from "../node-exports";
import type { ExportRowProps } from "./export-row.types";

const SCALE_OPTIONS = EXPORT_SCALES.map((scale) => ({
  value: String(scale),
  label: `${scale}x`,
}));
const TYPE_OPTIONS = EXPORT_FILE_TYPES.map((format) => ({
  value: format,
  label: format.toUpperCase(),
}));

/** One saved export: its size (not for SVG, which is vector), suffix and file type. */
export function ExportRow({ row, onChange, onRemove }: ExportRowProps) {
  const sized = hasSize(row.format);
  const field = useCommitField(row.suffix, (draft) => {
    if (draft !== row.suffix) onChange({ ...row, suffix: draft });
  });
  const bindings = commitFieldProps<HTMLInputElement>(field, { selectOnFocus: true });
  return (
    <div className="grid grid-cols-[3.75rem_minmax(0,1fr)_4rem_auto] items-center gap-1">
      {sized && (
        <SelectField
          label={t("size")}
          value={String(row.scale)}
          options={SCALE_OPTIONS}
          onChange={(scale) => onChange(withScale(row, Number(scale)))}
        />
      )}
      <FieldBox title={t("suffix")} className={cn(!sized && "col-span-2")}>
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a bare input inside its FieldBox */}
        <input
          aria-label={t("suffix")}
          placeholder={t("suffix")}
          {...bindings}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle-foreground"
        />
      </FieldBox>
      <SelectField<NodeExportFormat>
        label={t("format")}
        value={row.format}
        options={TYPE_OPTIONS}
        onChange={(format) => onChange({ ...row, format })}
      />
      {onRemove && (
        <PanelIconButton label={t("remove")} onClick={onRemove}>
          <Minus />
        </PanelIconButton>
      )}
    </div>
  );
}
