import { cn } from "@/lib/utils";

const categories = ["All", "Productivity", "Utility", "Games", "Education", "Health", "Finance", "Other"];

export default function CategoryBar({ selected, onSelect }) {
  return (
    <div className="container mb-6 overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selected === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
