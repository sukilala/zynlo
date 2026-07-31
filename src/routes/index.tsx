import { createFileRoute } from "@tanstack/react-router";
import { ZynloApp } from "@/components/ZynloApp";
import { getAllData } from "@/lib/zynlo/server";

export const Route = createFileRoute("/")({
  loader: () => getAllData(),
  component: HomePage,
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf7ff] p-6 text-center">
      <h1 className="text-xl font-bold text-[#2d1b4e]">Could not load Zynlo</h1>
      <p className="max-w-md text-sm text-[#6b5a80]">
        {error instanceof Error
          ? error.message
          : "Failed to reach the shared database."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-[#a743ff] px-4 py-2 text-sm font-semibold text-white"
      >
        Retry
      </button>
    </div>
  ),
});

function HomePage() {
  const initial = Route.useLoaderData();
  return <ZynloApp initial={initial} />;
}
