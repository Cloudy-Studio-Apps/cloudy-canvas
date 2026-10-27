import { useId, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Users } from "lucide-react";

import { encodeShareTicket, readShareTicket } from "@shared/core";
import { Button } from "@shared/ui/components/ui/button";
import { Input } from "@shared/ui/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { t } from "../home.i18n";

/** Joins a live session from a link pasted from a message (links usually open the app directly). */
export function JoinSessionButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const ticket = readShareTicket(draft);
    if (!ticket) {
      setError(t("join.invalid"));
      return;
    }
    setOpen(false);
    void navigate(`/join/${encodeShareTicket(ticket)}`);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setDraft("");
        setError(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Users />
          {t("join.button")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <form onSubmit={submit} className="space-y-2">
          <label htmlFor={id} className="text-sm font-medium">
            {t("join.title")}
          </label>
          <p className="text-sm text-muted-foreground">{t("join.hint")}</p>
          <Input
            id={id}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            placeholder="cloudy-canvas://join/…"
            aria-invalid={error ? true : undefined}
            spellCheck={false}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              {t("join.button")}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
