import { useId, useState } from "react";
import { Dices } from "lucide-react";

import { randomPersonName } from "@shared/core";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { PattingSeal } from "@shared/ui/brand/patting-seal";
import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { Input } from "@shared/ui/components/ui/input";

/**
 * Asks for the name others see in live sessions, once, when the app starts without one. It starts
 * with a random name, which is kept when the dialog is dismissed.
 */
export function NamePrompt() {
  const name = useCollaborationStore((s) => s.name);
  const setName = useCollaborationStore((s) => s.setName);
  const [draft, setDraft] = useState(randomPersonName);
  const inputId = useId();

  const save = () => setName(draft.trim() || randomPersonName());

  return (
    <Dialog open={!name} onOpenChange={(open) => !open && save()}>
      <DialogContent className="sm:max-w-sm">
        <form
          className="grid"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <DialogHeader className="items-center border-b-0 px-10 pt-6 pb-2 text-center sm:text-center">
            <PattingSeal size={96} className="mt-2 mb-3" />
            <DialogTitle>What should others call you?</DialogTitle>
            <DialogDescription>
              Shown to the people in live sessions you host or join. You can change it any time in
              Settings › Collaboration.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 px-4 py-4">
            <label htmlFor={inputId} className="sr-only">
              Your name
            </label>
            <Input
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={(event) => event.target.select()}
              maxLength={40}
              autoFocus
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Another name"
              title="Another name"
              onClick={() => setDraft(randomPersonName())}
            >
              <Dices />
            </Button>
          </div>
          <DialogFooter className="border-t-0 px-4 pt-0 pb-4">
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
