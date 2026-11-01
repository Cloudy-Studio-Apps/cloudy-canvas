import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

import { LoadingScreen } from "@shared/ui/components/loading-screen";
import { t } from "./app.i18n";

/** A route's page, loaded the first time it opens. The seal shows until it's there. */
export function lazyPage(load: () => Promise<ComponentType>): ReactNode {
  const Page = lazy(async () => ({ default: await load() }));
  return (
    <Suspense
      fallback={
        <LoadingScreen
          title={t("products.opening")}
          stage={t("products.openingHint")}
          className="fixed inset-0 z-40 bg-background"
        />
      }
    >
      <Page />
    </Suspense>
  );
}
