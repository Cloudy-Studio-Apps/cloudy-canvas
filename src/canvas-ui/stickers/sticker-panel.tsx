import { useState } from "react";

import { SearchInput } from "@shared/ui/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { CustomTab } from "./custom-tab";
import { EmojiTab } from "./emoji-tab";
import type { StickerPanelProps } from "./sticker-picker.types";
import { StickersTab } from "./stickers-tab";
import { t } from "./stickers.i18n";

/** Every sticker, in tabs, with one search for all of them. */
export function StickerPanel({ activeId, onPick }: StickerPanelProps) {
  const [query, setQuery] = useState("");
  const tab = { query: query.trim(), activeId, onPick };

  return (
    <Tabs defaultValue="stickers" className="gap-2">
      <div className="flex flex-col gap-2 px-3 pt-3">
        <SearchInput
          autoFocus
          value={query}
          onChange={setQuery}
          placeholder={t("search.placeholder")}
          aria-label={t("search.label")}
        />
        <TabsList className="w-full">
          <TabsTrigger value="stickers">{t("tabs.stickers")}</TabsTrigger>
          <TabsTrigger value="emojis">{t("tabs.emojis")}</TabsTrigger>
          <TabsTrigger value="custom">{t("tabs.custom")}</TabsTrigger>
        </TabsList>
      </div>
      <div className="h-80 overflow-y-auto">
        <TabsContent value="stickers">
          <StickersTab {...tab} />
        </TabsContent>
        <TabsContent value="emojis">
          <EmojiTab {...tab} />
        </TabsContent>
        <TabsContent value="custom">
          <CustomTab {...tab} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
