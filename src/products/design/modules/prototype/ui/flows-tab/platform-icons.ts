import { Globe, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";

import type { PrototypePlatform } from "../../model";

/** The icon of each platform a flow plays on. */
export const PLATFORM_ICONS: Record<PrototypePlatform, LucideIcon> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  web: Globe,
};
