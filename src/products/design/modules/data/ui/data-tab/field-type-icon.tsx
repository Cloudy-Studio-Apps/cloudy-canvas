import {
  Binary,
  Braces,
  Calendar,
  DollarSign,
  FileImage,
  Hash,
  Image,
  Link,
  List,
  Palette,
  ToggleLeft,
  Type,
  type LucideIcon,
} from "lucide-react";

import type { FieldType } from "../../source";
import type { FieldTypeIconProps } from "./field-type-icon.types";

const ICONS: Record<FieldType, LucideIcon> = {
  text: Type,
  integer: Hash,
  number: Hash,
  currency: DollarSign,
  boolean: ToggleLeft,
  date: Calendar,
  color: Palette,
  url: Link,
  "image-url": Image,
  "image-base64": Binary,
  "image-file": FileImage,
  list: List,
  object: Braces,
};

/** The icon that says what a field holds. */
export function FieldTypeIcon({ type, className }: FieldTypeIconProps) {
  const Icon = ICONS[type];
  return <Icon className={className} />;
}
