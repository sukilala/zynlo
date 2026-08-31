import { createFileRoute } from "@tanstack/react-router";
import { ZynloApp } from "@/components/ZynloApp";

const EMPTY = {
  agents: [],
  customers: [],
  clients: [],
  calls: [],
  messages: [],
};

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <ZynloApp initial={EMPTY} />;
}
