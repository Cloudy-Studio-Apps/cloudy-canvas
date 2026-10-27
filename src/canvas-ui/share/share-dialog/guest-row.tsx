import { X } from "lucide-react";

import type { ShareRole } from "@shared/core";
import { Button } from "@shared/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { PeerPathLabel } from "./peer-path-label";
import { PersonBadge } from "./person-badge";
import type { GuestRowProps } from "./share-dialog.types";
import { usePeerPath } from "./use-peer-path";
import { t } from "../share.i18n";

/** A guest in the session: who, how they're connected, their role, and Remove. */
export function GuestRow({ host, guest }: GuestRowProps) {
  const path = usePeerPath(host, guest.peer);
  return (
    <li className="flex items-center gap-2 py-1.5">
      <PersonBadge identity={guest.identity} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{guest.identity.name}</p>
        <PeerPathLabel path={path} />
      </div>
      <Select
        value={guest.role}
        onValueChange={(role) => host.setRole(guest.peer, role as ShareRole)}
      >
        <SelectTrigger
          className="h-7 w-28"
          aria-label={t("guest.role", { name: guest.identity.name })}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="edit">{t("guest.edit")}</SelectItem>
          <SelectItem value="view">{t("guest.view")}</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label={t("guest.remove", { name: guest.identity.name })}
        title={t("guest.removeHint")}
        onClick={() => host.remove(guest.peer)}
      >
        <X />
      </Button>
    </li>
  );
}
