import { createFileRoute } from "@tanstack/react-router";
import { ZynloApp } from "@/components/ZynloApp";
import { getAllData } from "@/lib/zynlo/server";

export const Route = createFileRoute("/")({
  loader: () => getAllData(),
  component: HomePage,
});

function HomePage() {
  const initial = Route.useLoaderData();
  return <ZynloApp initial={initial} />;
}
