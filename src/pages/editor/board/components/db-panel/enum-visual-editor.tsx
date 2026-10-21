import { Plus } from "lucide-react";

import { DB_HEADER_COLORS } from "@engine";
import { Button } from "@ui/components/ui/button";
import { useEngine } from "../../engine/engine-context";
import { ColorSwatch } from "../tool-options/color-swatch";
import { CommitInput } from "./commit-input";
import { EnumUsages } from "./enum-usages";
import { EnumValueRow } from "./enum-value-row";
import type { EnumVisualEditorProps } from "./enum-visual-editor.types";

/** Form view of one enum: name, color, values, and the columns that use it. */
export function EnumVisualEditor({ target }: EnumVisualEditorProps) {
  const engine = useEngine();

  return (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Enum name</span>
        <CommitInput
          value={target.name}
          onCommit={(name) => engine.db.updateEnum(target.id, { name })}
        />
      </label>

      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Header color</span>
        <div className="flex gap-0.5">
          {DB_HEADER_COLORS.map((color) => (
            <ColorSwatch
              key={color.value}
              label={color.name}
              color={color.value}
              selected={target.headerColor === color.value}
              onSelect={() => engine.db.updateEnum(target.id, { headerColor: color.value })}
            />
          ))}
        </div>
      </div>

      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">Values</h3>
          <Button variant="ghost" size="sm" onClick={() => engine.db.addEnumValue(target.id)}>
            <Plus />
            Add value
          </Button>
        </div>
        <ul>
          {target.values.map((value, index) => (
            <EnumValueRow key={value.id} target={target} value={value} index={index} />
          ))}
        </ul>
      </section>

      <EnumUsages enumId={target.id} />
    </div>
  );
}
