import { useEffect, useMemo } from "react";
import { Copy, House, RotateCw } from "lucide-react";
import { useNavigate, useRouteError } from "react-router";

import { useAppInfo, versionDetails } from "@shared/about";
import { AdriftSeal } from "@shared/ui/brand/adrift-seal";
import { Button } from "@shared/ui/components/ui/button";
import { copyError } from "./copy-error";
import { describeError } from "./describe-error";
import { errorCode } from "./error-code";
import { ErrorCodeBlock } from "./error-code-block";
import { ErrorDetails } from "./error-details";
import { t } from "./error.i18n";

const DEV = import.meta.env.DEV;

/** What a route shows when it throws: the seal adrift, the way out, and the stack (dev) or a code. */
export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const described = useMemo(() => describeError(error), [error]);
  const code = useMemo(() => errorCode(described), [described]);
  const version = versionDetails(useAppInfo()).join(" · ");

  useEffect(() => {
    // React Router logs it in development; production keeps it in the console under its code.
    if (!DEV) console.error(`[error ${code}]`, error);
  }, [code, error]);

  const copy = () =>
    copyError(
      DEV
        ? [
            described.message,
            "",
            ...described.frames,
            "",
            `${version} · ${location.pathname}`,
          ].join("\n")
        : code,
    );

  return (
    <main className="grid min-h-svh place-items-center overflow-y-auto bg-background px-4 py-10">
      <div className="grid w-full max-w-[600px] justify-items-center gap-6 text-center">
        <AdriftSeal width={360} className="max-w-full" />

        <div className="grid gap-2">
          <p className="font-mono text-xs tracking-wider text-destructive uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-balance">{t("title")}</h1>
          <p className="mx-auto max-w-[46ch] text-md text-pretty text-muted-foreground">
            {t("lead")}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => window.location.reload()}>
            <RotateCw />
            {t("actions.reload")}
          </Button>
          <Button variant="outline" onClick={() => void navigate("/")}>
            <House />
            {t("actions.home")}
          </Button>
          <Button variant="outline" onClick={copy}>
            <Copy />
            {DEV ? t("actions.copyDetails") : t("actions.copyCode")}
          </Button>
        </div>

        {DEV ? (
          <ErrorDetails error={described} version={version} />
        ) : (
          <ErrorCodeBlock code={code} />
        )}
      </div>
    </main>
  );
}
