import { useNavigate } from "react-router";

import { createId } from "@shared/core";
import { useStarters } from "../use-starters";
import { StarterCard } from "./starter-card";
import { t } from "../home.i18n";

/** "Start from": the modules' starters, each opening a new file already filled in. */
export function StartersRow() {
  const navigate = useNavigate();
  const starters = useStarters();
  if (starters.length === 0) return null;

  return (
    <section aria-labelledby="starters-heading" className="space-y-4">
      <h2 id="starters-heading" className="text-sm font-medium tracking-wide text-muted-foreground">
        {t("starters.title")}
      </h2>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {starters.map((starter) => (
          <li key={`${starter.type}:${starter.id}`} className="grid">
            <StarterCard
              starter={starter}
              onSelect={() => void navigate(`/${starter.type}/${createId()}?starter=${starter.id}`)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
