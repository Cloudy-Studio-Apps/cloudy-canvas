import { AppWindow, BookOpen, Image, LayoutGrid, Smartphone } from "lucide-react";

import { SegmentedControl, type SegmentedOption } from "@shared/ui/kit";
import { usePreviewFonts } from "../type/use-preview-fonts";
import { SamplePreview } from "../previews/sample-preview";
import { useColorWizardStore, useWizardTheme, type PreviewKind } from "../store";
import { ContrastChecks } from "./contrast-checks";
import { CvdList } from "./cvd-list";
import { PlannedVariables } from "./planned-variables";
import { t } from "../../color-wizard.i18n";

const KINDS: readonly SegmentedOption<PreviewKind>[] = [
  { value: "website", label: t("review.preview.website"), icon: <AppWindow /> },
  { value: "components", label: t("review.preview.components"), icon: <LayoutGrid /> },
  { value: "social", label: t("review.preview.socialMedia"), icon: <Image /> },
  { value: "brochure", label: t("review.preview.brochure"), icon: <BookOpen /> },
  { value: "mobile", label: t("review.preview.mobileApp"), icon: <Smartphone /> },
];

/** Step 5: what Create writes, the theme on sample designs, contrast and look-alike checks. */
export function ReviewStep() {
  const { theme } = useWizardTheme();
  const preview = useColorWizardStore((s) => s.preview);
  const type = useColorWizardStore((s) => s.type);
  const set = useColorWizardStore((s) => s.set);
  usePreviewFonts([type.heading, type.body]);
  const mode = theme.modes.includes(preview.mode) ? preview.mode : (theme.modes[0] ?? "Light");
  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-auto md:grid-cols-[300px_minmax(0,1fr)] md:overflow-hidden">
      <div className="overflow-auto border-b border-border px-4 py-3.5 md:border-r md:border-b-0">
        <PlannedVariables />
      </div>
      <div className="flex min-w-0 flex-col gap-3.5 overflow-auto px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            label={t("review.preview.sampleDesign")}
            size="sm"
            value={preview.kind}
            options={KINDS}
            onChange={(kind) => set({ preview: { ...preview, kind } })}
          />
          <div className="ml-auto" />
          <SegmentedControl
            label={t("review.preview.mode")}
            size="sm"
            value={mode}
            options={theme.modes.map((m) => ({ value: m, label: m }))}
            onChange={(next) => set({ preview: { ...preview, mode: next } })}
          />
        </div>
        <div className="grid min-h-90 shrink-0 place-items-center rounded-lg border border-border bg-surface-sunken p-4">
          <SamplePreview kind={preview.kind} mode={mode} />
        </div>
        <ContrastChecks />
        <CvdList />
      </div>
    </div>
  );
}
