import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Eye, Layers, Plus, Trash2 } from "lucide-react";

import {
  AppDialog,
  Button,
  Checkbox,
  ChoiceCards,
  EmptyState,
  Field,
  FieldBox,
  IconButton,
  Input,
  ListRow,
  NumberInput,
  SearchInput,
  Section as PanelSection,
  SegmentedControl,
  SelectableCard,
  Swatch,
  Toolbar,
  ToolbarGroup,
} from "@shared/ui/kit";
import { Labeled, Section } from "./section-layout";

const ALIGN = [
  { value: "left", label: "Left", icon: <AlignLeft /> },
  { value: "center", label: "Center", icon: <AlignCenter /> },
  { value: "right", label: "Right", icon: <AlignRight /> },
] as const;

/** Every component of `@shared/ui/kit` (what plugins get as `api.ui.kit`). */
export function KitSection() {
  const [align, setAlign] = useState<string>("left");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(true);
  const [picked, setPicked] = useState("a");
  const [row, setRow] = useState("frame");
  const [dialog, setDialog] = useState(false);
  const [width, setWidth] = useState(630);
  const [opacity, setOpacity] = useState(0.8);
  const [choice, setChoice] = useState<string>("rows");

  return (
    <Section
      title="Kit"
      description="@shared/ui/kit: what the app's chrome and plugins build with. Switch the theme above to check each one."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <Labeled label="IconButton xs · sm · md · lg · active">
            <div className="flex items-center gap-1">
              {(["xs", "sm", "md", "lg"] as const).map((size) => (
                <IconButton key={size} size={size} label={`Add (${size})`} shortcut="A">
                  <Plus />
                </IconButton>
              ))}
              <IconButton label="Visible" active>
                <Eye />
              </IconButton>
            </div>
          </Labeled>
          <Labeled label="SegmentedControl">
            <div className="flex gap-2">
              <SegmentedControl label="Align" value={align} onChange={setAlign} options={ALIGN} />
              <SegmentedControl
                label="Align"
                value={align}
                onChange={setAlign}
                options={ALIGN}
                iconOnly
                size="sm"
              />
            </div>
          </Labeled>
          <Field label="Field" hint="A hint under the control.">
            {(id) => <Input id={id} placeholder="Name" />}
          </Field>
          <Field label="Inline field" layout="inline" hint="Label and hint left, control right.">
            <Checkbox checked={checked} onCheckedChange={setChecked} label="Enabled" />
          </Field>
          <Labeled label="NumberInput: drag W or % sideways (Shift ×10), Up/Down, type 120+24">
            <div className="flex items-center gap-2">
              <NumberInput
                className="w-24"
                label="Width"
                prefix="W"
                value={width}
                min={0}
                onChange={setWidth}
              />
              <NumberInput
                className="w-24"
                label="Opacity"
                suffix="%"
                value={opacity}
                min={0}
                max={1}
                factor={100}
                decimals={0}
                onChange={setOpacity}
              />
            </div>
          </Labeled>
          <Labeled label="SearchInput · FieldBox · Swatch">
            <div className="flex items-center gap-2">
              <SearchInput value={query} onChange={setQuery} size="sm" className="w-48" />
              <FieldBox className="w-24">
                <span className="text-muted-foreground">W</span>
                {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the FieldBox demo needs a bare input */}
                <input className="w-full bg-transparent outline-none" defaultValue="120" />
              </FieldBox>
              <Swatch color="#3574f0" />
              <Swatch color="rgb(229 72 77 / 0.5)" round />
            </div>
          </Labeled>
          <Labeled label="Toolbar">
            <Toolbar label="Sample tools">
              <ToolbarGroup>
                <IconButton size="lg" label="Layers" active>
                  <Layers />
                </IconButton>
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton size="lg" label="Delete">
                  <Trash2 />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </Labeled>
        </div>
        <div className="space-y-5">
          <div className="rounded-card border bg-surface">
            <PanelSection
              title="Section"
              actions={
                <IconButton size="xs" label="Add">
                  <Plus />
                </IconButton>
              }
            >
              {["frame", "rectangle", "text"].map((id, i) => (
                <ListRow
                  key={id}
                  depth={i}
                  icon={<Layers />}
                  label={`ListRow ${id}`}
                  meta={i + 1}
                  selected={row === id}
                  onSelect={() => setRow(id)}
                  actions={
                    <IconButton size="xs" label="Hide" tooltip={false}>
                      <Eye />
                    </IconButton>
                  }
                />
              ))}
            </PanelSection>
            <PanelSection title="Collapsible section" collapsible defaultOpen={false}>
              <p className="text-xs text-muted-foreground">Folded content.</p>
            </PanelSection>
            <EmptyState icon={<Layers />} title="EmptyState" description="Nothing here yet." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["a", "b"].map((id) => (
              <SelectableCard
                key={id}
                selected={picked === id}
                onSelect={() => setPicked(id)}
                media={<div className="h-12" />}
                title={`Card ${id.toUpperCase()}`}
                description="SelectableCard"
              />
            ))}
            <SelectableCard title="Later" comingSoon />
          </div>
          <Labeled label="ChoiceCards">
            <ChoiceCards
              label="Layout"
              value={choice}
              onChange={setChoice}
              columns={3}
              options={["rows", "columns", "grid"].map((value) => ({
                value,
                label: value[0]!.toUpperCase() + value.slice(1),
                hint: "A hint",
                picture: <div className="h-8 w-12 rounded-xs border border-current opacity-60" />,
              }))}
            />
          </Labeled>
          <Button variant="outline" onClick={() => setDialog(true)}>
            Open AppDialog
          </Button>
          <AppDialog
            open={dialog}
            onOpenChange={setDialog}
            title="AppDialog"
            description="A title, a body and the buttons."
            footer={
              <>
                <Button variant="ghost" onClick={() => setDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialog(false)}>Done</Button>
              </>
            }
          >
            <p className="text-sm">The body scrolls past 70% of the window.</p>
          </AppDialog>
        </div>
      </div>
    </Section>
  );
}
