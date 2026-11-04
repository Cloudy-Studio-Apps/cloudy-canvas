import { Ban, Info, KeyRound, Lock, ShieldCheck, User } from "lucide-react";

import { ChoiceCards, Field, Input, SegmentedControl } from "@shared/ui/kit";
import type { HttpAuth } from "../../sources";
import { DEFAULT_API_KEY_NAME } from "../../sources";
import { t } from "../../data.i18n";
import type { AuthTabProps } from "./auth-tab.types";
import { SecretInput } from "./secret-input";
import { urlParts } from "./url-parts";

const ICONS: Record<HttpAuth, typeof Ban> = {
  none: Ban,
  apikey: KeyRound,
  bearer: ShieldCheck,
  basic: User,
};
const AUTHS: readonly HttpAuth[] = ["none", "apikey", "bearer", "basic"];

/**
 * Sign in: the usual ways a site asks who you are, as cards, each showing only what it needs.
 * Keys stay on this device and go only to the link's site.
 */
export function AuthTab({ draft, onChange, stored }: AuthTabProps) {
  const host = urlParts(draft.url).host || t("connection.auth.thisSite");
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">{t("connection.auth.intro")}</p>
      <ChoiceCards<HttpAuth>
        label={t("connection.tabs.auth")}
        columns={4}
        value={draft.auth}
        onChange={(auth) => onChange({ ...draft, auth })}
        options={AUTHS.map((value) => {
          const Icon = ICONS[value];
          return {
            value,
            label: t(`connection.auth.kinds.${value}.label`),
            hint: t(`connection.auth.kinds.${value}.hint`),
            picture: <Icon className="size-5 text-muted-foreground" />,
          };
        })}
      />
      {draft.auth === "none" && (
        <p className="flex gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" />
          {t("connection.auth.noneHint")}
        </p>
      )}
      {draft.auth === "apikey" && (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label={t("sources.http.apiKeyName")}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.apiKeyName}
                  placeholder={DEFAULT_API_KEY_NAME}
                  spellCheck={false}
                  onChange={(event) => onChange({ ...draft, apiKeyName: event.target.value })}
                  className="h-8 font-mono text-xs"
                />
              )}
            </Field>
            <SecretInput
              label={t("sources.http.apiKey")}
              value={draft.apiKey}
              stored={stored.has("apiKey")}
              placeholder={t("connection.auth.pasteKey")}
              onChange={(apiKey) => onChange({ ...draft, apiKey })}
            />
          </div>
          <Field label={t("sources.http.apiKeyIn")} hint={t("connection.auth.apiKeyInHint")}>
            <SegmentedControl<"header" | "query">
              label={t("sources.http.apiKeyIn")}
              size="sm"
              value={draft.apiKeyIn}
              onChange={(apiKeyIn) => onChange({ ...draft, apiKeyIn })}
              options={[
                { value: "header", label: t("sources.http.apiKeyInHeader") },
                { value: "query", label: t("sources.http.apiKeyInQuery") },
              ]}
            />
          </Field>
        </>
      )}
      {draft.auth === "bearer" && (
        <SecretInput
          label={t("sources.http.token")}
          value={draft.token}
          stored={stored.has("token")}
          placeholder={t("connection.auth.pasteToken")}
          onChange={(token) => onChange({ ...draft, token })}
        />
      )}
      {draft.auth === "basic" && (
        <div className="grid grid-cols-2 gap-2.5">
          <Field label={t("sources.http.username")}>
            {(id) => (
              <Input
                id={id}
                value={draft.username}
                autoComplete="off"
                onChange={(event) => onChange({ ...draft, username: event.target.value })}
                className="h-8 text-xs"
              />
            )}
          </Field>
          <SecretInput
            label={t("sources.http.password")}
            value={draft.password}
            stored={stored.has("password")}
            onChange={(password) => onChange({ ...draft, password })}
          />
        </div>
      )}
      {draft.auth !== "none" && (
        <p className="flex gap-1.5 text-xs text-muted-foreground">
          <Lock className="mt-px size-3.5 shrink-0" />
          {t("connection.auth.secretNote", { host })}
        </p>
      )}
    </div>
  );
}
