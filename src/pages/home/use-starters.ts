import { useEffect, useState } from "react";

import { useProductsStore } from "@shared/stores/products-store";
import { notifyError } from "@shared/stores/toast-store";
import type { HomeStarter } from "./use-starters.types";
import { t } from "./home.i18n";

/** The modules' starters, plugins' included, once the products have loaded behind Home. */
export function useStarters(): HomeStarter[] {
  const ready = useProductsStore((state) => state.ready);
  const [starters, setStarters] = useState<HomeStarter[]>([]);

  useEffect(() => {
    if (!ready) return;
    import("./load-starters").then(
      ({ loadStarters }) => setStarters(loadStarters()),
      (error: unknown) => notifyError(t("starters.failed"), error),
    );
  }, [ready]);

  return starters;
}
