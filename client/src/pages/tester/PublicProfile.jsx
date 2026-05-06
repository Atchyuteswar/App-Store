import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "@/services/api";
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
  Calendar, 
  Bug, 
  Lightbulb, 
  CheckCircle2, 
  Award,
  Globe,
  ArrowRight,
  ShieldCheck,
  Star,
  Activity,
  User as UserIcon,
  Package,
  MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setDebugData(null);
      const { data } = await getPublicProfile(username);
      setUser(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.status === 404 ? "Profile not found" : "Failed to load profile");
      setDebugData(err.response?.data?.debug);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <ProfileError message={error} debug={debugData} />;

  return (
    <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-1000">
      {/* Hero Header */}
      <div className="h-[35vh] md:h-[45vh] bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-6 h-full flex flex-col items-center justify-end relative z-10 pb-16 md:pb-28">
          <Avatar className="h-24 w-24 md:h-40 md:w-40 border-8 border-background/20 shadow-[0_0_50px_rgba(0,0,0,0.3)] mb-6 ring-1 ring-white/10 shrink-0">
            <AvatarImage src={user.profile_image} className="object-cover" />
            <AvatarFallback className="text-3xl md:text-5xl font-black bg-muted text-primary">
              {(user.display_name?.charAt(0) || user.username?.charAt(0) || "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight drop-shadow-lg capitalize">
              {user.display_name || user.username}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] bg-background/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                <Calendar className="h-3 w-3 text-primary" />
                Joined {format(new Date(user.created_at), "MMMM yyyy")}
              </div>
              <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 shadow-xl shadow-primary/30">
                ELITE TESTER
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20 space-y-10">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Bugs Filed", value: user.stats?.bugs || 0, icon: Bug, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Ideas Shared", value: user.stats?.ideas || 0, icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Tasks Done", value: user.stats?.tasks || 0, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Messages", value: user.stats?.messages || 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-2xl bg-card/80 backdrop-blur-xl hover:scale-105 transition-all duration-300 ring-1 ring-white/5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={cn("p-3 rounded-2xl mb-4", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div className="text-3xl font-black leading-none tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground mt-2">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Bio Section if exists */}
            {user.bio && (
              <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">About Tester</h3>
                <p className="text-lg font-medium leading-relaxed italic text-muted-foreground">
                  "{user.bio}"
                </p>
              </Card>
            )}

            {/* Achievements */}
            <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md overflow-hidden ring-1 ring-white/5">
              <CardHeader className="bg-muted/10 border-b border-white/5">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary" /> Unlocked Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {user.achievements?.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium italic">No achievements unlocked in this season yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {user.achievements.map((achievement) => (
                      <div key={achievement.key} className="flex flex-col items-center text-center p-5 rounded-3xl bg-primary/5 border border-primary/10 hover:border-primary/30 hover:bg-primary/10 transition-all group">
                        <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                          <Award className="h-7 w-7 text-primary" />
                        </div>
                        <p className="text-sm font-black leading-tight mb-1">{achievement.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 opacity-80">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participation Bio */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-[2.5rem] p-10 border border-primary/20 relative overflow-hidden group shadow-xl">
              <ShieldCheck className="absolute -right-12 -bottom-12 h-64 w-64 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 tracking-tight">Community Impact</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xl font-medium">
                  This tester is a cornerstone of our beta community. With a total of <span className="text-primary font-black">{user.stats?.totalActions || 0} verified contributions</span>, they help ensure that every release meets the highest standards of quality and performance.
                </p>
                <div className="flex items-center gap-6 mt-10">
                  <div className="flex -space-x-4 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="inline-block h-12 w-12 rounded-full ring-4 ring-card bg-muted/50 flex items-center justify-center backdrop-blur-sm shadow-xl">
                        <Package className="h-5 w-5 text-primary/40" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Verified Contributor</p>
                    <p className="text-xs font-bold text-muted-foreground">Active across 5+ Production Beta Tracks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> Platform Verified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-600/10 text-green-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">Authentic Tester</p>
                    <p className="text-[10px] text-muted-foreground">Verified Beta Participant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center p-6 border-2 border-dashed rounded-3xl opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Join the community</p>
              <p className="text-xs mt-2 font-medium">Want your own public tester profile? Join the hub today.</p>
              <Button asChild variant="link" className="text-primary text-xs mt-2 h-auto p-0">
                <Link to="/login" className="flex items-center gap-1">
                  Learn More <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 pt-16 text-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Part of the App Store Beta Program © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-muted" />
      <div className="max-w-4xl mx-auto px-6 -mt-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="h-64 rounded-3xl" />
          </div>
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

function ProfileError({ message, debug }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="p-6 rounded-full bg-red-500/10 mb-6">
        <UserIcon className="h-12 w-12 text-red-500 opacity-20" />
      </div>
      <h2 className="text-2xl font-bold">{message}</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        This profile may be private, the link might be incorrect, or the username hasn't been saved yet.
      </p>
      
      {debug && (
        <div className="mt-6 p-4 rounded-2xl bg-muted/30 border text-[10px] font-mono text-left max-w-xs overflow-hidden">
          <p className="text-muted-foreground uppercase font-bold mb-1">Debug Info:</p>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
      )}

      <Button asChild className="mt-8 rounded-full px-8">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
