import { DialogClose } from "@shared/ui/components/ui/dialog";
import { useOptionalEditorPoint } from "../editor-modules-context";
import { ExtensionIconView } from "../extension-icon-view";
import { useEditorMode } from "../use-editor-mode";
import { t } from "../modules.i18n";
import { PhoneToolCell } from "./phone-tool-cell";

/** The sheet's modes, in place of the mode switcher. Hidden while there's only one. */
export function PhoneModes() {
  const mode = useEditorMode();
  const entries = [...useOptionalEditorPoint((points) => points.modes)].sort(
    (a, b) => a.order - b.order,
  );
  if (entries.length < 2) return null;
  return (
    <section className="space-y-1.5" aria-label={t("modes")}>
      <h3 className="text-xs font-medium text-muted-foreground">{t("modes")}</h3>
      <div className="grid grid-cols-4 gap-1">
        {entries.map((entry) => (
          <DialogClose key={entry.id} asChild>
            <PhoneToolCell
              icon={<ExtensionIconView icon={entry.icon} className="size-5" />}
              label={entry.label}
              active={mode.id === entry.id}
              onClick={() => mode.setMode(entry.id)}
            />
          </DialogClose>
        ))}
      </div>
    </section>
  );
}
