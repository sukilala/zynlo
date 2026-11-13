import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

function visibleError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (
    message &&
    message.length <= 160 &&
    !/[\n\r]/.test(message) &&
    !/firebase|secret|token|password|assertion|at\s+\S+\s+\(/i.test(message)
  ) {
    return message;
  }
  return "Something went wrong. Try reloading the page.";
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">
        {visibleError(error)}
      </p>
    </main>
  );
}
