import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Command, 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  Package, 
  ListTodo,
  ChevronRight,
  History
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { globalSearch } from "@/services/api";
// Custom debounce hook/function
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export default function SearchModal({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const handleSearch = useCallback(
    debounce(async (q) => {
      if (!q || q.length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await globalSearch(q);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query) {
      setLoading(true);
      handleSearch(query);
    } else {
      setResults(null);
      setLoading(false);
    }
    setSelectedIndex(0);
  }, [query, handleSearch]);

  const flattenedResults = results ? [
    ...(results.apps || []).map(r => ({ ...r, type: 'App', icon: Package, path: `/tester/apps` })),
    ...(results.bugs || []).map(r => ({ ...r, type: 'Bug', icon: Bug, path: `/tester/bugs` })),
    ...(results.ideas || []).map(r => ({ ...r, type: 'Idea', icon: Lightbulb, path: `/tester/ideas` })),
    ...(results.messages || []).map(r => ({ ...r, type: 'Message', icon: MessageSquare, path: `/tester/messages` })),
    ...(results.tasks || []).map(r => ({ ...r, type: 'Task', icon: ListTodo, path: `/tester/tasks` }))
  ] : [];

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flattenedResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flattenedResults.length) % flattenedResults.length);
    } else if (e.key === "Enter" && flattenedResults[selectedIndex]) {
      handleSelect(flattenedResults[selectedIndex]);
    }
  };

  const handleSelect = (item) => {
    onOpenChange(false);
    setQuery("");
    navigate(item.path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-card">
        <div className="flex items-center border-b px-4 py-3 gap-3 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search apps, bugs, ideas, tasks..."
            className="border-none focus-visible:ring-0 bg-transparent text-lg h-10 px-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border bg-background text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">ESC</span>
          </div>
        </div>

        <ScrollArea className="max-h-[450px]">
          <div className="p-2">
            {loading && (
              <div className="p-8 text-center animate-pulse text-muted-foreground text-sm">
                Searching across the platform...
              </div>
            )}

            {!loading && query && flattenedResults.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try a different keyword or check your spelling.</p>
              </div>
            )}

            {!loading && !query && (
              <div className="p-8 text-center text-muted-foreground">
                <Command className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Global Search</p>
                <p className="text-xs mt-1">Search for bugs, ideas, apps, and assigned tasks.</p>
              </div>
            )}

            {!loading && flattenedResults.length > 0 && (
              <div className="grid gap-1">
                {flattenedResults.map((item, index) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all group",
                      index === selectedIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      index === selectedIndex ? "bg-white/20" : "bg-primary/5 text-primary"
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold truncate">{item.title || item.name || item.message}</p>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                          index === selectedIndex ? "bg-white/20" : "bg-muted text-muted-foreground"
                        )}>
                          {item.type}
                        </span>
                      </div>
                      {item.app && (
                        <p className={cn(
                          "text-[10px] flex items-center gap-1 mt-0.5",
                          index === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {item.app.name} <ChevronRight className="h-2 w-2" />
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="px-4 py-3 border-t bg-muted/10 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1 px-1.5 py-0.5 font-sans">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1 px-1.5 py-0.5 font-sans">Enter</kbd> Select
            </span>
          </div>
          <span>Deep Search Active</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
