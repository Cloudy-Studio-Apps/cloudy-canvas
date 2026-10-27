import { LayoutGrid, List } from "lucide-react";

import { useHomeStore } from "@shared/stores/home-store";
import type { RecentFilesView } from "@shared/stores/home-store.types";
import { SegmentedControl, type SegmentedOption } from "@shared/ui/kit";
import { t } from "../home.i18n";

const OPTIONS: readonly SegmentedOption<RecentFilesView>[] = [
  { value: "grid", label: t("recent.view.grid"), icon: <LayoutGrid /> },
  { value: "list", label: t("recent.view.list"), icon: <List /> },
];

/** Grid or list for the Recent files, remembered between sessions. */
export function RecentFilesViewToggle() {
  const view = useHomeStore((s) => s.recentView);
  const setView = useHomeStore((s) => s.setRecentView);
  return (
    <SegmentedControl
      value={view}
      onChange={setView}
      options={OPTIONS}
      label={t("recent.view.label")}
      iconOnly
      size="sm"
    />
  );
}
