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
import { Download, Users, Bug, Lightbulb, Star, TrendingUp, ChevronRight, Activity, Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const COLORS = ["#22c55e", "#10b981", "#34d399", "#6ee7b7"];

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

  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/[0.08] transition-all duration-500 shadow-xl">
      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 border border-white/10", bg)}>
        <Icon className={cn("h-7 w-7", color)} />
      </div>
      <div>
        <p className="text-4xl font-black text-white tracking-tighter">
          {loading ? <Skeleton className="h-10 w-24 bg-white/5" /> : value}
        </p>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2 leading-tight">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Real-time Intelligence</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Research Analytics</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Deep architectural insights & performance telemetry</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-14 w-[180px] bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
              <SelectItem value="7" className="rounded-xl py-3 font-bold">LAST 7 DAYS</SelectItem>
              <SelectItem value="30" className="rounded-xl py-3 font-bold">LAST 30 DAYS</SelectItem>
              <SelectItem value="90" className="rounded-xl py-3 font-bold">LAST 90 DAYS</SelectItem>
              <SelectItem value="all" className="rounded-xl py-3 font-bold">ALL TIME ARCHIVE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Global Deployments" value={stats?.totalDownloads || 0} icon={Download} color="text-primary" bg="bg-primary/10" />
        <StatCard title="Active Researches" value={stats?.activeTesters || 0} icon={Users} color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard title="Stability Logs" value={stats?.bugCount || 0} icon={Bug} color="text-red-400" bg="bg-red-400/10" />
        <StatCard title="Innovation Nodes" value={stats?.ideaCount || 0} icon={Lightbulb} color="text-amber-400" bg="bg-amber-400/10" />
        <StatCard title="Efficiency Rating" value={stats?.avgRating || "0.0"} icon={Star} color="text-yellow-400" bg="bg-yellow-400/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Downloads Chart */}
        <div className="lg:col-span-2 p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(1,135,95,0.5)]" />
              Transmission Velocity
            </h2>
            <Activity className="h-5 w-5 text-white/10" />
          </div>
          <div className="h-[400px] w-full">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={downloadsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontWeight: 900}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontWeight: 900}} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f0f0f', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      padding: '16px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ color: '#22c55e', fontWeight: 900, fontSize: '12px' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '8px', fontWeight: 900 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#22c55e" 
                    strokeWidth={4} 
                    dot={{ r: 0 }}
                    activeDot={{ r: 6, fill: '#22c55e', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bug Breakdown */}
        <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
              <div className="w-1.5 h-6 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              Kernel Anomalies
            </h2>
            <Zap className="h-5 w-5 text-white/10" />
          </div>
          <div className="h-[400px] w-full">
            {loading ? (
              <Skeleton className="h-full w-full rounded-2xl bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bugsData} layout="vertical" margin={{ left: -20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="version" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 900}} 
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    contentStyle={{ 
                      backgroundColor: '#0f0f0f', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      padding: '16px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={24}>
                    {bugsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Testers */}
        <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              Elite Researchers
            </h2>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[8px] font-black uppercase tracking-widest px-3 h-6">TOP 50 NODES</Badge>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-white/20 font-black uppercase tracking-widest text-[9px] pl-6 h-12 w-16 text-center">Rank</TableHead>
                  <TableHead className="text-white/20 font-black uppercase tracking-widest text-[9px] h-12">Researcher</TableHead>
                  <TableHead className="text-right text-white/20 font-black uppercase tracking-widest text-[9px] h-12">Stability</TableHead>
                  <TableHead className="text-right text-white/20 font-black uppercase tracking-widest text-[9px] h-12">Innovation</TableHead>
                  <TableHead className="text-right text-white/20 font-black uppercase tracking-widest text-[9px] pr-6 h-12">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="py-4 pl-6"><Skeleton className="h-8 w-full bg-white/5 rounded-xl" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  topTesters.map((tester) => (
                    <TableRow key={tester.id} className="group hover:bg-white/[0.02] border-white/5 transition-colors">
                      <TableCell className="text-center">
                        <span className="font-black text-xs text-white/20 group-hover:text-primary transition-colors">#{tester.rank}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-xs text-white">{tester.name}</span>
                          <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">{tester.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs text-red-400/60">{tester.bugs}</TableCell>
                      <TableCell className="text-right font-bold text-xs text-amber-400/60">{tester.ideas}</TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="font-black text-xs text-primary shadow-[0_0_10px_rgba(34,197,94,0.3)]">{tester.score}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Idea Funnel */}
          <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                Conversion Pipeline
              </h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                <Skeleton className="h-[200px] w-full rounded-2xl bg-white/5" />
              ) : (
                funnelData.map((item, i) => (
                  <div key={item.stage} className="relative h-12 w-full bg-white/5 rounded-2xl overflow-hidden group">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/40 to-primary/10 border-r border-primary/30 flex items-center px-6 transition-all duration-1000"
                      style={{ width: `${(item.value / (funnelData[0].value || 1)) * 100}%` }}
                    >
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">{item.stage}</span>
                    </div>
                    <div className="absolute right-6 inset-y-0 flex items-center text-xs font-black text-white/40">
                      {item.value}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tester Retention */}
          <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                Network Cohesion
              </h2>
            </div>
            <div className="h-[180px] flex items-center justify-center">
              {loading ? (
                <Skeleton className="h-full w-full rounded-2xl bg-white/5" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={retentionData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {retentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#22c55e" : "rgba(255,255,255,0.05)"} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f0f0f', 
                        borderRadius: '24px', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px'
                      }}
                    />
                    <Legend 
                      verticalAlign="middle" 
                      align="right" 
                      layout="vertical" 
                      formatter={(value) => <span className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
