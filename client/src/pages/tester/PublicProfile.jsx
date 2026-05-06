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
  Package
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
    <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="h-64 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="max-w-4xl mx-auto px-6 h-full flex flex-col items-center justify-center relative z-10 pt-12">
          <Avatar className="h-32 w-32 border-4 border-background shadow-2xl mb-4">
            <AvatarImage src={user.profile_image} />
            <AvatarFallback className="text-4xl font-bold bg-muted">
              {user.display_name?.charAt(0) || user.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-3xl font-black text-foreground tracking-tight drop-shadow-sm">{user.display_name || user.username}</h1>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                <Calendar className="h-3.5 w-3.5" />
                Member Since {format(new Date(user.created_at), "MMM yyyy")}
              </div>
              <Badge className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-2 py-0">
                PRO TESTER
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Bugs Filed", value: user.stats.bugs, icon: Bug, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Ideas Shared", value: user.stats.ideas, icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Tasks Done", value: user.stats.tasks, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Level", value: Math.floor((user.stats.bugs + user.stats.ideas + user.stats.tasks) / 10) + 1, icon: Star, color: "text-primary", bg: "bg-primary/10" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-xl bg-card/50 backdrop-blur-md">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={cn("p-2 rounded-xl mb-2", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div className="text-2xl font-black leading-none">{stat.value}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Achievements */}
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
              <CardHeader className="bg-muted/10 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Unlocked Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {user.achievements?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-4">No achievements unlocked yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {user.achievements.map((achievement) => (
                      <div key={achievement.key} className="flex flex-col items-center text-center p-4 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all group">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-xs font-bold leading-tight">{achievement.name}</p>
                        <p className="text-[9px] text-muted-foreground mt-1 line-clamp-1">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participation Bio */}
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
              <ShieldCheck className="absolute -right-8 -bottom-8 h-48 w-48 text-primary/5" />
              <h3 className="text-xl font-bold mb-3">Community Contributions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                This tester is an active part of our beta community, helping developers squash bugs and refine user experiences across various applications. Their contributions help ensure higher quality releases for everyone.
              </p>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-3 overflow-hidden">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-4 ring-background bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4 opacity-30" />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active across multiple projects</p>
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
