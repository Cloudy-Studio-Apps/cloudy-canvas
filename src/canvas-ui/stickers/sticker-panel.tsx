import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@shared/ui/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/components/ui/tabs";
import { CustomTab } from "./custom-tab";
import { EmojiTab } from "./emoji-tab";
import type { StickerPanelProps } from "./sticker-picker.types";
import { StickersTab } from "./stickers-tab";

/** Every sticker, in tabs, with one search for all of them. */
export function StickerPanel({ activeId, onPick }: StickerPanelProps) {
  const [query, setQuery] = useState("");
  const tab = { query: query.trim(), activeId, onPick };

  return (
    <Tabs defaultValue="stickers" className="gap-2">
      <div className="flex flex-col gap-2 px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stickers and emojis"
            aria-label="Search stickers"
            className="pl-8"
          />
        </div>
        <TabsList className="w-full">
          <TabsTrigger value="stickers">Stickers</TabsTrigger>
          <TabsTrigger value="emojis">Emojis</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
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
