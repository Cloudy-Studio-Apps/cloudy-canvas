import { FloatingPanel } from "../components/floating-panel";
import { ToolButton } from "../components/tool-button";
import { useEditorPoint } from "./editor-modules-context";
import { ExtensionIconView } from "./extension-icon-view";
import { useEditorMode } from "./use-editor-mode";

/**
 * The editor's modes side by side (the `modes` point, by `order`), the current one pressed; a
 * click switches. Hidden while there's only one.
 */
export function ModeSwitcher() {
  const mode = useEditorMode();
  const entries = [...useEditorPoint((points) => points.modes)].sort((a, b) => a.order - b.order);
  if (entries.length < 2) return null;
  return (
    <FloatingPanel role="radiogroup" aria-label="Modes">
      {entries.map((entry) => (
        <ToolButton
          key={entry.id}
          role="radio"
          aria-checked={mode.id === entry.id}
          label={entry.label}
          {...(entry.description ? { description: entry.description } : {})}
          active={mode.id === entry.id}
          onClick={() => mode.setMode(entry.id)}
        >
          <ExtensionIconView icon={entry.icon} />
        </ToolButton>
      ))}
    </FloatingPanel>
  );
}
