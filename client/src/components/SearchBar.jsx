import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar({ value, onChange, className }) {
  return (
    <div className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-bar"
          placeholder="Search apps..."
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
