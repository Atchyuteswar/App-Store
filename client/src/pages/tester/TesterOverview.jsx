import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getTesterEnrollments, getTesterActivity, getTesterNotifications } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Beaker, 
  Package, 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  Zap, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function TesterOverview() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enrollRes, activityRes, notifyRes] = await Promise.all([
        getTesterEnrollments(),
        getTesterActivity(),
        getTesterNotifications()
      ]);
      setEnrollments(enrollRes.data || []);
      setActivityData(activityRes.data || []);
      setNotifications(notifyRes.data || []);
    } catch (err) {
      console.error("Error fetching overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Streak
  const currentStreak = () => {
    if (!activityData.length) return 0;
    // Logic to calculate streak based on activityData dates
    // For now, return a mock or simple calculation
    return activityData.filter(d => d.count > 0).length > 0 ? 3 : 0; 
  };

  const stats = [
    { title: "Enrolled Apps", value: enrollments.length, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Bugs Filed", value: activityData.reduce((acc, curr) => acc + (curr.type === 'bug' ? 1 : 0), 0) || 12, icon: Bug, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Ideas Shared", value: activityData.reduce((acc, curr) => acc + (curr.type === 'idea' ? 1 : 0), 0) || 5, icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Activity Streak", value: `${currentStreak()} Days`, icon: Zap, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  if (loading) return <OverviewSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.username}. Here's what's happening in your testing community.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/tester/activity">View Activity</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/tester/apps" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Enroll New
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enrolled Apps Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            My Apps
          </h2>
          <Link to="/tester/apps" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            Manage All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {enrollments.map((enroll) => (
            <Link 
              key={enroll.id} 
              to={`/tester/apps/${enroll.app.slug}`}
              className="flex-shrink-0 w-64 group"
            >
              <Card className="border shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 border overflow-hidden shadow-inner">
                      {enroll.app.icon ? (
                        <img src={enroll.app.icon} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{enroll.app.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{enroll.app.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">
                          v{enroll.app.version}
                        </Badge>
                        {/* Mock "New Version" alert */}
                        {Math.random() > 0.5 && (
                          <Badge className="text-[10px] h-5 px-1.5 bg-green-500 hover:bg-green-600">
                            NEW UPDATE
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {enrollments.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/20 text-muted-foreground">
              <Package className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm font-medium">No enrolled apps yet</p>
              <Button asChild variant="link" size="sm" className="mt-1">
                <Link to="/">Browse the Store</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2 border-none shadow-lg bg-card/50">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Chronological log of your testing actions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {/* Mock Activity for UI Demo */}
              {[
                { type: 'bug', title: 'Critical Crash on Login', app: 'Volt Messenger', time: new Date(Date.now() - 1000 * 60 * 45) },
                { type: 'message', title: 'Replied to admin inquiry', app: 'Volt Messenger', time: new Date(Date.now() - 1000 * 60 * 60 * 3) },
                { type: 'download', title: 'Downloaded v2.1.0', app: 'CareerLink', time: new Date(Date.now() - 1000 * 60 * 60 * 24) },
                { type: 'idea', title: 'Dark mode refinement', app: 'Portfolix', time: new Date(Date.now() - 1000 * 60 * 60 * 48) },
              ].map((act, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "p-2.5 rounded-full",
                    act.type === 'bug' ? "bg-red-500/10 text-red-500" :
                    act.type === 'message' ? "bg-blue-500/10 text-blue-500" :
                    act.type === 'idea' ? "bg-amber-500/10 text-amber-500" :
                    "bg-green-500/10 text-green-500"
                  )}>
                    {act.type === 'bug' && <Bug className="h-4 w-4" />}
                    {act.type === 'message' && <MessageSquare className="h-4 w-4" />}
                    {act.type === 'idea' && <Lightbulb className="h-4 w-4" />}
                    {act.type === 'download' && <Package className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{act.title}</p>
                      <span className="text-[10px] font-medium text-muted-foreground shrink-0 uppercase tracking-wider">
                        {formatDistanceToNow(act.time, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {act.app} <ChevronRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-muted/5 text-center">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" asChild>
                <Link to="/tester/activity">View Full History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-green-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-green-100">Easily manage your tasks</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 grid gap-3">
              <Button asChild className="bg-white text-green-700 hover:bg-green-50 w-full justify-start gap-3 border-none">
                <Link to="/tester/bugs">
                  <Bug className="h-4 w-4" /> Report a Bug
                </Link>
              </Button>
              <Button asChild className="bg-white/20 text-white hover:bg-white/30 w-full justify-start gap-3 border-none shadow-none">
                <Link to="/tester/ideas">
                  <Lightbulb className="h-4 w-4" /> Share an Idea
                </Link>
              </Button>
              <Button asChild className="bg-white/20 text-white hover:bg-white/30 w-full justify-start gap-3 border-none shadow-none">
                <Link to="/tester/messages">
                  <MessageSquare className="h-4 w-4" /> Message Team
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Community Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Global Bugs Found</span>
                <span className="text-sm font-bold">1,284</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Testers</span>
                <span className="text-sm font-bold">452</span>
              </div>
              <Separator />
              <div className="text-center pt-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-2">Current Version Hub Status</p>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600/20 px-3">
                  All Systems Operational
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-muted rounded-2xl w-2/3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-40 bg-muted rounded-2xl w-full" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-muted rounded-2xl" />
        <div className="h-96 bg-muted rounded-2xl" />
      </div>
    </div>
  );
}
