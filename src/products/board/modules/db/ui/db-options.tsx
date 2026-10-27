import { Database, List } from "lucide-react";

import { FloatingPanel, OptionButton } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { t } from "../db.i18n";

const KINDS = [
  { kind: "table", label: t("options.table"), icon: Database },
  { kind: "enum", label: t("options.enum"), icon: List },
] as const;

/** Whether the Database tool places a table or an enum. */
export function DbOptions() {
  const engine = useBoardEngine();
  const dbKind = useBoardState((state) => state.options.dbKind);

  return (
    <FloatingPanel role="group" aria-label={t("options.group")} className="gap-1 px-2">
      {KINDS.map(({ kind, label, icon: Icon }) => (
        <OptionButton
          key={kind}
          aria-label={label}
          selected={dbKind === kind}
          className="w-auto gap-1.5 px-2 text-sm"
          onClick={() => engine.setToolOptions({ dbKind: kind })}
        >
          <Icon className="size-4" />
          {label}
        </OptionButton>
      ))}
    </FloatingPanel>
  );
}
