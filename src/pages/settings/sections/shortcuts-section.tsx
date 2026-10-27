import { BoardShortcutsList } from "@board/ui";
import { SettingsSection } from "../components/settings-section";
import { t } from "../settings.i18n";

export function ShortcutsSection() {
  return (
    <SettingsSection
      id="shortcuts"
      title={t("nav.shortcuts")}
      description={t("shortcuts.description")}
    >
      <BoardShortcutsList />
    </SettingsSection>
  );
}
