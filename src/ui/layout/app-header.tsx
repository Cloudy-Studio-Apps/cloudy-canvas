import type { ReactNode } from "react";

import { PageContainer } from "./page-container";

/** Sticky, translucent page header: content on the left, actions on the right. */
export function AppHeader({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur-md">
      <PageContainer className="flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">{children}</div>
        {actions}
      </PageContainer>
    </header>
  );
}
