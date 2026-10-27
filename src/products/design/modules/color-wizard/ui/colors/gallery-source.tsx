import { Sparkles } from "lucide-react";
import { useMemo } from "react";

import { usePaletteFavoritesStore } from "@shared/stores/palette-favorites-store";
import { Button, cn, EmptyState } from "@shared/ui/kit";
import { GALLERY_CATEGORIES, GALLERY_PAGE, galleryPalettes, type GalleryCategory } from "../..";
import { takePalette, useColorWizardStore } from "../store";
import { GalleryCard } from "./gallery-card";
import { t } from "../../color-wizard.i18n";

const FAVORITES = "favorites";
const GROUPS = ["Styles", "Seasons", "Themes"] as const;
const GROUP_LABELS = {
  Styles: t("sources.gallery.groupStyles"),
  Seasons: t("sources.gallery.groupSeasons"),
  Themes: t("sources.gallery.groupThemes"),
};
const keyOf = (colors: readonly string[]) => colors.join("-");

/** Palettes by style, season and theme (and the saved ones), more on demand. */
export function GallerySource() {
  const gallery = useColorWizardStore((s) => s.gallery);
  const picked = useColorWizardStore((s) => s.picked);
  const set = useColorWizardStore((s) => s.set);
  const favorites = usePaletteFavoritesStore((s) => s.palettes);
  const toggle = usePaletteFavoritesStore((s) => s.toggle);
  const category: GalleryCategory | undefined = GALLERY_CATEGORIES.find(
    (c) => c.id === gallery.category,
  );
  const palettes = useMemo(
    () => (category ? galleryPalettes(category, gallery.pages * GALLERY_PAGE) : favorites),
    [category, gallery.pages, favorites],
  );
  const saved = new Set(favorites.map(keyOf));
  const tab = (id: string, label: string, count?: number) => (
    <Button
      key={id}
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-between font-normal",
        gallery.category === id && "bg-primary-soft font-semibold text-primary-soft-foreground",
      )}
      onClick={() => set({ gallery: { category: id, pages: 1 } })}
    >
      {label}
      {count !== undefined && <span className="text-[11px] text-muted-foreground">{count}</span>}
    </Button>
  );
  return (
    <div className="grid h-full min-h-0 grid-cols-[180px_minmax(0,1fr)]">
      <nav className="overflow-auto border-r border-border p-2">
        {tab(FAVORITES, t("sources.gallery.favorites"), favorites.length)}
        {GROUPS.map((group) => (
          <div key={group}>
            <div className="px-2 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {GROUP_LABELS[group]}
            </div>
            {GALLERY_CATEGORIES.filter((c) => c.group === group).map((c) => tab(c.id, c.label))}
          </div>
        ))}
      </nav>
      <div className="relative overflow-auto px-4 pt-3.5 pb-16">
        <h2 className="text-base font-semibold">
          {category
            ? t("sources.gallery.palettes", { name: category.label })
            : t("sources.gallery.favorites")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {category?.description ?? t("sources.gallery.savedHint")}
        </p>
        {palettes.length ? (
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
            {palettes.map((colors, i) => (
              <GalleryCard
                key={`${keyOf(colors)}-${i}`}
                colors={colors}
                label={category?.label ?? t("sources.gallery.saved")}
                picked={picked === keyOf(colors)}
                saved={saved.has(keyOf(colors))}
                onUse={() => {
                  takePalette(colors.map((hex) => ({ hex })));
                  set({ picked: keyOf(colors) });
                }}
                onToggleSaved={() => toggle(colors)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-6"
            title={t("sources.gallery.emptyTitle")}
            description={t("sources.gallery.emptyHint")}
          />
        )}
        {category && (
          <div className="pointer-events-none sticky bottom-3 mt-4 flex justify-center">
            <Button
              className="pointer-events-auto shadow-popover"
              onClick={() => set({ gallery: { ...gallery, pages: gallery.pages + 1 } })}
            >
              <Sparkles />
              {t("sources.gallery.more")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
