import { useNavigate } from "react-router-dom";
import { Star, Zap, Cpu, ArrowUpRight, Activity } from "lucide-react";
import * as api from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AppCard({ app }) {
  const navigate = useNavigate();

  return (
    <div 
      className="group cursor-pointer p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.05] transition-all duration-700 shadow-2xl relative overflow-hidden"
      onClick={() => navigate(`/app/${app.slug}`)}
    >
      {/* Dynamic Hover Glow */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      <div className="aspect-square relative mb-6 z-10">
        <div className="w-full h-full p-1.5 rounded-[2.8rem] bg-white/5 border border-white/10 group-hover:border-primary/20 transition-all duration-700 relative overflow-hidden">
          <img 
            src={api.getFileUrl(app.icon || app.iconUrl)} 
            alt={app.name}
            className="w-full h-full rounded-[2.2rem] object-cover shadow-2xl transition-all duration-1000 grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 group-hover:rotate-2"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 z-20 group-hover:ring-primary/40 transition-all duration-700 rounded-[2.8rem]" />
        </div>
        
        {/* Floating Metrics Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0 z-30">
          <Badge className="bg-black/60 backdrop-blur-md text-primary border-primary/20 text-[8px] font-black h-6 px-3">ALPHA BUILD</Badge>
          <div className="h-8 w-8 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-primary transition-all">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Priority Indicator */}
        {app.featured && (
          <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(34,197,94,1)]" />
            <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-primary/20">Featured</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4 px-1 relative z-10">
        <div className="space-y-1">
          <h3 className="font-black text-sm tracking-tight uppercase leading-tight truncate text-white group-hover:text-primary transition-colors">
            {app.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{app.category}</span>
            <div className="h-1 w-1 rounded-full bg-white/5" />
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-[10px] font-black text-white/60">4.{app.rating % 10 || 9}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Architecture</span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-tight">{app.platform || "Cross"}</span>
            </div>
            <div className="h-4 w-[1px] bg-white/5" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Payload</span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-tight">{app.size || "32 MB"}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-primary/40 group-hover:animate-pulse" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sync Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
