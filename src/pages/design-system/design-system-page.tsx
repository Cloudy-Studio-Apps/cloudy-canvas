import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";

import { SealLogo } from "@ui/brand/seal-logo";
import { Wordmark } from "@ui/brand/wordmark";
import { FileTypeIcon } from "@ui/components/file-type-icon";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui/components/ui/card";
import { Input } from "@ui/components/ui/input";
import { Kbd } from "@ui/components/ui/kbd";
import { Separator } from "@ui/components/ui/separator";
import { RADII, SCALES, SEMANTIC_GROUPS, SHADOWS, STEPS, TYPE_SCALE } from "./tokens";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "accent",
  "destructive",
  "link",
] as const;
const BUTTON_SIZES = ["sm", "default", "lg"] as const;
const BADGE_VARIANTS = [
  "default",
  "secondary",
  "accent",
  "outline",
  "board",
  "design",
  "destructive",
] as const;

/** Dev-only living reference of the design system. */
export function DesignSystemPage() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:px-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" aria-label="Back to home">
                <ArrowLeft />
              </Link>
            </Button>
            <span className="font-semibold tracking-tight">Design system</span>
          </div>
          <Badge variant="outline">dev only</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-6 py-10 sm:px-10">
        <Section title="Logo" description="The foca watona peeking over a canvas.">
          <div className="flex flex-wrap items-end gap-8 rounded-card border bg-surface p-6">
            {[128, 64, 32].map((size) => (
              <Labeled key={size} label={`full · ${size}px`}>
                <SealLogo size={size} />
              </Labeled>
            ))}
            {[24, 16].map((size) => (
              <Labeled key={size} label={`mark · ${size}px`}>
                <SealLogo size={size} variant="mark" />
              </Labeled>
            ))}
            <Separator orientation="vertical" className="h-16!" />
            <Labeled label="wordmark">
              <Wordmark />
            </Labeled>
          </div>
        </Section>

        <Section
          title="Palette"
          description="Raw scales. Only semantic tokens (below) should be used in components."
        >
          <div className="space-y-5">
            {SCALES.map(({ name, role }) => (
              <div key={name} className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-medium">{name}</span>
                  <span className="text-sm text-muted-foreground">{role}</span>
                </div>
                <div className="grid grid-cols-11 overflow-hidden rounded-card border">
                  {STEPS.map((step) => (
                    <div key={step}>
                      <div className="h-12" style={{ backgroundColor: `var(--${name}-${step})` }} />
                      <div className="bg-surface px-1.5 py-1 font-mono text-xs text-muted-foreground">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Semantic tokens"
          description="Use these in components: bg-primary, text-muted-foreground, border-border…"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {SEMANTIC_GROUPS.map((group) => (
              <Card key={group.title}>
                <CardHeader className="pb-3">
                  <CardTitle>{group.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
                  {group.tokens.map((token) => (
                    <div key={token} className="flex items-center gap-2">
                      <span
                        className="size-7 shrink-0 rounded-md border"
                        style={{ backgroundColor: `var(--${token})` }}
                      />
                      <span className="truncate font-mono text-xs">{token}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Typography" description="Inter Variable · desktop scale with a 14px base.">
          <div className="divide-y rounded-card border bg-surface">
            {TYPE_SCALE.map(({ token, className, size }) => (
              <div key={token} className="flex items-baseline gap-6 px-5 py-3">
                <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">
                  {token} · {size}
                </span>
                <span className={`${className} truncate`}>Brainstorm with the seal</span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Shape & elevation"
          description="Sharp by design: nothing in the UI goes above 8px."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-wrap gap-4">
              {RADII.map(({ token, className, value }) => (
                <Labeled key={token} label={`${token} · ${value}`}>
                  <div className={`size-16 border-2 border-primary bg-primary-soft ${className}`} />
                </Labeled>
              ))}
            </div>
            <div className="flex flex-wrap gap-5 rounded-card bg-surface-sunken p-5">
              {SHADOWS.map(({ token, className }) => (
                <Labeled key={token} label={token}>
                  <div className={`size-16 rounded-card bg-surface ${className}`} />
                </Labeled>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="space-y-4 rounded-card border bg-surface p-6">
            {BUTTON_SIZES.map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-3">
                <span className="w-16 font-mono text-xs text-muted-foreground">{size}</span>
                {BUTTON_VARIANTS.map((variant) => (
                  <Button key={variant} variant={variant} size={size}>
                    {variant}
                  </Button>
                ))}
              </div>
            ))}
            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-16 font-mono text-xs text-muted-foreground">misc</span>
              <Button>
                <Plus />
                New board
              </Button>
              <Button variant="outline" size="icon" aria-label="Search">
                <Search />
              </Button>
              <Button variant="destructive">
                <Trash2 />
                Delete
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        <Section title="Components">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Badges & keys</CardTitle>
                <CardDescription>Small labels, file types and shortcuts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {BADGE_VARIANTS.map((variant) => (
                    <Badge key={variant} variant={variant}>
                      {variant}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  Open file <Kbd>Ctrl</Kbd>
                  <Kbd>O</Kbd>
                </div>
                <div className="flex gap-3">
                  <FileTypeIcon type="board" size="sm" />
                  <FileTypeIcon type="design" size="sm" />
                  <FileTypeIcon type="board" />
                  <FileTypeIcon type="design" />
                  <FileTypeIcon type="board" size="lg" />
                  <FileTypeIcon type="design" size="lg" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rename file</CardTitle>
                <CardDescription>Inputs and a card with a footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Untitled board" aria-label="File name" />
                <Input defaultValue="Invalid name/" aria-invalid aria-label="Invalid file name" />
                <Input placeholder="Disabled" disabled aria-label="Disabled input" />
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {children}
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
