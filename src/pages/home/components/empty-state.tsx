import { SealLogo } from "@ui/brand/seal-logo";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border-strong bg-surface/50 px-6 py-14 text-center">
      <SealLogo size={72} className="mb-4" />
      <p className="text-sm font-medium">No files yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Create your first board or design.</p>
    </div>
  );
}
