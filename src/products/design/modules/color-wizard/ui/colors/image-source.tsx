import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAssetUrl } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { toast } from "@shared/stores/toast-store";
import { cn, IconButton, SegmentedControl, type SegmentedOption } from "@shared/ui/kit";
import { collectImages, type ImageMood } from "../..";
import { useColorWizardStore } from "../store";
import { ImagePins } from "./image-pins";
import { ImageThumb } from "./image-thumb";
import { SectionLabel } from "./section-label";
import { t } from "../../color-wizard.i18n";

const MOODS: readonly SegmentedOption<ImageMood>[] = [
  { value: "balanced", label: t("sources.image.balanced") },
  { value: "vivid", label: t("sources.image.vivid") },
  { value: "muted", label: t("sources.image.muted") },
];

/** Reads colors from a picture chosen, dropped or pasted (kept out of the file). */
function takeImageFile(file: File | undefined): void {
  if (!file?.type.startsWith("image/")) {
    toast({ title: t("sources.image.notImage"), tone: "error" });
    return;
  }
  const { image, set } = useColorWizardStore.getState();
  set({ image: { ...image, assetId: null, upload: URL.createObjectURL(file), readFrom: null } });
}

/** Colors from a picture: one of the file's, or one chosen, dropped or pasted. */
export function ImageSource() {
  const engine = useDesignEngine();
  const image = useColorWizardStore((s) => s.image);
  const set = useColorWizardStore((s) => s.set);
  const images = useMemo(() => collectImages(engine.doc), [engine]);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const picked = image.assetId ?? (image.upload ? null : (images[0]?.assetId ?? null));
  const assetUrl = useAssetUrl(picked);
  const url = image.upload ?? assetUrl;

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = [...(event.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) takeImageFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionLabel aside={images.length}>{t("sources.image.images")}</SectionLabel>
      <div className="grid grid-cols-5 gap-1.5">
        {images.map((img) => (
          <ImageThumb
            key={img.assetId}
            image={img}
            selected={!image.upload && picked === img.assetId}
            onPick={() =>
              set({ image: { ...image, assetId: img.assetId, upload: null, readFrom: null } })
            }
          />
        ))}
        <IconButton
          label={t("sources.image.choose")}
          variant="outline"
          className="aspect-square size-auto border-dashed"
          onClick={() => input.current?.click()}
        >
          <Plus />
        </IconButton>
      </div>
      {url ? (
        <ImagePins url={url} />
      ) : (
        <p className="text-xs text-muted-foreground">{t("sources.image.noImages")}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>{t("sources.image.mood")}</SectionLabel>
        <SegmentedControl
          label={t("sources.image.favor")}
          size="sm"
          value={image.mood}
          options={MOODS}
          onChange={(mood) => set({ image: { ...image, mood } })}
        />
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          takeImageFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "rounded-lg border border-dashed border-border-strong px-3 py-5 text-center text-xs text-muted-foreground",
          over && "border-primary bg-primary-soft text-primary-soft-foreground",
        )}
      >
        {t("sources.image.drop")}
      </div>
      <p className="text-xs text-muted-foreground">{t("sources.image.dragPin")}</p>
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the hidden file input behind "Choose an image…" */}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          takeImageFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
