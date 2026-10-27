import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { DesignSystemPage } from "@pages/design-system/design-system-page";
import { BoardEditorPage } from "@board/ui";
import { DesignEditorPage } from "@design/ui";
import { HomePage } from "@pages/home/home-page";
import { JoinPage } from "@pages/join/join-page";
import { SettingsPage } from "@pages/settings/settings-page";
import { RouteErrorPage } from "./error";

// Dev-only tooling routes; tree-shaken from production builds.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [{ path: "/design-system", element: <DesignSystemPage /> }]
  : [];

// Every route sits under one pathless parent whose errorElement catches what any of them throws.
export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/board/:id", element: <BoardEditorPage /> },
      { path: "/design/:id", element: <DesignEditorPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/settings/:section", element: <SettingsPage /> },
      { path: "/join/:ticket", element: <JoinPage /> },
      ...devRoutes,
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
