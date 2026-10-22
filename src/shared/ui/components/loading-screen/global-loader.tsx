import { useLoadingStore } from "@shared/stores/loading-store";
import { LoadingScreen } from "./loading-screen";

/** Covers the whole window while a task of the loading store runs. Mounted once by the app. */
export function GlobalLoader() {
  const task = useLoadingStore((s) => s.task);
  if (!task) return null;
  return (
    <LoadingScreen
      title={task.title}
      stage={task.stage}
      progress={task.progress}
      className="fixed inset-0 z-50 bg-background/95"
    />
  );
}
