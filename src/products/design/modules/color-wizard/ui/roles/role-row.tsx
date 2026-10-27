import { CommitInput } from "@canvas-ui";
import { Badge, Checkbox, cn, Swatch } from "@shared/ui/kit";
import { cleanRoleName } from "../..";
import { useColorWizardStore } from "../store";
import type { RoleRowProps } from "./roles.types";
import { ShadeStrip } from "./shade-strip";
import { t } from "../../color-wizard.i18n";

/** One palette color: included or not, its role name, and its shades. */
export function RoleRow({ role, index, exists }: RoleRowProps) {
  const roles = useColorWizardStore((s) => s.roles);
  const shades = useColorWizardStore((s) => s.options.shades);
  const set = useColorWizardStore((s) => s.set);
  const update = (patch: Partial<typeof role>) =>
    set({ roles: roles.map((r, i) => (i === index ? { ...r, ...patch } : r)) });
  return (
    <div
      className={cn(
        "grid grid-cols-[20px_32px_170px_minmax(0,1fr)] items-center gap-2.5 border-b border-border py-2.5",
        !role.include && "opacity-45",
      )}
    >
      <Checkbox
        checked={role.include}
        onCheckedChange={(include) => update({ include })}
        aria-label={t("roles.row.include", { name: role.name })}
      />
      <Swatch color={role.hex} className="size-8 rounded-md" />
      <div className="flex min-w-0 flex-col gap-1">
        <CommitInput
          value={role.name}
          aria-label={t("roles.row.name")}
          spellCheck={false}
          className="h-7 rounded-md border border-input bg-surface px-2 text-xs"
          onCommit={(text) => {
            const name = cleanRoleName(text);
            if (!name) return t("roles.row.nameRequired");
            if (roles.some((r, i) => i !== index && r.name === name))
              return t("roles.row.taken", { name });
            update({ name });
          }}
        />
        {exists && (
          <Badge variant="outline" className="self-start text-warning" title={t("roles.row.hint")}>
            {t("roles.row.updates")}
          </Badge>
        )}
      </div>
      <ShadeStrip hex={role.hex} group={role.name} shades={shades} />
    </div>
  );
}
