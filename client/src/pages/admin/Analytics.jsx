import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from "recharts";
import { 
  getAnalyticsOverview, 
  getDownloadStats, 
  getBugsPerVersion, 
  getTopTesters, 
  getIdeaFunnel, 
  getTesterRetention,
  getAdminApps
} from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Users, Bug, Lightbulb, Star, TrendingUp, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const COLORS = ["#166534", "#22c55e", "#4ade80", "#86efac"];

export default function Analytics() {
  const [appId, setAppId] = useState("all");
  const [range, setRange] = useState("30");
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [downloadsData, setDownloadsData] = useState([]);
  const [bugsData, setBugsData] = useState([]);
  const [topTesters, setTopTesters] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [appId, range]);

  const fetchApps = async () => {
    try {
      const res = await getAdminApps();
      setApps(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const params = { appId: appId === "all" ? undefined : appId, range };
      const [overview, downloads, bugs, testers, funnel, retention] = await Promise.all([
        getAnalyticsOverview(params),
        getDownloadStats(params),
        getBugsPerVersion(params),
        getTopTesters(params),
        getIdeaFunnel(params),
        getTesterRetention(params)
      ]);

      setStats(overview.data);
      setDownloadsData(downloads.data);
      setBugsData(bugs.data);
      setTopTesters(testers.data);
      setFunnelData(funnel.data);
      setRetentionData(retention.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{loading ? <Skeleton className="h-8 w-20" /> : value}</h3>
          </div>
          <div className={cn("p-2 rounded-full", color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor app performance and tester engagement.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={appId} onValueChange={setAppId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Apps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apps</SelectItem>
              {apps.map(app => (
                <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Last 30 Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Downloads" value={stats?.totalDownloads || 0} icon={Download} color="bg-blue-600" />
        <StatCard title="Active Testers" value={stats?.activeTesters || 0} icon={Users} color="bg-green-600" />
        <StatCard title="Bugs Filed" value={stats?.bugCount || 0} icon={Bug} color="bg-red-600" />
        <StatCard title="Ideas Submitted" value={stats?.ideaCount || 0} icon={Lightbulb} color="bg-amber-600" />
        <StatCard title="Avg Rating" value={stats?.avgRating || "0.0"} icon={Star} color="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Downloads Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Downloads Over Time</CardTitle>
            <CardDescription>Cumulative download count for selected period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={downloadsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#166534" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#166534' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bug Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Bugs per Version</CardTitle>
            <CardDescription>Issue distribution across app releases.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bugsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="version" type="category" tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" fill="#166534" radius={[0, 4, 4, 0]}>
                    {bugsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Testers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Contributing Testers</CardTitle>
              <CardDescription>Ranked by engagement score.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Top 50
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Tester</TableHead>
                    <TableHead className="text-right">Bugs</TableHead>
                    <TableHead className="text-right">Ideas</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    topTesters.map((tester) => (
                      <TableRow key={tester.id}>
                        <TableCell className="font-bold text-muted-foreground">{tester.rank}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{tester.name}</span>
                            <span className="text-xs text-muted-foreground">{tester.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{tester.bugs}</TableCell>
                        <TableCell className="text-right">{tester.ideas}</TableCell>
                        <TableCell className="text-right font-bold text-green-700">{tester.score}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {/* Idea Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Idea Conversion Funnel</CardTitle>
              <CardDescription>Feedback progression from submission to implementation.</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <div className="flex flex-col justify-center h-full space-y-4">
                  {funnelData.map((item, i) => (
                    <div key={item.stage} className="relative h-10 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-green-600 flex items-center px-4 text-white text-xs font-bold transition-all duration-1000"
                        style={{ width: `${(item.value / (funnelData[0].value || 1)) * 100}%` }}
                      >
                        {item.stage}
                      </div>
                      <div className="absolute right-4 inset-y-0 flex items-center text-xs font-bold">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tester Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Tester Retention</CardTitle>
              <CardDescription>Active vs Churned enrolled testers.</CardDescription>
            </CardHeader>
            <CardContent className="h-[180px] flex items-center justify-center">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={retentionData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {retentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#166534" : "#e2e8f0"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

}
