import { Link2, Link2Off, Trash2 } from "lucide-react";

import { resolveVariable } from "@canvas";
import { CommitInput, useDocumentTokens, VariablePicker } from "@canvas-ui";
import { IconButton } from "@shared/ui/kit";
import { colorMode } from "./color-mode";
import { ColorValuePopover } from "./color-value-popover";
import type { ColorRowProps } from "./colors-ui.types";

/**
 * A board color: its swatch (edit), its name (rename; slashes put it in groups), the color it
 * follows when it's an alias of another, and delete.
 */
export function ColorRow({ variable, onDelete }: ColorRowProps) {
  const { tokens, store } = useDocumentTokens();
  const slash = variable.name.lastIndexOf("/");
  const group = slash < 0 ? "" : variable.name.slice(0, slash + 1);
  const leaf = variable.name.slice(slash + 1);
  const mode = colorMode(store, variable);
  const value = variable.values[mode] ?? variable.values.default;
  const target = value && "alias" in value ? store.variable(value.alias) : null;

  const rename = (text: string) => {
    const name = text.trim();
    if (!name) return "A color needs a name.";
    tokens.updateVariable(variable.id, { name: `${group}${name}` });
  };
  // It keeps the color it showed, as its own.
  const unalias = () => {
    const resolved = resolveVariable(store, variable.id, {});
    if (resolved?.type === "color") tokens.setValue(variable.id, mode, { color: resolved.color });
  };

  return (
    <div
      className="group/row flex h-8 items-center gap-2 px-1"
      title={variable.description || undefined}
    >
      <ColorValuePopover variable={variable} />
      <div className="flex min-w-0 flex-1 flex-col">
        <CommitInput
          aria-label="Color name"
          value={leaf}
          onCommit={rename}
          className="h-6 min-w-0 rounded-md bg-transparent px-1 text-xs hover:bg-muted focus:bg-muted focus:outline-none"
        />
        {target && (
          <span className="truncate px-1 text-[11px] text-muted-foreground">→ {target.name}</span>
        )}
      </div>
      <VariablePicker
        type="color"
        scopes={[]}
        value={target?.id ?? null}
        modes={{}}
        onPick={(id) => {
          if (id !== variable.id) tokens.setValue(variable.id, mode, { alias: id });
        }}
      >
        <IconButton label="Follow another color" size="xs" revealOnHover={!target}>
          <Link2 />
        </IconButton>
      </VariablePicker>
      {target && (
        <IconButton label="Stop following it" size="xs" onClick={unalias}>
          <Link2Off />
        </IconButton>
      )}
      <IconButton label="Delete color" size="xs" revealOnHover onClick={() => onDelete(variable)}>
        <Trash2 />
      </IconButton>
    </div>
  );
}
