import type { ReactNode } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { projectsSupported } from "@platform";
import { HomePage } from "@pages/home/home-page";
import { RouteErrorPage } from "./error";
import { lazyPage } from "./lazy-page";

// Only Home is part of the first load: the rest needs the products, or isn't needed at startup.
const boardEditor = lazyPage(() => import("@board/ui").then((ui) => ui.BoardEditorPage));
const designEditor = lazyPage(() => import("@design/ui").then((ui) => ui.DesignEditorPage));
const settings = lazyPage(() =>
  import("@pages/settings/settings-page").then((page) => page.SettingsPage),
);
const projects = lazyPage(() =>
  import("@pages/projects/projects-page").then((page) => page.ProjectsPage),
);
const project = lazyPage(() =>
  import("@pages/project/project-page").then((page) => page.ProjectPage),
);
const join = lazyPage(() => import("@pages/join/join-page").then((page) => page.JoinPage));

// Projects are a desktop feature: elsewhere their routes go Home.
const desktopOnly = (page: ReactNode): ReactNode =>
  projectsSupported() ? page : <Navigate to="/" replace />;

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
      { path: "/projects", element: desktopOnly(projects) },
      { path: "/project/:id", element: desktopOnly(project) },
      { path: "/settings", element: settings },
      { path: "/settings/:section", element: settings },
      { path: "/join/:ticket", element: join },
      ...devRoutes,
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
