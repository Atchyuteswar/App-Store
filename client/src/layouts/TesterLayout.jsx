import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { 
  Beaker, 
  LayoutDashboard, 
  Package, 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  Calendar, 
  Bell, 
  User,
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { title: "Overview", icon: LayoutDashboard, path: "/tester/dashboard" },
  { title: "My Apps", icon: Package, path: "/tester/apps" },
  { title: "Bug Reports", icon: Bug, path: "/tester/bugs" },
  { title: "Ideas", icon: Lightbulb, path: "/tester/ideas" },
  { title: "Messages", icon: MessageSquare, path: "/tester/messages" },
  { title: "Activity", icon: Calendar, path: "/tester/activity" },
  { title: "Notifications", icon: Bell, path: "/tester/notifications" },
  { title: "Profile", icon: User, path: "/tester/profile" },
];

export default function TesterLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const getBreadcrumbLabel = (segment) => {
    const item = navItems.find(n => n.path.includes(segment));
    return item ? item.title : segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  // Mobile Bottom Bar Logic
  const primaryTabs = navItems.slice(0, 4);
  const moreTabs = navItems.slice(4);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden border-t">
        <SidebarProvider>
          {/* Desktop Sidebar */}
          <Sidebar className="hidden md:flex">
            <SidebarHeader className="h-14 flex items-center border-b px-4 py-0 flex-row">
              <Beaker className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-bold text-lg tracking-tight truncate">Tester Hub</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => (
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

          {/* Main Content Area */}
          <SidebarInset className="flex flex-col min-w-0 bg-transparent">
            {/* Breadcrumb Header */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4 sticky top-0 z-10">
              <SidebarTrigger className="-ml-1 hidden md:flex" />
              <div className="md:hidden flex items-center gap-2">
                <Beaker className="h-5 w-5 text-green-600" />
                <span className="font-bold">Tester Hub</span>
              </div>
              <Separator orientation="vertical" className="mx-2 h-4 hidden md:flex" />
              <Breadcrumb className="hidden sm:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/tester/dashboard">Tester Panel</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathSegments.slice(1).map((segment, idx) => (
                    <React.Fragment key={segment}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {idx === pathSegments.length - 2 ? (
                          <BreadcrumbPage>{getBreadcrumbLabel(segment)}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={`/tester/${segment}`}>{getBreadcrumbLabel(segment)}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            <main className="flex-1 overflow-auto bg-muted/5 p-4 md:p-8 custom-scrollbar">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-center justify-around h-16 px-2 shadow-lg">
        {primaryTabs.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        ))}
        
        <DropdownMenu open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              moreTabs.some(t => t.path === location.pathname) ? "text-primary" : "text-muted-foreground"
            )}>
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            {moreTabs.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link to={item.path} className="flex items-center gap-3 w-full cursor-pointer">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {location.pathname === item.path && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
}


