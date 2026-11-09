import { createContext } from "react";

import type { FileTabs } from "@canvas";

/** The app's file tabs, provided once around the router (`useFileTabs`, `TabHost`). */
export const FileTabsContext = createContext<FileTabs | null>(null);
