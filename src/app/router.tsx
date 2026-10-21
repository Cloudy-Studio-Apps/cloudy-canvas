import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { DesignSystemPage } from "@pages/design-system/design-system-page";
import { EditorPlaceholderPage } from "@pages/editor/editor-placeholder-page";
import { HomePage } from "@pages/home/home-page";

// Dev-only tooling routes; tree-shaken from production builds.
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [{ path: "/design-system", element: <DesignSystemPage /> }]
  : [];

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/board/:id", element: <EditorPlaceholderPage type="board" /> },
  { path: "/design/:id", element: <EditorPlaceholderPage type="design" /> },
  ...devRoutes,
  { path: "*", element: <Navigate to="/" replace /> },
]);
