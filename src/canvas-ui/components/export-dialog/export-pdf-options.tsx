import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import type {
  PdfDpi,
  PdfImageQuality,
  PdfMode,
  PdfOrientation,
  PdfPageSize,
  PdfText,
} from "@canvas";
import { Button, CheckboxField, NumberInput, SegmentedControl, SelectField } from "@shared/ui/kit";
import type { ExportPdfOptionsProps } from "./export-dialog.types";
import { ExportField } from "./export-field";
import { t } from "../components.i18n";

/** A PDF's options: its type and text with what they mean as tooltips, the rest folded away. */
export function ExportPdfOptions({ options, onChange, framePagesLabel }: ExportPdfOptionsProps) {
  const [more, setMore] = useState(false);
  const sharp = options.mode === "sharp";
  const modes: { value: PdfMode; label: string; title: string }[] = [
    { value: "sharp", label: t("export.pdf.sharp"), title: t("export.pdf.sharpHint") },
    { value: "flattened", label: t("export.pdf.flattened"), title: t("export.pdf.flattenedHint") },
  ];
  const texts: { value: PdfText; label: string; title: string }[] = [
    {
      value: "selectable",
      label: t("export.pdf.selectable"),
      title: t("export.pdf.selectableHint"),
    },
    { value: "outlines", label: t("export.pdf.outlines"), title: t("export.pdf.outlinesHint") },
  ];
  const qualities: { value: PdfImageQuality; label: string }[] = [
    { value: "high", label: t("export.pdf.high") },
    { value: "balanced", label: t("export.pdf.balanced") },
    { value: "small", label: t("export.pdf.small") },
  ];
  const resolutions = [
    { value: "300", label: t("export.pdf.dpi300") },
    { value: "150", label: t("export.pdf.dpi150") },
    { value: "96", label: t("export.pdf.dpi96") },
  ];
  const pages: { value: PdfPageSize; label: string }[] = [
    { value: "fit", label: t("export.pdf.fit") },
    { value: "a4", label: "A4" },
    { value: "letter", label: t("export.pdf.letter") },
    { value: "a3", label: "A3" },
  ];
  const orientations: { value: PdfOrientation; label: string }[] = [
    { value: "auto", label: t("export.pdf.auto") },
    { value: "portrait", label: t("export.pdf.portrait") },
    { value: "landscape", label: t("export.pdf.landscape") },
  ];
  return (
    <>
      <ExportField label={t("export.pdf.type")}>
        <SegmentedControl
          label={t("export.pdf.type")}
          value={options.mode}
          options={modes}
          onChange={(mode) => onChange({ mode })}
          fullWidth
        />
      </ExportField>
      {sharp && (
        <ExportField label={t("export.svgText")}>
          <SegmentedControl
            label={t("export.svgText")}
            value={options.text}
            options={texts}
            onChange={(text) => onChange({ text })}
            fullWidth
          />
        </ExportField>
      )}
      {framePagesLabel && (
        <ExportField label={t("export.pdf.pages")}>
          <CheckboxField
            label={framePagesLabel}
            checked={options.pages === "frames"}
            onChange={(on) => onChange({ pages: on ? "frames" : "single" })}
          />
        </ExportField>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="justify-start"
        aria-expanded={more}
        onClick={() => setMore(!more)}
      >
        {more ? <ChevronDown /> : <ChevronRight />}
        {t("export.pdf.more")}
      </Button>
      {more && (
        <>
          <ExportField label={t("export.pdf.imageQuality")}>
            <SelectField
              label={t("export.pdf.imageQuality")}
              value={options.imageQuality}
              options={qualities}
              onChange={(imageQuality) => onChange({ imageQuality })}
            />
          </ExportField>
          <ExportField label={t("export.pdf.resolution")}>
            <SelectField
              label={t("export.pdf.resolution")}
              value={String(options.dpi)}
              options={resolutions}
              onChange={(dpi) => onChange({ dpi: Number(dpi) as PdfDpi })}
            />
          </ExportField>
          <ExportField label={t("export.pdf.page")}>
            <SelectField
              label={t("export.pdf.page")}
              value={options.page}
              options={pages}
              onChange={(page) => onChange({ page })}
            />
          </ExportField>
          {options.page !== "fit" && (
            <>
              <ExportField label={t("export.pdf.orientation")}>
                <SelectField
                  label={t("export.pdf.orientation")}
                  value={options.orientation}
                  options={orientations}
                  onChange={(orientation) => onChange({ orientation })}
                />
              </ExportField>
              <ExportField label={t("export.pdf.margin")}>
                <NumberInput
                  label={t("export.pdf.margin")}
                  value={options.margin}
                  onChange={(margin) => onChange({ margin })}
                  min={0}
                  max={100}
                  suffix="mm"
                />
              </ExportField>
            </>
          )}
        </>
      )}
    </>
  );
}
