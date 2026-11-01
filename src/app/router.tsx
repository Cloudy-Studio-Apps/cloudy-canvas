import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { HomePage } from "@pages/home/home-page";
import { RouteErrorPage } from "./error";
import { lazyPage } from "./lazy-page";

// Only Home is part of the first load: the rest needs the products, or isn't needed at startup.
const boardEditor = lazyPage(() => import("@board/ui").then((ui) => ui.BoardEditorPage));
const designEditor = lazyPage(() => import("@design/ui").then((ui) => ui.DesignEditorPage));
const settings = lazyPage(() =>
  import("@pages/settings/settings-page").then((page) => page.SettingsPage),
);
const join = lazyPage(() => import("@pages/join/join-page").then((page) => page.JoinPage));

// Dev-only tooling routes; tree-shaken from production builds.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: "/design-system",
        element: lazyPage(() =>
          import("@pages/design-system/design-system-page").then((page) => page.DesignSystemPage),
        ),
      },
    ]
  : [];

// Every route sits under one pathless parent whose errorElement catches what any of them throws.
export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/board/:id", element: boardEditor },
      { path: "/design/:id", element: designEditor },
      { path: "/settings", element: settings },
      { path: "/settings/:section", element: settings },
      { path: "/join/:ticket", element: join },
      ...devRoutes,
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
