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
import { Section } from "./section-layout";

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "accent",
  "outline",
  "board",
  "design",
  "destructive",
] as const;
const ICON_SIZES = ["sm", "md", "lg"] as const;

function BadgesCard() {
  return (
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
          {ICON_SIZES.flatMap((size) => [
            <FileTypeIcon key={`board-${size}`} type="board" size={size} />,
            <FileTypeIcon key={`design-${size}`} type="design" size={size} />,
          ])}
        </div>
      </CardContent>
    </Card>
  );
}

function FormCard() {
  return (
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
  );
}

export function ComponentsSection() {
  return (
    <Section title="Components">
      <div className="grid gap-6 lg:grid-cols-2">
        <BadgesCard />
        <FormCard />
      </div>
    </Section>
  );
}
