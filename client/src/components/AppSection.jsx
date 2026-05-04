import { ArrowRight } from "lucide-react";
import AppCard from "./AppCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function AppSection({ title, apps, onViewAll }) {
  if (!apps || apps.length === 0) return null;

  return (
    <section className="container py-6">
      <div 
        className="flex items-center justify-between mb-4 group cursor-pointer"
        onClick={onViewAll}
      >
        <h2 className="text-xl font-medium tracking-tight text-foreground/90">{title}</h2>
        <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex space-x-1 pb-4">
          {apps.map((app) => (
            <div key={app._id} className="w-[140px] sm:w-[160px] shrink-0">
              <AppCard app={app} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </section>
  );
}
