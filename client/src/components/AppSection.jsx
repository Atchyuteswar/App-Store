import { ArrowRight, ChevronRight, Activity } from "lucide-react";
import AppCard from "./AppCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AppSection({ title, subtitle, apps, onViewAll }) {
  if (!apps || apps.length === 0) return null;

  return (
    <section className="container py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Matrix */}
      <div 
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 group cursor-pointer"
        onClick={onViewAll}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-premium uppercase leading-none group-hover:text-primary transition-colors duration-700">{title}</h2>
            <div className="h-2 w-2 rounded-full bg-white/10 group-hover:bg-primary group-hover:animate-pulse transition-all shadow-[0_0_8px_rgba(34,197,94,0)] group-hover:shadow-[0_0_8px_rgba(34,197,94,1)]" />
          </div>
          {subtitle && (
            <div className="flex items-center gap-4">
              <Badge className="bg-white/5 text-white/30 border-white/10 text-[9px] font-black h-6 px-3 uppercase tracking-widest">Protocol Group</Badge>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{subtitle}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-primary/30 group-hover:text-primary transition-all duration-700 pr-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden sm:inline opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-700">Explore Registry</span>
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-700 shadow-xl">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
      
      {/* Scrollable Node Field */}
      <ScrollArea className="w-full relative group/scroll">
        <div className="flex gap-10 pb-10 px-2">
          {apps.map((app) => (
            <div key={app._id} className="w-[240px] sm:w-[320px] shrink-0 transform transition-all duration-700 hover:-translate-y-2">
              <AppCard app={app} />
            </div>
          ))}
          {/* View All Tactical Node */}
          <div 
            className="w-[120px] sm:w-[160px] shrink-0 flex flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-700 cursor-pointer group/all shadow-xl h-full min-h-[300px]"
            onClick={onViewAll}
          >
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/all:scale-110 group-hover/all:border-primary/50 transition-all duration-700">
              <ArrowRight className="h-6 w-6 text-white/20 group-hover/all:text-primary transition-colors" />
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover/all:text-white transition-colors">Registry</span>
          </div>
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5 bg-white/5 rounded-full transition-all group-hover/scroll:bg-white/10" />
      </ScrollArea>
    </section>
  );
}
