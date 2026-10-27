import { Copy } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { Field, IconButton } from "@shared/ui/kit";
import { simulateCvd } from "../..";
import { copyText } from "../copy-text";
import { useColorWizardStore } from "../store";
import { PaletteSwatch } from "./palette-swatch";
import { PaletteToolbar } from "./palette-toolbar";
import { t } from "../../color-wizard.i18n";

/** The palette being built: its toolbar, the colors as columns, and the collection's name. */
export function PalettePanel() {
  const palette = useColorWizardStore((s) => s.palette);
  const cvd = useColorWizardStore((s) => s.cvd);
  const collection = useColorWizardStore((s) => s.collection);
  const set = useColorWizardStore((s) => s.set);
  return (
    <section className="@container grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2.5 px-4 pt-2.5 pb-3.5">
      <PaletteToolbar />
      <div className="flex min-h-0 overflow-hidden rounded-lg border border-border @max-[420px]:flex-col">
        {palette.map((color, i) => (
          <PaletteSwatch key={i} color={color} index={i} count={palette.length} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-7 w-36 overflow-hidden rounded-md border border-border">
          {palette.map((c, i) => (
            <div key={i} className="flex-1" style={{ background: simulateCvd(c.hex, cvd) }} />
          ))}
        </div>
        <IconButton
          label={t("palette.copyAll")}
          className="ml-auto"
          onClick={() => copyText(palette.map((c) => c.hex).join(", "), "codes")}
        >
          <Copy />
        </IconButton>
        <Field label={t("palette.collection")} layout="inline" className="w-60">
          {(id) => (
            <CommitInput
              id={id}
              value={collection}
              className="h-7 w-full rounded-md border border-input bg-surface px-2 text-xs"
              onCommit={(text) => {
                if (!text.trim()) return t("palette.nameRequired");
                set({ collection: text.trim() });
              }}
            />
          )}
        </Field>
      </div>
    </section>
  );
}
