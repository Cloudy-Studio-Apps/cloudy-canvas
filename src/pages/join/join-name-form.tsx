import { useId, useState, type FormEvent } from "react";

import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { Button } from "@shared/ui/components/ui/button";
import { Input } from "@shared/ui/components/ui/input";

/** Asks the user's name once, before their first live session (Settings › Collaboration later). */
export function JoinNameForm() {
  const setName = useCollaborationStore((s) => s.setName);
  const [draft, setDraft] = useState("");
  const id = useId();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (draft.trim()) setName(draft);
  };

  return (
    <form
      onSubmit={submit}
      className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Join a live session</h1>
        <label htmlFor={id} className="block text-sm text-muted-foreground">
          What name should the others see?
        </label>
      </div>
      <div className="flex w-full max-w-xs gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Your name"
          maxLength={40}
          autoFocus
        />
        <Button type="submit" disabled={!draft.trim()}>
          Join
        </Button>
      </div>
    </form>
  );
}
