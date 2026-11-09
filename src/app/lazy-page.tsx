import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

import { LoadingScreen } from "@shared/ui/components/loading-screen";
import { t } from "./app.i18n";

/** A component loaded the first time it renders. The seal covers the window until it's there. */
export function lazyComponent<P extends object>(
  load: () => Promise<ComponentType<P>>,
): ComponentType<P> {
  const Lazy = lazy(async () => ({ default: await load() }));
  return function LazyComponent(props: P) {
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
        <Lazy {...props} />
      </Suspense>
    );
  };
}

/** A route's page, loaded the first time it opens. The seal shows until it's there. */
export function lazyPage(load: () => Promise<ComponentType>): ReactNode {
  const Page = lazyComponent(load);
  return <Page />;
}
