import {
  Braces,
  Cloud,
  Database,
  File,
  FileSpreadsheet,
  FileText,
  Globe,
  Link,
  Sheet,
  Table,
  type LucideIcon,
} from "lucide-react";

import type { SourceIconProps } from "./source-icon.types";

/** The icons a source type can name (`DataSourceType.icon`); add here when a type needs another. */
const ICONS: Record<string, LucideIcon> = {
  Braces,
  Cloud,
  Database,
  File,
  FileSpreadsheet,
  FileText,
  Globe,
  Link,
  Sheet,
  Table,
};

/** The icon for a source type's `icon` name; an unknown name gets the database icon. */
export function SourceIcon({ name, className }: SourceIconProps) {
  const Icon = ICONS[name] ?? Database;
  return <Icon className={className} />;
}
