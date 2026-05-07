import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAppBySlug } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ChevronLeft, Package, History, Info, CheckCircle2, TrendingUp, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompareVersions() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [v1, setV1] = useState(null);
  const [v2, setV2] = useState(null);

  useEffect(() => {
    fetchApp();
  }, [slug]);

  const fetchApp = async () => {
    setLoading(true);
    try {
      const res = await getAppBySlug(slug);
      const appData = res.data;
      setApp(appData);
      
      // Default to current version and the latest history version
      const current = {
        version: appData.version,
        whatsNew: appData.whatsNew,
        size: appData.size,
        date: appData.updatedAt || appData.createdAt
      };
      
      setV1(current);
      if (appData.versionHistory?.length > 0) {
        setV2(appData.versionHistory[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const VersionColumn = ({ data, title, isCurrent }) => (
    <div className="flex-1 space-y-6 relative z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white flex items-center gap-3">
            {isCurrent ? <Package className="h-4 w-4 text-primary" /> : <History className="h-4 w-4 text-white/20" />}
            {title}
          </h3>
        </div>
        <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-3 h-6", isCurrent ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-white/30 border-white/10")}>
          Build v{data?.version}
        </Badge>
      </div>

      <div className={cn("p-8 rounded-[2rem] border backdrop-blur-xl transition-all duration-500 min-h-[300px] flex flex-col gap-8", isCurrent ? "bg-primary/[0.03] border-primary/20 shadow-[0_0_50px_-20px_rgba(1,135,95,0.3)]" : "bg-white/5 border-white/5")}>
        <div className="space-y-4 flex-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Operational Changes</h4>
          <div className="text-xs font-medium leading-relaxed text-white/50 whitespace-pre-wrap italic">
            {data?.whatsNew ? `"${data.whatsNew}"` : "No technical logs for this build."}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-1">Payload Size</span>
            <p className="text-xs font-black text-white">{data?.size || "N/A"}</p>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-1">Release Sync</span>
            <p className="text-xs font-black text-white">{data?.date ? new Date(data.date).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="space-y-12 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-white/5 rounded-full" />
          <div className="h-12 w-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
      <div className="h-32 w-full bg-white/5 rounded-[2rem]" />
      <div className="grid grid-cols-2 gap-12">
        <div className="h-[400px] bg-white/5 rounded-[2rem]" />
        <div className="h-[400px] bg-white/5 rounded-[2rem]" />
      </div>
    </div>
  );

  if (!app) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Package className="h-8 w-8 text-white/10" />
      </div>
      <p className="font-black uppercase tracking-[0.2em] text-white/20">Subject Not Found</p>
    </div>
  );

  const historyOptions = [
    { version: app.version, whatsNew: app.whatsNew, size: app.size, date: app.updatedAt || app.createdAt },
    ...(app.versionHistory || [])
  ];

  return (
    <div className="space-y-12 pb-20 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors mb-4">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Profile
          </button>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Technical Analysis</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Version Delta</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Comparative analysis of research builds for {app.name}</p>
        </div>
      </div>

      <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-16 bg-black/40 border border-white/5 rounded-[2rem] p-8 relative z-10 shadow-2xl">
          <div className="flex-1 w-full space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Base Revision</label>
            <Select 
              value={v1?.version} 
              onValueChange={(val) => setV1(historyOptions.find(o => o.version === val))}
            >
              <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold">
                <SelectValue placeholder="Select Version" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                {historyOptions.map(opt => (
                  <SelectItem key={opt.version} value={opt.version} className="font-bold">
                    REVISION {opt.version} {opt.version === app.version ? "(STABLE)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 shadow-lg">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1 w-full space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Target Revision</label>
            <Select 
              value={v2?.version} 
              onValueChange={(val) => setV2(historyOptions.find(o => o.version === val))}
            >
              <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold">
                <SelectValue placeholder="Select Version" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                {historyOptions.map(opt => (
                  <SelectItem key={opt.version} value={opt.version} className="font-bold">
                    REVISION {opt.version} {opt.version === app.version ? "(STABLE)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-16 relative">
          {/* Delta Bridge */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-[1px] bg-white/5 -translate-x-1/2 z-0" />
          
          <VersionColumn 
            data={v1} 
            title={v1?.version === app.version ? "Stable Branch" : "Reference Build"} 
            isCurrent={v1?.version === app.version} 
          />
          
          <VersionColumn 
            data={v2} 
            title={v2?.version === app.version ? "Stable Branch" : "Comparison Build"} 
            isCurrent={v2?.version === app.version} 
          />
        </div>
      </div>

      {/* Analytical Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Info className="h-5 w-5" />, title: "Architecture Drift", content: "Version delta reveals the evolution of technical implementations. Review 'Operational Changes' for refactor logs.", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
          { icon: <Star className="h-5 w-5" />, title: "Regression Context", content: "Comparative analysis helps isolate regression points. Stable builds provide the baseline for quality assurance.", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
          { icon: <CheckCircle2 className="h-5 w-5" />, title: "Payload Integrity", content: "Significant delta in payload size may indicate asset optimization or inclusion of new binary libraries.", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" }
        ].map((insight, i) => (
          <div key={i} className={cn("p-8 rounded-[2.5rem] border backdrop-blur-md relative overflow-hidden group hover:scale-105 transition-all duration-500", insight.bg, insight.border)}>
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", insight.border)}>
                {insight.icon}
              </div>
              <h4 className={cn("font-black text-xs uppercase tracking-[0.2em]", insight.color)}>{insight.title}</h4>
            </div>
            <p className="text-xs font-medium text-white/40 leading-relaxed">
              {insight.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Label({ children, className }) {
  return <span className={cn("block mb-1 text-sm font-medium", className)}>{children}</span>;
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
