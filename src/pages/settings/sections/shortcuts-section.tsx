import { BoardShortcutsList } from "@board/ui";
import { SettingsSection } from "../components/settings-section";

export function ShortcutsSection() {
  return (
    <SettingsSection
      id="shortcuts"
      title="Keyboard shortcuts"
      description="On a board. Hold Shift while resizing to keep proportions; hold Alt while dragging to duplicate."
    >
      <BoardShortcutsList />
    </SettingsSection>
  );
}
