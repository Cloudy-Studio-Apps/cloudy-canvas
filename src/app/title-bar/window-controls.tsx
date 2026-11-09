import { Minus, Square, SquareStack, X } from "lucide-react";
import { useEffect, useState } from "react";

import { windowChrome } from "@platform";
import { IconButton } from "@shared/ui/kit";
import { cn } from "@shared/ui/lib/utils";
import { t } from "./title-bar.i18n";

/** Minimize, maximize/restore and close, drawn by the app where the system doesn't. */
export function WindowControls() {
  const [maximized, setMaximized] = useState(false);
  useEffect(() => {
    if (!windowChrome) return;
    let live = true;
    void windowChrome.isMaximized().then((value) => live && setMaximized(value));
    const off = windowChrome.onMaximizedChange(setMaximized);
    return () => {
      live = false;
      off();
    };
  }, []);
  if (!windowChrome?.drawsControls) return null;
  const chrome = windowChrome;
  const button = "h-full w-11 rounded-none";
  return (
    <div className="flex h-full shrink-0 items-stretch">
      <IconButton
        label={t("window.minimize")}
        tooltip={false}
        className={button}
        onClick={() => chrome.minimize()}
      >
        <Minus />
      </IconButton>
      <IconButton
        label={maximized ? t("window.restore") : t("window.maximize")}
        tooltip={false}
        className={button}
        onClick={() => chrome.toggleMaximize()}
      >
        {maximized ? <SquareStack /> : <Square />}
      </IconButton>
      <IconButton
        label={t("window.close")}
        tooltip={false}
        className={cn(button, "hover:bg-destructive hover:text-destructive-foreground")}
        onClick={() => chrome.close()}
      >
        <X />
      </IconButton>
    </div>
  );
}
