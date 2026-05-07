import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Zap, Sparkles, Terminal, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import * as api from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function HeroBanner({ apps }) {
  const navigate = useNavigate();
  const featured = apps[0];

  if (!featured) return null;

  return (
    <section className="container py-8 selection:bg-primary/30">
      <div className="relative overflow-hidden rounded-[4rem] bg-black border border-white/5 p-12 md:p-24 group min-h-[500px] flex items-center shadow-2xl">
        {/* Cinematic Background Architecture */}
        <div className="absolute top-0 right-0 h-[100%] w-[60%] bg-primary/10 blur-[160px] rounded-full opacity-50 group-hover:opacity-70 transition-all duration-1000 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[80%] w-[40%] bg-blue-500/5 blur-[120px] rounded-full opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(34,197,94,1)]" />
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] px-4 h-7">PRIORITY EXPEDITION</Badge>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-premium uppercase">
                {featured.name}
              </h1>
              <p className="text-xl md:text-2xl text-white/40 font-bold leading-relaxed max-w-2xl uppercase tracking-tight italic">
                "{featured.tagline}"
              </p>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary/40" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Build Synchronized</span>
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400/40" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Clearance: Alpha</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-6 pt-6">
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-20 px-14 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-[0_0_50px_-10px_rgba(34,197,94,0.6)] transition-all hover:scale-[1.05] active:scale-95 text-sm" 
              onClick={() => navigate(`/app/${featured.slug}`)}
            >
              Enter Research Node
              <ArrowRight className="ml-4 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto h-20 px-14 rounded-[1.5rem] border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] backdrop-blur-md transition-all hover:scale-[1.05] active:scale-95 text-sm group/sync" 
              onClick={() => window.open(api.getFileUrl(featured.apk_file), '_blank')}
            >
              <Download className="mr-4 h-5 w-5 text-white/40 group-hover/sync:text-white transition-colors" /> 
              Initialize Sync
            </Button>
          </div>
        </div>

        {/* Cinematic Icon Display */}
        <div className="absolute top-1/2 right-24 -translate-y-1/2 hidden xl:block animate-float">
          <div className="relative p-2 rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl group/icon">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity duration-1000" />
            <img 
              src={api.getFileUrl(featured.icon)} 
              alt="" 
              className="h-80 w-80 rounded-[3.5rem] object-cover shadow-2xl relative z-10 grayscale-[40%] group-hover/icon:grayscale-0 group-hover/icon:rotate-3 transition-all duration-1000" 
            />
            <div className="absolute inset-0 rounded-[3.5rem] ring-1 ring-inset ring-white/10 z-20 group-hover/icon:ring-primary/40 transition-all duration-700" />
            
            {/* Visual Telemetry Overlays */}
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-[1.5rem] bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center z-30 shadow-2xl animate-pulse">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center z-30 shadow-2xl">
              <Sparkles className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
