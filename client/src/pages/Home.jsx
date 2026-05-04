import { useState, useMemo } from "react";
import { PackageOpen, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryBar from "@/components/CategoryBar";
import AppCard from "@/components/AppCard";
import AppSection from "@/components/AppSection";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useApps } from "@/hooks/useApps";
import * as api from "@/services/api";

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onSearch={setSearch} searchValue={search} />

      <main className="flex-1 pb-20">
        {/* Play Store Tabs */}
        <div className="container border-b mb-6">
          <div className="flex gap-8 py-2 overflow-x-auto no-scrollbar">
            {["Games", "Apps", "Movies", "Books", "Children"].map((tab) => (
              <button key={tab} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${tab === "Apps" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Categories (Device types) */}
        <div className="container mb-8">
          <CategoryBar selected={category} onSelect={setCategory} />
        </div>

        {loading ? (
          <div className="container space-y-12">
            <Skeleton className="h-[400px] w-full rounded-3xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-3xl" />)}
            </div>
          </div>
        ) : showSections ? (
          <div className="space-y-12">
            {/* Spotlight Banner */}
            <HeroBanner apps={featuredApps} />

            {/* Top Charts (Numbered List) */}
            <section className="container">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Top charts</h2>
                <Button variant="ghost" className="text-primary hover:text-primary/80">Top free <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                {topApps.map((app, i) => (
                  <div key={app._id} className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.href = `/app/${app.slug}`}>
                    <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    <img src={api.getFileUrl(app.icon)} className="h-14 w-14 rounded-xl object-cover play-shadow" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.category} • 4.{i % 9}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended / Recommended Rows */}
            <AppSection title="Recommended for you" apps={recentApps} />
            <AppSection title="Suggested for you" apps={recentApps.slice().reverse()} />
          </div>
        ) : (
          <div className="container grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredApps.map((app) => <AppCard key={app._id} app={app} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
