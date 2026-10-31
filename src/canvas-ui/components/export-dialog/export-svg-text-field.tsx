import type { SvgText } from "@canvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import type { ExportSvgTextFieldProps } from "./export-dialog.types";
import { ExportField } from "./export-field";
import { t } from "../components.i18n";

/** How an SVG holds its text: outlines look the same anywhere, live text stays editable. */
export function ExportSvgTextField({ value, onChange }: ExportSvgTextFieldProps) {
  return (
    <ExportField label={t("export.svgText")} id="export-svg-text">
      <Select value={value} onValueChange={(next) => onChange(next as SvgText)}>
        <SelectTrigger id="export-svg-text" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="outlines">{t("export.svgOutlines")}</SelectItem>
          <SelectItem value="live">{t("export.svgLive")}</SelectItem>
        </SelectContent>
      </Select>
    </ExportField>
  );
}
