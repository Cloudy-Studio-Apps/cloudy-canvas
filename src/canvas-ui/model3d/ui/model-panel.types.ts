import type { CanvasEngine, ModelData, ModelRotation, ModelTextureSlot } from "@canvas";

export interface ModelPanelProps {
  engine: CanvasEngine<object>;
  id: string;
  data: ModelData;
  /** Asks to convert the model to a PNG (the product shows `ConvertModelDialog` first). */
  onConvert: () => void;
}

/** What the panel shows and does for one model. */
export interface ModelPanelState {
  angle: ModelRotation;
  zoom: number;
  textures: ModelTextureSlot[];
  /** The model is live (its draft is shown). */
  live: boolean;
  /** Fields can be changed. */
  editable: boolean;
  /** Why they can't, for the user (`null` when they can). */
  reason: string | null;
  /** The first change starts the edit; the draft takes it. */
  change(patch: { angle?: ModelRotation; zoom?: number; textures?: ModelTextureSlot[] }): void;
  edit(): void;
  reset(): void;
}

export interface ModelRotationFieldsProps {
  angle: ModelRotation;
  disabled: boolean;
  onChange: (angle: ModelRotation) => void;
}

export interface ModelTextureSlotsProps {
  textures: ModelTextureSlot[];
  disabled: boolean;
  onChange: (textures: ModelTextureSlot[]) => void;
}

export interface ModelTextureRowProps {
  slot: ModelTextureSlot;
  disabled: boolean;
  onChoose: (assetId: string) => void;
}

export interface ConvertModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}
