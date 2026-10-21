import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card";
import { SEMANTIC_GROUPS } from "../tokens";
import { Section } from "./section-layout";

export function SemanticTokensSection() {
  return (
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
  );
}
