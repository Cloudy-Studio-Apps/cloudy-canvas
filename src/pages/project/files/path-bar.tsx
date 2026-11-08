import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

import { Button, cn } from "@shared/ui/kit";
import { dragId, useProjectContext } from "../project-context";
import { joinRel } from "../project-rel";

/** The folders from the project down to the one shown; each is a link and takes drops. */
export function PathBar() {
  const { manifest, folder, setFolder, drag } = useProjectContext();
  const parts = folder === "" ? [] : folder.split("/");
  const crumbs = [
    { rel: "", name: manifest.name },
    ...parts.map((name, i) => ({ rel: joinRel(parts.slice(0, i).join("/"), name), name })),
  ];

  return (
    <nav className="flex min-w-0 items-center gap-0.5">
      {crumbs.map((crumb, i) => {
        const last = i === crumbs.length - 1;
        const over = drag.drag?.overId === dragId("folder", crumb.rel);
        return (
          <Fragment key={crumb.rel}>
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
            <Button
              variant="ghost"
              size="sm"
              disabled={last}
              onClick={() => setFolder(crumb.rel)}
              {...drag.dropProps(dragId("folder", crumb.rel))}
              className={cn(
                "max-w-48 truncate px-1.5",
                last && "font-semibold text-foreground disabled:opacity-100",
                over && "bg-primary-soft",
              )}
            >
              {crumb.name}
            </Button>
          </Fragment>
        );
      })}
    </nav>
  );
}
