import { ChevronRight } from "lucide-react";
import AppCard from "./AppCard";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function AppSection({ title, apps, onViewAll }) {
  if (!apps || apps.length === 0) return null;

  return (
    <section className="container py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-muted-foreground hover:text-primary">
          View all <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 py-1">
          {apps.map((app) => (
            <div key={app._id} className="w-[280px] sm:w-[320px]">
              <AppCard app={app} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </section>
  );
}
