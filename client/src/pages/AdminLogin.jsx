import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, Shield, ArrowRight, Zap, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/admin/dashboard", { replace: true });
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast({ title: "Neural Link Established", description: "Admin session initialized successfully." });
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Link Failed",
        description: err.response?.data?.message || "Invalid administrative credentials",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 selection:bg-primary/30 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 h-[600px] w-[600px] bg-primary/5 blur-[120px] rounded-full -ml-80 -mt-80 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[600px] w-[600px] bg-blue-500/5 blur-[120px] rounded-full -mr-80 -mb-80 pointer-events-none" />
      
      <div className="w-full max-w-lg space-y-12 relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-md group hover:border-primary/50 transition-all duration-700">
            <Shield className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-500" />
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-4 h-7 mb-2">Central Security Hub</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Command Center</h1>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Initialize high-level administrative session</p>
        </div>

        <div className="p-10 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="space-y-2 ml-1">
                <Label htmlFor="admin-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Identifier</Label>
              </div>
              <div className="relative group/input">
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="ARCHIVE_ADMIN@SYSTEM"
                  className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white/60 focus-visible:ring-0 placeholder:text-white/5 focus:bg-white/[0.08] transition-all px-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 ml-1">
                <Label htmlFor="admin-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Neural Key</Label>
              </div>
              <div className="relative group/input">
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white/60 focus-visible:ring-0 placeholder:text-white/5 focus:bg-white/[0.08] transition-all px-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-18 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm shadow-[0_0_30px_-10px_rgba(34,197,94,0.5)] transition-all hover:scale-[1.02] active:scale-95 group/btn" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Zap className="h-5 w-5 mr-3 animate-pulse" />
                  Establishing Link...
                </>
              ) : (
                <>
                  Establish Neural Link
                  <ArrowRight className="h-5 w-5 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Link 
            to="/login" 
            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all flex items-center gap-2 group"
          >
            <Terminal className="h-3.5 w-3.5 text-white/10 group-hover:text-primary transition-colors" />
            Standard Terminal Interface
          </Link>
          
          <div className="pt-6 border-t border-white/5 w-full max-w-[200px] flex items-center justify-center">
            <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">Secure Command Node v2.4.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
