import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = ["All", "Productivity", "Utility", "Games", "Education", "Health", "Finance", "Other"];

export default function CategoryBar({ selected, onSelect }) {
  return (
    <div className="container mb-8">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                selected === cat
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
