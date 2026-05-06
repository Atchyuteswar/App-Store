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
  ChevronRight,
  ListTodo,
  History,
  BarChart2,
  Trophy,
  Search,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SearchModal from "@/components/tester/SearchModal";
import CrashReportModal from "@/components/tester/CrashReportModal";
import { getTesterTasks, getTesterPolls } from "@/services/api";
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
  { title: "Tasks", icon: ListTodo, path: "/tester/tasks", badgeKey: 'tasks' },
  { title: "Timeline", icon: History, path: "/tester/timeline" },
  { title: "Bug Reports", icon: Bug, path: "/tester/bugs" },
  { title: "Ideas", icon: Lightbulb, path: "/tester/ideas" },
  { title: "Polls", icon: BarChart2, path: "/tester/polls", badgeKey: 'polls' },
  { title: "Messages", icon: MessageSquare, path: "/tester/messages" },
  { title: "Leaderboard", icon: Trophy, path: "/tester/leaderboard" },
  { title: "Activity", icon: Calendar, path: "/tester/activity" },
  { title: "Notifications", icon: Bell, path: "/tester/notifications" },
  { title: "Profile", icon: User, path: "/tester/profile" },
];

export default function TesterLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCrashModalOpen, setIsCrashModalOpen] = useState(false);
  const [badges, setBadges] = useState({ tasks: 0, polls: 0 });

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBadges();
    }

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated]);

  const fetchBadges = async () => {
    try {
      const [tasksRes, pollsRes] = await Promise.all([
        getTesterTasks(),
        getTesterPolls()
      ]);
      const pendingTasks = (tasksRes.data || []).filter(t => !t.isCompleted).length;
      const unansweredPolls = (pollsRes.data || []).filter(p => !p.hasResponded).length;
      setBadges({ tasks: pendingTasks, polls: unansweredPolls });
    } catch (err) {
      console.error(err);
    }
  };

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
                            {item.badgeKey && badges[item.badgeKey] > 0 && (
                              <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] h-4 min-w-4 px-1 flex items-center justify-center rounded-full">
                                {badges[item.badgeKey]}
                              </Badge>
                            )}
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
              <div className="mx-2 h-4 w-[1px] bg-border hidden md:flex" aria-hidden="true" />
              
              {/* Search Trigger */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-colors ml-2 mr-auto md:mr-0 group"
              >
                <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                <span className="text-xs hidden sm:inline">Search...</span>
                <kbd className="hidden md:inline-flex h-4 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
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

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <CrashReportModal open={isCrashModalOpen} onOpenChange={setIsCrashModalOpen} />

      {/* Floating Action Button for Crash Reporting */}
      <Button
        onClick={() => setIsCrashModalOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 h-12 w-12 rounded-full shadow-2xl bg-red-600 hover:bg-red-700 text-white p-0 z-40 group"
      >
        <Bug className="h-6 w-6 group-hover:scale-110 transition-transform" />
        <span className="absolute right-full mr-3 px-2 py-1 rounded bg-red-600 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Report Crash
        </span>
      </Button>
    </div>
  );
}


