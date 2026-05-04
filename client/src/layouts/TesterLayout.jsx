import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Beaker, LayoutDashboard, List, User as UserIcon, Settings } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function TesterLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || !user) return null;

  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden border-t">
        <SidebarProvider>
          {/* App Sidebar */}
          <Sidebar>
            <SidebarHeader className="h-14 flex items-center border-b px-4 py-0 flex-row">
              <Beaker className="h-5 w-5 text-purple-500 mr-2" />
              <span className="font-bold text-lg tracking-tight truncate">Tester Panel</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/tester/dashboard'}>
                        <Link to="/tester/dashboard">
                          <LayoutDashboard />
                          <span>Overview</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname.includes('/tester/active') || location.pathname.includes('/tester/apps')}>
                        <Link to="/tester/active">
                          <List />
                          <span>Active Tests</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/profile'}>
                        <Link to="/profile">
                          <UserIcon />
                          <span>Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/tester/settings'}>
                        <Link to="/tester/settings">
                          <Settings />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>

          {/* Main Content Area */}
          <SidebarInset className="flex flex-col min-w-0 bg-transparent">
            {/* Breadcrumb Header */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/tester/dashboard">Tester Panel</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathSegments.length > 1 && <BreadcrumbSeparator />}
                  {pathSegments[1] === "active" && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>Active Tests</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                  {pathSegments[1] === "apps" && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to="/tester/active">Active Tests</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="capitalize">{pathSegments[2]?.replace(/-/g, ' ')}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                  {pathSegments[1] === "settings" && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>Settings</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            <main className="flex-1 overflow-auto bg-muted/5 p-4 md:p-6 custom-scrollbar">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
