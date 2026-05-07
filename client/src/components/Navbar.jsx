import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Moon, Sun, Menu, Shield, User, LogOut, Beaker, Terminal, Activity, Zap, Cpu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Navbar({ onSearch, searchValue }) {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("theme") === "dark";
    return false;
  });
  const [open, setOpen] = useState(false);
  const { isAuthenticated, admin, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 selection:bg-primary/30">
      <div className="container flex h-20 items-center justify-between gap-8">
        {/* Logo Architecture */}
        <Link to="/" className="flex items-center gap-4 shrink-0 group">
          <div className="h-12 w-12 rounded-[1rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] group-hover:border-primary/50 group-hover:scale-105 transition-all duration-700">
            <Shield className="text-primary h-6 w-6 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-white leading-none uppercase">Antigravity</span>
            <span className="text-[9px] font-black tracking-[0.4em] text-primary uppercase mt-1">Research Registry</span>
          </div>
        </Link>

        {/* Global Search Matrix */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <div className="relative w-full group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="SCAN ARCHIVES, EXPERIMENTS, AND NODES..."
              value={searchValue || ""}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full h-12 pl-14 pr-6 rounded-2xl border border-white/5 bg-white/[0.03] focus-visible:bg-white/[0.05] focus-visible:ring-1 focus-visible:ring-primary/40 transition-all text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/10"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] h-5">SYNC ACTIVE</Badge>
            </div>
          </div>
        </div>

        {/* Tactical Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden xl:flex items-center gap-10 mr-6">
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all flex items-center gap-2 group">
              <Globe className="h-3.5 w-3.5 text-white/10 group-hover:text-primary transition-colors" />
              Explorer
            </Link>
            {admin && (
              <Link to="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
                Command Center
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all flex items-center gap-2 group">
                <Terminal className="h-3.5 w-3.5 text-white/10 group-hover:text-primary transition-colors" />
                Access Portal
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 px-2 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarFallback className="bg-primary/20 text-primary font-black text-xs">
                          {admin ? admin.username[0].toUpperCase() : user?.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{admin ? admin.username : user?.username}</span>
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{admin ? 'Admin' : 'Researcher'}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 bg-[#0a0a0a] border-white/10 text-white mt-4 p-2 rounded-[1.5rem] shadow-2xl backdrop-blur-2xl" align="end" forceMount>
                  <DropdownMenuLabel className="p-6 border-b border-white/5">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-black text-white tracking-tight uppercase">{admin ? admin.username : user?.username}</p>
                      <div className="flex items-center gap-3">
                        <Badge className={cn("text-[8px] font-black h-5 px-2 tracking-widest", admin ? "bg-primary/10 text-primary border-primary/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                          {admin ? 'COMMAND ACCESS' : 'RESEARCH NODE'}
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-white/10" />
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <div className="p-2 space-y-1 mt-2">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="h-12 rounded-xl focus:bg-white/5 cursor-pointer group px-4">
                      <User className="mr-3 h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Identity Hub</span>
                    </DropdownMenuItem>
                    {user && (
                      <DropdownMenuItem onClick={() => navigate('/tester/dashboard')} className="h-12 rounded-xl focus:bg-primary/10 cursor-pointer group px-4">
                        <Beaker className="mr-3 h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Researcher Hub</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/5 my-2 mx-2" />
                    <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="h-12 rounded-xl focus:bg-red-500/10 text-red-500/60 cursor-pointer group px-4">
                      <LogOut className="mr-3 h-4 w-4 text-red-500/20 group-hover:text-red-500 transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDark(!dark)}
              className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all"
            >
              {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] bg-[#050505] border-white/10 p-0 overflow-hidden">
                <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="p-12 border-b border-white/5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Shield className="text-primary h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Navigation</h2>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Select tactical destination</p>
                    </div>
                  </div>
                </div>

                <nav className="flex flex-col p-10 gap-4 relative z-10">
                  {[
                    { label: "Explorer", path: "/", icon: Globe },
                    { label: "Account Profile", path: "/profile", icon: User, auth: true },
                    { label: "Researcher Hub", path: "/tester/dashboard", icon: Beaker, tester: true },
                    { label: "Command Center", path: "/admin/dashboard", icon: Cpu, admin: true },
                    { label: "Portal Access", path: "/login", icon: Terminal, guest: true }
                  ].map((item) => {
                    if (item.auth && !isAuthenticated) return null;
                    if (item.tester && !user) return null;
                    if (item.admin && !admin) return null;
                    if (item.guest && isAuthenticated) return null;

                    return (
                      <Button key={item.label} variant="ghost" className="h-20 justify-start px-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group" asChild onClick={() => setOpen(false)}>
                        <Link to={item.path} className="flex items-center gap-6">
                          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500">
                            <item.icon className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-base font-black text-white uppercase tracking-tighter">{item.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </nav>

                <div className="absolute bottom-10 left-0 right-0 px-10 text-center">
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                    <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">Secure Command Node v2.4.0</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
