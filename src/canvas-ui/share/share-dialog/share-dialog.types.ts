import type { ShareGuestInfo, ShareHost, ShareKnock } from "@canvas";
import type { FileType, PeerPath, ShareIdentity } from "@shared/core";
import type { LiveFile } from "../../file";

export interface ShareButtonProps {
  product: FileType;
  /** `tool`: an icon button (the board's top bar); `button`: a labelled one (the design's). */
  look: "tool" | "button";
}

export interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: FileType;
}

export interface StartSharingProps {
  product: FileType;
}

export interface HostingPanelProps {
  host: ShareHost;
}

export interface GuestRowProps {
  host: ShareHost;
  guest: ShareGuestInfo;
}

export interface ShareKnocksProps {
  host: ShareHost;
}

export interface KnockCardProps {
  host: ShareHost;
  knock: ShareKnock;
}

export interface PersonBadgeProps {
  identity: ShareIdentity;
}

export interface PeerPathLabelProps {
  path: PeerPath | null;
}

export interface LiveBadgeProps {
  live: LiveFile;
}

export interface HostedCountProps {
  host: ShareHost;
}
