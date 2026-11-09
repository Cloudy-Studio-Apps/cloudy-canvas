import type { ShareGuest } from "@canvas";

/** The guest session the app is in, and how many components hold it. */
export interface HeldGuest {
  key: string;
  guest: ShareGuest;
  holders: number;
  /** Given to a file tab, which leaves it when it closes: nothing here leaves it anymore. */
  handedOver: boolean;
}
