import { Check } from "lucide-react";
import { useState } from "react";

import { groupTree, type VariableRecord } from "@canvas";
import { SearchInput } from "@shared/ui/kit";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { matchesScopes } from "./matches-scopes";
import { TokenGroupAccordion } from "./token-group-accordion";
import type { VariablePickerProps } from "./tokens.types";
import { useDocumentTokens } from "./use-document-tokens";
import { VariableValue } from "./variable-value";

/**
 * Picks a variable for a field: the variables of its type (and scopes), by collection and group,
 * with one search. Hidden variables show only when searched for.
 */
export function VariablePicker({
  type,
  scopes,
  value,
  modes,
  onPick,
  children,
  align = "end",
  side,
  footer,
}: VariablePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { store } = useDocumentTokens();
  const text = query.trim().toLowerCase();
  const fits = (v: VariableRecord) =>
    v.type === type &&
    matchesScopes(v, scopes) &&
    (text ? v.name.toLowerCase().includes(text) : !v.hidden);
  const collections = store
    .collections()
    .map((collection) => ({ collection, variables: store.variables(collection.id).filter(fits) }))
    .filter((entry) => entry.variables.length > 0);

  const pick = (id: string) => {
    onPick(id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} side={side} className="w-64 p-0">
        <div className="border-b border-border p-2">
          <SearchInput
            autoFocus
            size="sm"
            value={query}
            onChange={setQuery}
            placeholder="Search variables"
            aria-label="Search variables"
            className="text-xs"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {collections.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              {store.isEmpty ? "This file has no variables yet." : "No variables fit this field."}
            </p>
          ) : (
            collections.map(({ collection, variables }) => (
              <div key={collection.id} className="flex flex-col">
                <p className="px-2 pt-2 pb-1 text-[11px] font-medium text-muted-foreground uppercase">
                  {collection.name}
                </p>
                <TokenGroupAccordion
                  group={groupTree(variables)}
                  storageKey={`picker:${collection.id}`}
                  defaultOpen={text.length > 0}
                  renderVariable={(variable) => (
                    // eslint-disable-next-line no-restricted-syntax -- bespoke: a variable with its swatch and value
                    <button
                      type="button"
                      onClick={() => pick(variable.id)}
                      className={cn(
                        "flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-xs hover:bg-muted",
                        variable.id === value && "bg-primary/10",
                      )}
                    >
                      <VariableValue variable={variable} modes={modes} />
                      <span className="min-w-0 flex-1 truncate">
                        {variable.name.slice(variable.name.lastIndexOf("/") + 1)}
                      </span>
                      {variable.id === value && <Check className="size-3.5 text-primary" />}
                    </button>
                  )}
                />
              </div>
            ))
          )}
        </div>
        {footer && (
          <div className="border-t border-border p-1" onClick={() => setOpen(false)}>
            {footer}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
