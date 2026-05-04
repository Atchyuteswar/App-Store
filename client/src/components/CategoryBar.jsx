import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = ["All", "Productivity", "Utility", "Games", "Education", "Health", "Finance", "Other"];

export default function CategoryBar({ selected, onSelect }) {
  return (
    <section className="py-4">
      <div className="container">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                id={`category-${cat.toLowerCase()}`}
                variant={selected === cat ? "default" : "secondary"}
                size="sm"
                className={cn(
                  "rounded-full shrink-0 transition-all",
                  selected === cat && "shadow-sm"
                )}
                onClick={() => onSelect(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
