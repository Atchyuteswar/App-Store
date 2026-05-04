import { useState, useMemo } from "react";
import { PackageOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryBar from "@/components/CategoryBar";
import AppCard from "@/components/AppCard";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useApps } from "@/hooks/useApps";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { apps, loading } = useApps({});

  const filteredApps = useMemo(() => {
    let result = apps;
    if (category && category !== "All") {
      result = result.filter((a) => a.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.tagline?.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [apps, category, search]);

  const featuredApps = useMemo(() => apps.filter((a) => a.featured), [apps]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={setSearch} searchValue={search} />

      {/* Hero */}
      {!loading && featuredApps.length > 0 && <HeroBanner apps={featuredApps} />}

      {/* Categories */}
      <div className="py-4">
        <CategoryBar selected={category} onSelect={setCategory} />
      </div>

      {/* App Grid */}
      <main className="flex-1 pb-12">
        <div className="container pb-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PackageOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No apps found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? `No results for "${search}"` : "No apps available in this category yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <AppCard key={app._id} app={app} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
