import type { ReactNode } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { projectsSupported } from "@platform";
import { HomePage } from "@pages/home/home-page";
import { RouteErrorPage } from "./error";
import { lazyPage } from "./lazy-page";
import { AppFrame } from "./tabs/app-frame";

// Only Home is part of the first load: the rest needs the products, or isn't needed at startup.
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

// Every route sits under one pathless parent, the app frame, whose errorElement catches what any of
// them throws. File routes render nothing themselves: the frame opens their tab (`app/tabs/`).
export const router = createBrowserRouter([
  {
    element: <AppFrame />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/board/:id", element: null },
      { path: "/design/:id", element: null },
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
