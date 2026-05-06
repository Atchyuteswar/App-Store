import { useState, useEffect } from "react";
import { getTesterActivity, getTesterStats } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar as CalendarIcon, 
  Zap, 
  Trophy, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  PieChart,
  ShieldCheck,
  Star,
  Award
} from "lucide-react";
import { ActivityCalendar as CalendarHeatmap } from "react-activity-calendar";
import { cn } from "@/lib/utils";

export default function ActivityCalendar() {
  const [activityData, setActivityData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const [activityRes, statsRes] = await Promise.all([
        getTesterActivity(),
        getTesterStats()
      ]);
      setActivityData(activityRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalActions = activityData.reduce((acc, curr) => acc + curr.count, 0);
  
  // Level Logic
  const getLevelInfo = (count) => {
    if (count < 10) return { title: "Newcomer", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10", next: 10 };
    if (count < 50) return { title: "Active Tester", icon: Star, color: "text-green-500", bg: "bg-green-500/10", next: 50 };
    if (count < 200) return { title: "Power Tester", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10", next: 200 };
    return { title: "Elite Tester", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10", next: 1000 };
  };

  const level = getLevelInfo(totalActions);
  const progress = (totalActions / level.next) * 100;

  if (loading) return <ActivitySkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Your Activity</h1>
        <p className="text-muted-foreground">Monitor your contributions and track your testing progress.</p>
      </div>

      {/* Level & Streak Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className={cn("h-24 w-24 rounded-3xl flex items-center justify-center shrink-0 shadow-lg relative transition-transform group-hover:scale-110 duration-500", level.bg)}>
                <level.icon className={cn("h-12 w-12", level.color)} />
                <div className="absolute -bottom-2 bg-background border px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">LVL 1</div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{level.title}</h2>
                  <p className="text-muted-foreground text-sm">Keep testing apps and sharing feedback to reach the next rank.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Progress to Next Rank</span>
                    <span>{totalActions} / {level.next} XP</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-green-600 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4 relative z-10">
            <div className="p-4 bg-white/20 rounded-full animate-bounce duration-3000">
              <Zap className="h-8 w-8 fill-current" />
            </div>
            <div>
              <div className="text-4xl font-bold">{stats?.activityStreak || 0} Days</div>
              <div className="text-xs font-bold uppercase tracking-widest text-green-100">Current Streak</div>
            </div>
            <p className="text-xs text-green-100 italic">"Consistency is the key to quality!"</p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Heatmap */}
      <Card className="border-none shadow-xl bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Contribution Calendar
            </CardTitle>
            <CardDescription>Activity log for the last 365 days</CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-muted" /> Less
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-green-200" />
              <div className="h-3 w-3 rounded bg-green-400" />
              <div className="h-3 w-3 rounded bg-green-600" />
              <div className="h-3 w-3 rounded bg-green-800" /> More
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto pb-8 custom-scrollbar">
          <div className="min-w-[850px] flex justify-center py-4">
            <CalendarHeatmap 
              data={activityData}
              theme={{
                light: ['#f1f5f9', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'],
                dark: ['#1e293b', '#064e3b', '#065f46', '#059669', '#10b981'],
              }}
              labels={{
                totalCount: "{{count}} actions in the last year",
              }}
              showWeekdayLabels
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Breakdown */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Actions", value: totalActions, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Max Activity/Day", value: Math.max(...activityData.map(d => d.count), 0), icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Bugs Found", value: stats?.totalBugs || 0, icon: BarChart3, color: "text-red-500", bg: "bg-red-500/10" },
          { title: "Ideas Given", value: stats?.totalIdeas || 0, icon: PieChart, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md bg-card/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-md" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-40 bg-muted rounded-2xl" />
        <div className="h-40 bg-muted rounded-2xl" />
      </div>
      <div className="h-64 bg-muted rounded-2xl w-full" />
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
