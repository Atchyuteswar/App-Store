import React, { useState, useEffect } from "react";
import { getTesterTimeline, getTesterEnrollments } from "@/services/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  History, 
  ChevronRight, 
  Filter, 
  Calendar,
  Package,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isAfter, subDays } from "date-fns";

export default function Timeline() {
  const [timeline, setTimeline] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [timelineRes, enrollRes] = await Promise.all([
        getTesterTimeline(),
        getTesterEnrollments()
      ]);
      setTimeline(timelineRes.data || []);
      setApps(enrollRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimeline = activeFilter === "all" 
    ? timeline 
    : timeline.filter(item => item.appId === activeFilter);

  if (loading) return <TimelineSkeleton />;
  if (timeline.length === 0) return <EmptyTimeline />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Release Timeline</h1>
        <p className="text-muted-foreground">Track updates and version history for all your enrolled applications.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Badge 
          onClick={() => setActiveFilter("all")}
          className={cn(
            "cursor-pointer px-4 py-1.5 rounded-full text-xs transition-all",
            activeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All Apps
        </Badge>
        {apps.map(enroll => (
          <Badge 
            key={enroll.app.id}
            onClick={() => setActiveFilter(enroll.app.id)}
            className={cn(
              "cursor-pointer px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-2",
              activeFilter === enroll.app.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <div className="h-4 w-4 rounded-full overflow-hidden bg-background p-0.5">
              <img src={enroll.app.icon} alt="" className="h-full w-full object-contain" />
            </div>
            {enroll.app.name}
          </Badge>
        ))}
      </div>

      {/* Timeline Spines */}
      <div className="relative space-y-0 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {filteredTimeline.map((item, index) => {
          const isRecent = isAfter(new Date(item.releasedAt), subDays(new Date(), 7));
          
          return (
            <div key={`${item.appId}-${item.version}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                <div className="h-6 w-6 rounded-full overflow-hidden p-1">
                  <img src={item.appIcon} alt="" className="h-full w-full object-contain" />
                </div>
              </div>
              
              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-card/50 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:bg-card">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{item.appName}</h3>
                    <Badge variant="secondary" className="text-[10px] h-4 font-mono">v{item.version}</Badge>
                    {isRecent && (
                      <Badge className="bg-green-600 text-white text-[9px] h-4 gap-0.5 px-1 animate-pulse">
                        <Zap className="h-2 w-2 fill-current" /> RECENT
                      </Badge>
                    )}
                  </div>
                  <time className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
                    {format(new Date(item.releasedAt), "MMM d")}
                  </time>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.releaseNotes}
                </p>

                <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.releasedAt), { addSuffix: true })}
                  </div>
                  {item.isCurrent && (
                    <Badge variant="outline" className="text-[9px] text-primary border-primary/20 h-4">Active Version</Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      <div className="space-y-12 pl-12 border-l border-dashed ml-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="relative">
            <div className="absolute -left-[45px] h-6 w-6 rounded-full bg-muted" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
      <div className="p-6 rounded-full bg-primary/5 mb-6">
        <History className="h-12 w-12 text-primary opacity-20" />
      </div>
      <h2 className="text-2xl font-bold">Timeline is empty</h2>
      <p className="text-muted-foreground max-w-sm mt-2">
        Enroll in apps to see their version history and update logs here.
      </p>
    </div>
  );
}
