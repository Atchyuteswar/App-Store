import { Separator } from "@/components/ui/separator";
import { Shield, Terminal, Globe, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] relative overflow-hidden">
      <div className="absolute bottom-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 h-32 w-32 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="container py-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-4 group">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all duration-700">
                <Shield className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tighter text-white leading-none uppercase">Antigravity</span>
                <span className="text-[8px] font-black tracking-[0.4em] text-primary uppercase mt-1">Research Registry</span>
              </div>
            </div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] max-w-xs text-center md:text-left leading-relaxed">
              Decentralized architectural synchronization and technical discovery matrix. Developed by the high-level research cluster.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-12">
            {[
              { label: "Registry Hub", icon: Globe },
              { label: "Neural Links", icon: Terminal },
              { label: "Core Protocol", icon: Cpu }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <item.icon className="h-4 w-4 text-white/10 group-hover:text-primary transition-all duration-500" />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-white transition-colors">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
              &copy; {new Date().getFullYear()} RESEARCH CLUSTER. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Protocol Version 2.4.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
