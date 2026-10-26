import { Grid3x3, Image, Layers, Tag, Upload, Aperture } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/kit";
import { useColorWizardStore, type SourceTab } from "../store";
import type { SourceTabEntry } from "./colors.types";
import { BrandSource } from "./brand-source";
import { FileSource } from "./file-source";
import { GallerySource } from "./gallery-source";
import { ImageSource } from "./image-source";
import { ImportSource } from "./import-source";
import { WheelSource } from "./wheel-source";

const TABS: readonly SourceTabEntry[] = [
  { id: "wheel", label: "Wheel", icon: Aperture, panel: () => <WheelSource /> },
  { id: "brand", label: "Brand", icon: Tag, panel: () => <BrandSource /> },
  { id: "image", label: "Image", icon: Image, panel: () => <ImageSource /> },
  { id: "file", label: "This file", icon: Layers, panel: () => <FileSource /> },
  { id: "gallery", label: "Gallery", icon: Grid3x3, panel: () => <GallerySource /> },
  { id: "import", label: "Import", icon: Upload, panel: () => <ImportSource /> },
];

/** Where the colors come from, one tab each. */
export function SourceTabs() {
  const tab = useColorWizardStore((s) => s.tab);
  const set = useColorWizardStore((s) => s.set);
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => set({ tab: value as SourceTab })}
      className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-0"
    >
      <TabsList className="mx-2 mt-1.5 w-auto justify-start overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <TabsTrigger key={id} value={id} className="gap-1.5">
            <Icon className="size-3.5" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map(({ id, panel }) => (
        <TabsContent key={id} value={id} className="min-h-0 overflow-auto">
          {tab === id && panel()}
        </TabsContent>
      ))}
    </Tabs>
  );
}
