import { cn } from "@/lib/utils";
import { Layers, Terminal, Cpu, Globe, Activity, Zap, Box, Database } from "lucide-react";

const categories = [
  { name: "All", icon: Layers },
  { name: "Productivity", icon: Activity },
  { name: "Utility", icon: Cpu },
  { name: "Games", icon: Zap },
  { name: "Education", icon: Terminal },
  { name: "Health", icon: Globe },
  { name: "Finance", icon: Database },
  { name: "Other", icon: Box }
];

export default function CategoryBar({ selected, onSelect }) {
  return (
    <div className="overflow-x-auto no-scrollbar py-4">
      <div className="flex gap-4 min-w-max px-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelect(cat.name)}
            className={cn(
              "flex items-center gap-4 px-10 h-16 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-700 border group",
              selected === cat.name
                ? "bg-primary text-white border-primary shadow-[0_0_30px_-10px_rgba(34,197,94,0.6)] scale-[1.05] z-10"
                : "bg-black/40 text-white/20 border-white/5 hover:bg-white/5 hover:text-white/60 hover:border-white/10"
            )}
          >
            <cat.icon className={cn(
              "h-4 w-4 transition-all duration-700",
              selected === cat.name 
                ? "text-white" 
                : "text-white/10 group-hover:text-primary/40 group-hover:rotate-12"
            )} />
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
