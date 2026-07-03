import { createFileRoute } from "@tanstack/react-router";
import { SpiderPortfolio } from "@/components/spider-portfolio";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <SpiderPortfolio />;
}
