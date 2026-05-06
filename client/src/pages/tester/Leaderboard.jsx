import React, { useState, useEffect } from "react";
import { getTesterLeaderboard, getTesterEnrollments } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  ListTodo,
  RefreshCw,
  Search,
  Medal,
  TrendingUp,
  User as UserIcon,
  Globe
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState("overall");

  useEffect(() => {
    fetchApps();
    fetchLeaderboard("overall");
  }, []);

  const fetchApps = async () => {
    try {
      const { data } = await getTesterEnrollments();
      setApps(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async (appId) => {
    setLoading(true);
    try {
      const { data } = await getTesterLeaderboard(appId === "overall" ? null : appId);
      setData(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppChange = (val) => {
    setSelectedApp(val);
    fetchLeaderboard(val);
  };

  const getRankBadge = (rank) => {
    if (rank === 0) return <Medal className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
    if (rank === 1) return <Medal className="h-5 w-5 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />;
    return <span className="text-xs font-bold text-muted-foreground">#{rank + 1}</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold px-2 py-0">COMMUNITY</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Hall of Fame</h1>
          <p className="text-muted-foreground text-sm">Top contributing testers ranked by their total activity score.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedApp} onValueChange={handleAppChange}>
            <SelectTrigger className="w-[180px] bg-card/50">
              <SelectValue placeholder="Select context" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> Overall Ranking
                </div>
              </SelectItem>
              {apps.map(enroll => (
                <SelectItem key={enroll.app.id} value={enroll.app.id}>
                  {enroll.app.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => fetchLeaderboard(selectedApp)} className="shrink-0">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Top 3 Spotlight */}
      {!loading && data.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[1, 0, 2].map(idx => {
            const tester = data[idx];
            const isMe = tester.userId === user.id;
            return (
              <Card 
                key={tester.userId} 
                className={cn(
                  "border-none shadow-2xl relative overflow-hidden transition-all hover:-translate-y-1 duration-500",
                  idx === 0 ? "md:-mt-4 bg-gradient-to-br from-amber-500 to-amber-700 text-white" : "bg-card/50",
                  idx === 0 && "order-first md:order-none"
                )}
              >
                {idx === 0 && (
                  <div className="absolute -right-8 -top-8 bg-white/20 h-32 w-32 rounded-full blur-2xl" />
                )}
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className={cn(
                      "h-24 w-24 border-4",
                      idx === 0 ? "border-white/30 scale-110" : "border-muted/50"
                    )}>
                      <AvatarImage src={tester.avatar} />
                      <AvatarFallback className="text-2xl font-bold bg-muted/20">
                        {tester.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg",
                      idx === 0 ? "bg-white text-amber-600" : (idx === 1 ? "bg-slate-300 text-slate-800" : "bg-amber-800 text-white")
                    )}>
                      {idx === 0 ? "MVP" : (idx === 1 ? "ELITE" : "PRO")}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl">{tester.name}</h3>
                  {isMe && <Badge className="mt-1 bg-white/20 hover:bg-white/30 border-none text-[9px]">YOU</Badge>}
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                    <div className="text-center">
                      <p className={cn("text-[9px] font-black uppercase tracking-widest", idx === 0 ? "text-white/60" : "text-muted-foreground")}>Score</p>
                      <p className="text-2xl font-black">{tester.score}</p>
                    </div>
                    <div className="text-center">
                      <p className={cn("text-[9px] font-black uppercase tracking-widest", idx === 0 ? "text-white/60" : "text-muted-foreground")}>Rank</p>
                      <p className="text-2xl font-black">#{idx + 1}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leaderboard Table */}
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Full Rankings
          </CardTitle>
          <CardDescription>Bugs: 3pt · Ideas: 2pt · Tasks: 4pt · Messages: 1pt</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[80px] font-bold uppercase tracking-widest text-[10px] text-center">Rank</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-[10px]">Tester</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-[10px] text-center hidden sm:table-cell">Bugs</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-[10px] text-center hidden sm:table-cell">Ideas</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-[10px] text-center hidden sm:table-cell">Tasks</TableHead>
                <TableHead className="font-bold uppercase tracking-widest text-[10px] text-right">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                data.map((tester, i) => {
                  const isMe = tester.userId === user.id;
                  return (
                    <TableRow 
                      key={tester.userId}
                      className={cn(
                        "transition-colors group",
                        isMe ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                      )}
                    >
                      <TableCell className="text-center font-bold">
                        {getRankBadge(i)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                            <AvatarImage src={tester.avatar} />
                            <AvatarFallback className="text-[10px]">{tester.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className={cn("text-sm font-bold", isMe && "text-primary")}>{tester.name}</span>
                            {isMe && <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Current User</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium hidden sm:table-cell text-muted-foreground">{tester.bugs}</TableCell>
                      <TableCell className="text-center font-medium hidden sm:table-cell text-muted-foreground">{tester.ideas}</TableCell>
                      <TableCell className="text-center font-medium hidden sm:table-cell text-muted-foreground">{tester.tasks}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-black text-sm">{tester.score}</span>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Points</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          
          {!loading && data.length === 0 && (
            <div className="p-12 text-center text-muted-foreground opacity-50">
              <Medal className="h-10 w-10 mx-auto mb-3" />
              <p className="text-sm">No activity recorded for this app yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
