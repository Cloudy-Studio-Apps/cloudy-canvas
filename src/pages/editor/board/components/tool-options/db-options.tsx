import { Database, List } from "lucide-react";

import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel } from "../floating-panel";
import { OptionButton } from "./option-button";

const KINDS = [
  { kind: "table", label: "Table", icon: Database },
  { kind: "enum", label: "Enum", icon: List },
] as const;

/** Whether the Database tool places a table or an enum. */
export function DbOptions() {
  const engine = useEngine();
  const dbKind = useEngineState((state) => state.options.dbKind);

  return (
    <FloatingPanel role="group" aria-label="Database options" className="gap-1 px-2">
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
