import { PreviewButton as B } from "./preview-button";
import type { PreviewProps } from "./preview.types";

/** A landing page: navbar, hero with a picture, feature cards, a newsletter form, a footer. */
export function WebsitePreview({ p }: PreviewProps) {
  const { t, deco, text, body } = p;
  const feature = (color: string, title: string, line: string) => (
    <div
      key={title}
      className="rounded-lg p-4"
      style={{ background: t("surface"), border: `1px solid ${t("border")}` }}
    >
      <div
        className="mb-2.5 grid size-7.5 place-items-center rounded-md"
        style={{ background: `color-mix(in oklch, ${color} 22%, ${t("surface")})` }}
      >
        <div className="size-3 rounded-xs" style={{ background: color }} />
      </div>
      <div style={text("lg", 18)}>{title}</div>
      <div className="text-[13px]" style={{ color: t("muted-foreground") }}>
        {line}
      </div>
    </div>
  );
  return (
    <div
      className="w-full max-w-[860px] overflow-hidden rounded-lg"
      style={{
        background: t("background"),
        color: t("foreground"),
        fontFamily: body,
        border: `1px solid ${t("border")}`,
      }}
    >
      <nav
        className="flex flex-wrap items-center gap-4.5 px-5 py-3"
        style={{ background: t("surface"), borderBottom: `1px solid ${t("border")}` }}
      >
        <b className="flex items-center gap-2" style={text("lg", 17)}>
          <span className="size-4.5 rounded-sm" style={{ background: t("primary") }} />
          Northwind
        </b>
        <span className="text-[13px]">Product</span>
        <span className="text-[13px]" style={{ color: t("muted-foreground") }}>
          Pricing
        </span>
        <span className="text-[13px]" style={{ color: t("muted-foreground") }}>
          Blog
        </span>
        <span className="flex-1" />
        <B bg="transparent" fg={t("foreground")} border={t("border")}>
          Sign in
        </B>
        <B bg={t("primary")} fg={t("primary-foreground")}>
          Get started
        </B>
      </nav>
      <section
        className="grid items-center gap-7 px-5 py-9"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
      >
        <div>
          <span
            className="mb-3 inline-block rounded-md px-2 py-0.5 text-xs font-semibold"
            style={{ background: t("primary-soft"), color: t("primary") }}
          >
            New · Version 2.0
          </span>
          <div className="mb-2.5" style={text("3xl", 42)}>
            Plan, ship and grow in one place
          </div>
          <div className="mb-4.5" style={{ ...text("md"), color: t("muted-foreground") }}>
            Everything your team needs to move from idea to launch, without the busywork.
          </div>
          <div className="flex flex-wrap gap-2">
            <B bg={t("primary")} fg={t("primary-foreground")}>
              Start free trial
            </B>
            <B bg={t("surface")} fg={t("foreground")} border={t("border")}>
              Book a demo
            </B>
          </div>
          <div className="mt-3.5 text-xs" style={{ color: t("muted-foreground") }}>
            <span className="underline" style={{ color: t("primary") }}>
              Read the changelog
            </span>{" "}
            · No card needed
          </div>
        </div>
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-lg"
          style={{ background: `linear-gradient(135deg, ${deco.join(", ")})` }}
        >
          <div
            className="absolute right-4 bottom-4 left-[30%] rounded-lg p-3 shadow-popover"
            style={{ background: t("surface"), color: t("foreground") }}
          >
            <div className="text-xs" style={{ color: t("muted-foreground") }}>
              Revenue this month
            </div>
            <div style={text("xl", 24)}>$48,210</div>
            <div className="text-xs font-semibold" style={{ color: t("success") }}>
              ▲ 12.4%
            </div>
          </div>
        </div>
      </section>
      <section
        className="grid gap-3 px-5 pb-7"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        {feature(deco[0]!, "Roadmaps", "See every project on one timeline.")}
        {feature(deco[1 % deco.length]!, "Automations", "Hand the repetitive steps to rules.")}
        {feature(deco[2 % deco.length]!, "Insights", "Know what moved the numbers.")}
      </section>
      <section
        className="mx-5 mb-6 grid items-end gap-4 rounded-lg p-4.5"
        style={{
          background: t("surface"),
          border: `1px solid ${t("border")}`,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div>
          <div style={text("xl", 22)}>Stay in the loop</div>
          <div className="text-[13px]" style={{ color: t("muted-foreground") }}>
            One email a month. Unsubscribe any time.
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold">Email</div>
          <div className="flex gap-2">
            <span
              className="flex h-8.5 flex-1 items-center rounded-md px-2.5 text-[13px]"
              style={{
                border: `1px solid ${t("border")}`,
                color: t("muted-foreground"),
                background: t("background"),
              }}
            >
              you@company.com
            </span>
            <B bg={t("primary")} fg={t("primary-foreground")}>
              Subscribe
            </B>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className="grid size-3.5 place-items-center rounded-xs text-[10px]"
              style={{ background: t("primary"), color: t("primary-foreground") }}
            >
              ✓
            </span>
            I agree to the privacy policy
          </div>
        </div>
      </section>
      <footer
        className="flex flex-wrap gap-4 px-5 py-3.5 text-xs"
        style={{ borderTop: `1px solid ${t("border")}`, color: t("muted-foreground") }}
      >
        <span>© 2026 Northwind</span>
        <span className="flex-1" />
        <span>Privacy</span>
        <span>Terms</span>
        <span>Contact</span>
      </footer>
    </div>
  );
}
