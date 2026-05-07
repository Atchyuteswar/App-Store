import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Zap, Terminal, Activity, ShieldCheck, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, admin, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) return null;

  const profileData = admin || user;
  const isRoleAdmin = !!admin;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-primary/30">
      <Navbar />
      
      <main className="flex-1 container py-20 max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Researcher Profile</Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Identity Hub</h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Manage your neural links & platform credentials</p>
          </div>
          <div className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-[10px] font-black text-white/40 tracking-widest uppercase">Node Sync Active</p>
          </div>
        </div>

        <div className="p-12 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
          <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
          
          <div className="space-y-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-white/5 pb-12">
              <div className="h-32 w-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all duration-700 shadow-2xl relative">
                <User className="h-12 w-12 text-primary" />
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-[#0f0f0f] border border-white/10 flex items-center justify-center shadow-xl">
                  {isRoleAdmin ? <ShieldCheck className="h-5 w-5 text-blue-400" /> : <Terminal className="h-5 w-5 text-primary" />}
                </div>
              </div>
              <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{profileData?.username}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  {isRoleAdmin ? (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black uppercase tracking-widest text-[9px] px-4 h-7">
                      <Shield className="h-3 w-3 mr-2" /> COMMAND LEVEL ACCESS
                    </Badge>
                  ) : (
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] px-4 h-7">
                      <Terminal className="h-3 w-3 mr-2" /> RESEARCHER NODE
                    </Badge>
                  )}
                  <div className="h-4 w-[1px] bg-white/10" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" /> ESTABLISHED 2026
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  Transmission Channel
                </h4>
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 group-hover:bg-white/[0.08] transition-all">
                  <p className="text-sm font-black text-white tracking-widest uppercase">{profileData?.email}</p>
                  <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest mt-2">Primary encrypted communication node</p>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-3">
                  <Key className="h-4 w-4" />
                  Security Protocols
                </h4>
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 group-hover:bg-white/[0.08] transition-all">
                  <p className="text-sm font-black text-white tracking-widest uppercase">Neural Key: Active</p>
                  <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest mt-2">Biometric verification synchronized</p>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {[
            { label: "Research Score", value: "2.4K", icon: Zap, color: "text-primary" },
            { label: "Anomalies Resolved", value: "142", icon: Activity, color: "text-blue-400" },
            { label: "Access Level", value: isRoleAdmin ? "LVL 5" : "LVL 1", icon: Shield, color: "text-purple-400" }
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/[0.08] transition-all duration-500 shadow-xl">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
