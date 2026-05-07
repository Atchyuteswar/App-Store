import { useState, useMemo } from "react";
import { PackageOpen, ArrowRight, Zap, Activity, ShieldCheck, Terminal, Layers, Sparkles, Filter, Search, Globe, Cpu, Badge } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryBar from "@/components/CategoryBar";
import AppCard from "@/components/AppCard";
import AppSection from "@/components/AppSection";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApps } from "@/hooks/useApps";
import * as api from "@/services/api";
import { cn } from "@/lib/utils";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { apps, loading } = useApps({});

  const filteredApps = useMemo(() => {
    let result = apps;
    if (category && category !== "All") result = result.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.name?.toLowerCase().includes(q) || a.tagline?.toLowerCase().includes(q));
    }
    return result;
  }, [apps, category, search]);

  const featuredApps = useMemo(() => apps.filter((a) => a.featured), [apps]);
  const topApps = useMemo(() => [...apps].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 9), [apps]);
  const recentApps = useMemo(() => [...apps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 12), [apps]);

  const showSections = category === "All" && !search;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-primary/30 text-white relative">
      <Navbar onSearch={setSearch} searchValue={search} />

      <main className="flex-1 pb-20 relative z-10 overflow-hidden">
        {/* Dynamic Background Mesh */}
        <div className="absolute top-0 right-0 h-[1000px] w-[1000px] bg-primary/5 blur-[200px] rounded-full -mr-96 -mt-96 pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 h-[800px] w-[800px] bg-blue-500/5 blur-[160px] rounded-full -ml-80 -mb-80 pointer-events-none opacity-50" />

        {/* Tactical Navigation Bar */}
        <div className="container mt-6 mb-12 relative z-20">
          <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-between overflow-hidden group">
            <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
              {["RESEARCH HUB", "EXPERIMENTS", "ALPHA DEPLOYMENTS", "DATASETS", "NEURAL LINKS"].map((tab, i) => (
                <button
                  key={tab}
                  className={cn(
                    "h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap flex items-center gap-3",
                    i === 0
                      ? "bg-primary text-white shadow-[0_0_20px_-5px_rgba(34,197,94,0.6)]"
                      : "text-white/20 hover:text-white/60 hover:bg-white/5"
                  )}
                >
                  {i === 0 && <Terminal className="h-3.5 w-3.5" />}
                  {tab}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-6 pr-6">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Grid Online</span>
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-white/20" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">2.4 TB/s Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Parameter Filter */}
        <div className="container mb-16 relative z-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <CategoryBar selected={category} onSelect={setCategory} />
        </div>

        {loading ? (
          <div className="container space-y-12 relative z-20">
            <Skeleton className="h-[500px] w-full rounded-[3rem] bg-white/5" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-[2.5rem] bg-white/5" />
                  <Skeleton className="h-4 w-3/4 bg-white/5 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : showSections ? (
          <div className="space-y-24 relative z-20">
            {/* Spotlight Vector */}
            <div className="animate-in fade-in zoom-in duration-1000">
              <HeroBanner apps={featuredApps} />
            </div>

            {/* Neural Chart Rankings */}
            <section className="container">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-4 h-7">Neural Performance</Badge>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Primary Nodes</h2>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Ranked by synchronization bandwidth & researcher engagement</p>
                </div>
                <Button variant="ghost" className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl group">
                  Global Registry <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-10">
                {topApps.map((app, i) => (
                  <div
                    key={app._id}
                    className="flex items-center gap-8 group cursor-pointer p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-primary/30 transition-all duration-700 shadow-xl relative overflow-hidden"
                    onClick={() => window.location.href = `/app/${app.slug}`}
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-4xl font-black text-white/5 w-12 tabular-nums italic group-hover:text-primary/20 transition-colors shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <img src={api.getFileUrl(app.icon)} className="h-20 w-20 rounded-3xl object-cover shadow-2xl relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3 border border-white/10" alt="" />
                      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 z-20" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="font-black text-base tracking-tight text-white group-hover:text-primary transition-colors uppercase truncate">{app.name}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{app.category}</span>
                        <div className="h-1 w-1 rounded-full bg-white/10" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-primary">4.{i % 9 || 8}</span>
                          <Sparkles className="h-3 w-3 text-primary/40" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Curated Deployment Modules */}
            <div className="space-y-32">
              <AppSection title="PRIORITY REVISIONS" subtitle="Architectural focus for current research cycles" apps={recentApps} />

              {/* Mid-Page Tactical CTA */}
              <div className="container">
                <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-primary/20 via-[#0a0a0a] to-[#050505] border border-white/5 p-16 md:p-24 flex flex-col lg:flex-row items-center gap-16 group shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                  <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/10 blur-[140px] rounded-full -mr-80 -mt-80" />

                  <div className="relative z-10 h-32 w-32 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/50 transition-all duration-1000 shadow-2xl">
                    <Cpu className="h-14 w-14 text-primary animate-pulse" />
                  </div>

                  <div className="relative z-10 flex-1 text-center lg:text-left space-y-6">
                    <div className="space-y-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] px-4 h-7">Core Infrastructure</Badge>
                      <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-premium uppercase leading-[0.9]">Initialize Experimental Clearance</h3>
                      <p className="text-sm text-white/40 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">Establish your researcher credentials to gain access to unreleased architectural nodes and priority build synchronization.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                      <Button className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105">
                        Establish Link
                      </Button>
                      <Button variant="ghost" className="h-16 px-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5 border border-white/5 transition-all">
                        Technical Protocols
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <AppSection title="NEURAL REVISIONS" subtitle="Latest synchronizations from the development cluster" apps={recentApps.slice().reverse()} />
            </div>
          </div>
        ) : (
          <div className="container animate-in fade-in zoom-in duration-1000 relative z-20">
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-10 gap-y-16">
                {filteredApps.map((app) => <AppCard key={app._id} app={app} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center space-y-10">
                <div className="h-32 w-32 rounded-[3rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <PackageOpen className="h-16 w-16 text-white/10 group-hover:text-primary/40 transition-all duration-700 group-hover:scale-110" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-premium uppercase tracking-tighter">Zero Nodes Detected</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No experimental data matches current sync parameters</p>
                </div>
                <Button onClick={() => { setSearch(""); setCategory("All"); }} className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl">
                  Reset Matrix Parameters
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
