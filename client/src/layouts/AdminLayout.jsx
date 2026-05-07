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
      <div className="min-h-screen flex flex-col bg-background w-full">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur shrink-0">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h1 className="font-bold text-lg hidden sm:inline-block">Admin Console</h1>
              <h1 className="font-bold text-lg sm:hidden">Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline">{admin?.email}</span>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-1" />Store
              </Button>
              <Button variant="outline" size="sm" onClick={async () => { await logout(); navigate("/admin/login"); }}>
                <LogOut className="h-4 w-4 mr-1" />Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <Sidebar className="hidden md:flex">
            <SidebarHeader className="h-14 flex items-center border-b px-4">
              <span className="font-bold text-lg tracking-tight">Admin Menu</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminNavItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={location.pathname === item.path}
                          className={location.pathname === item.path ? "!bg-primary/10 !text-primary hover:!bg-primary/20" : ""}
                        >
                          <Link to={item.path}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>

          <SidebarInset className="flex flex-col min-w-0 bg-muted/5">
            <main className="flex-1 overflow-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
