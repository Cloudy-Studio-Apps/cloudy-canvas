import { onColor } from "../..";
import type { PreviewProps } from "./preview.types";

/** A banking app's home screen in a phone. */
export function MobilePreview({ p }: PreviewProps) {
  const { t, deco, text, body } = p;
  const row = (color: string, title: string, sub: string, amount: string) => (
    <div
      key={title}
      className="flex items-center gap-2.5 py-2.5"
      style={{ borderBottom: `1px solid ${t("border")}` }}
    >
      <span
        className="grid size-8.5 place-items-center rounded-lg"
        style={{ background: `color-mix(in oklch, ${color} 22%, ${t("surface")})` }}
      >
        <span className="size-3 rounded-xs" style={{ background: color }} />
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-semibold">{title}</div>
        <div className="text-[11px]" style={{ color: t("muted-foreground") }}>
          {sub}
        </div>
      </div>
      <b className="text-[13px]">{amount}</b>
    </div>
  );
  const tab = (label: string, on = false) => (
    <span
      key={label}
      className="flex-1 text-center text-[10px]"
      style={{ color: on ? t("primary") : t("muted-foreground"), fontWeight: on ? 700 : 500 }}
    >
      <span
        className="mx-auto mb-0.5 block size-4.5 rounded-sm"
        style={{
          background: on ? t("primary") : "transparent",
          border: `1.5px solid ${on ? t("primary") : t("muted-foreground")}`,
        }}
      />
      {label}
    </span>
  );
  return (
    <div className="h-150 w-75 shrink-0 rounded-[36px] bg-foreground p-2.5 shadow-popover">
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[28px]"
        style={{ background: t("background"), color: t("foreground"), fontFamily: body }}
      >
        <div className="flex justify-between px-5.5 pt-3 pb-1 text-[11px] font-semibold">
          <span>9:41</span>
          <span>●●● ▮</span>
        </div>
        <div className="px-4.5 pt-2">
          <div className="text-xs" style={{ color: t("muted-foreground") }}>
            Good morning
          </div>
          <div style={text("2xl", 24)}>Ada</div>
        </div>
        <div
          className="relative mx-4.5 my-3 overflow-hidden rounded-lg p-4"
          style={{ background: t("primary"), color: t("primary-foreground") }}
        >
          <span
            className="absolute -top-10 -right-7.5 size-30 rounded-full opacity-50"
            style={{ background: deco[1 % deco.length] }}
          />
          <div className="relative text-[11px] opacity-85">Total balance</div>
          <div className="relative" style={{ ...text("2xl", 26), color: t("primary-foreground") }}>
            $12,480.20
          </div>
          <div className="relative mt-2.5 flex gap-1.5">
            <span
              className="rounded-md px-2.5 py-1 text-[11px] font-bold"
              style={{ background: t("primary-foreground"), color: t("primary") }}
            >
              Send
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-[11px] font-semibold"
              style={{ border: `1px solid ${t("primary-foreground")}` }}
            >
              Request
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden px-4.5">
          <div className="flex items-baseline justify-between">
            <b className="text-[13px]">Recent</b>
            <span className="text-[11px]" style={{ color: t("primary") }}>
              See all
            </span>
          </div>
          {row(deco[0]!, "Coffee Lab", "Today · Food", "−$4.20")}
          {row(deco[2 % deco.length]!, "Salary", "Yesterday · Income", "+$3,200")}
          {row(t("warning"), "Electric bill", "Due in 3 days", "−$62.00")}
          {row(deco[3 % deco.length]!, "Bookstore", "Mon · Shopping", "−$18.90")}
        </div>
        <span
          className="absolute right-4.5 bottom-19 grid size-11.5 place-items-center rounded-xl text-2xl shadow-popover"
          style={{ background: t("accent"), color: onColor(t("accent")) }}
        >
          +
        </span>
        <div
          className="flex px-2 pt-2.5 pb-4.5"
          style={{ background: t("surface"), borderTop: `1px solid ${t("border")}` }}
        >
          {tab("Home", true)}
          {tab("Cards")}
          {tab("Stats")}
          {tab("Profile")}
        </div>
      </div>
    </div>
  );
}
