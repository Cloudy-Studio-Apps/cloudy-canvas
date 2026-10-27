/** How Home lists the recent files. */
export type RecentFilesView = "grid" | "list";

export interface HomeState {
  /** The seals card under the create tiles was dismissed. */
  sealsHidden: boolean;
  recentView: RecentFilesView;
  setSealsHidden: (hidden: boolean) => void;
  setRecentView: (view: RecentFilesView) => void;
}
