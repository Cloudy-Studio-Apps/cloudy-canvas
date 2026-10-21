import { CircleAlert } from "lucide-react";

import { useToastStore } from "@shared/stores/toast-store";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@shared/ui/components/ui/toast";

/** Errors stay a little longer than notices, so there's time to read them. */
const DURATION = { info: 4000, error: 8000 } as const;

/** Shows the toasts of the toast store in the bottom-right corner. Mounted once by the app. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, tone, action }) => (
        <Toast
          key={id}
          duration={DURATION[tone]}
          onOpenChange={(open) => {
            if (!open) dismiss(id);
          }}
        >
          {tone === "error" && <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />}
          <div className="min-w-0 flex-1 space-y-0.5">
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action && (
            <ToastAction altText={action.label} onClick={action.run}>
              {action.label}
            </ToastAction>
          )}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
