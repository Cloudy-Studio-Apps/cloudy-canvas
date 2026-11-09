import { FileTabs, type TabLoader } from "@canvas/tabs";
import { tabsSupported } from "@platform";

/** A product's loader, imported with the product the first time a tab of it loads. */
const lazyLoader = (load: () => Promise<TabLoader>): TabLoader => ({
  load: async (fileId, live) => (await load()).load(fileId, live),
});

/**
 * The app's file tabs. The products load with their first tab (or the preload), never with the
 * shell. Where tabs aren't supported (Android) one file is open at a time: opening another closes
 * it, as before tabs.
 */
export const fileTabs = new FileTabs({
  loaders: {
    board: lazyLoader(() => import("@board/ui").then((ui) => ui.boardTabLoader)),
    design: lazyLoader(() => import("@design/ui").then((ui) => ui.designTabLoader)),
  },
  ...(tabsSupported() ? {} : { maxFileTabs: 1 }),
});
