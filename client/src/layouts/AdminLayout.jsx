import React, { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { 
  LayoutDashboard, 
  Package, 
  Bug, 
  BarChart2, 
  Bell, 
  FileDown, 
  CheckCircle,
  LogOut,
  Home,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarProvider, 
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarRail
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { title: "Apps", icon: Package, path: "/admin/dashboard" },
  { title: "Analytics", icon: BarChart2, path: "/admin/analytics" },
  { title: "Bug Triage", icon: Bug, path: "/admin/bugs" },
  { title: "Approvals", icon: CheckCircle, path: "/admin/approvals" },
  { title: "Announcements", icon: Bell, path: "/admin/announcements" },
  { title: "Export Reports", icon: FileDown, path: "/admin/exports" },
];

export default function AdminLayout() {
  const { admin, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !admin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [loading, isAuthenticated, admin, navigate]);

  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-primary/30 selection:text-primary-foreground w-full font-sans">
        {/* Modern Sticky Header */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl shrink-0">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden text-white/70 hover:text-white transition-colors" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                </div>
                <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hidden sm:inline-block">Admin Console</h1>
                <h1 className="font-bold text-lg sm:hidden">Admin</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-white/90 leading-none">{admin?.username || 'Administrator'}</span>
                <span className="text-[10px] text-white/40 mt-1">{admin?.email}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                <Button variant="ghost" size="sm" className="h-8 rounded-full hover:bg-white/10 text-white/70 hover:text-white" onClick={() => navigate("/")}>
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Store</span>
                </Button>
                <div className="w-[1px] h-4 bg-white/10" />
                <Button variant="ghost" size="sm" className="h-8 rounded-full hover:bg-red-500/10 text-white/70 hover:text-red-400" onClick={async () => { await logout(); navigate("/admin/login"); }}>
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Enhanced Sidebar */}
          <Sidebar className="hidden md:flex border-r border-white/5 bg-black/40 backdrop-blur-md">
            <SidebarHeader className="h-20 flex items-center border-b border-white/5 px-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-bold text-sm block leading-tight">Control Panel</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Management</span>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {adminNavItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={location.pathname === item.path}
                          className={cn(
                            "h-11 px-4 rounded-xl transition-all duration-300 group",
                            location.pathname === item.path 
                              ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <Link to={item.path} className="flex items-center gap-3">
                            <item.icon className={cn(
                              "h-4 w-4 transition-transform duration-300",
                              location.pathname === item.path ? "scale-110" : "group-hover:scale-110"
                            )} />
                            <span className="font-medium">{item.title}</span>
                            {location.pathname === item.path && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            
            <div className="mt-auto p-6 border-t border-white/5">
               <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter mb-2">System Status</p>
                 <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                   <span className="text-xs font-medium text-white/80">Operational</span>
                 </div>
               </div>
            </div>
            <SidebarRail />
          </Sidebar>

          {/* Main Content Area */}
          <SidebarInset className="flex flex-col min-w-0 bg-[#050505]">
            <main className="flex-1 overflow-auto custom-scrollbar">
              <div className="max-w-7xl mx-auto p-6 md:p-10">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
