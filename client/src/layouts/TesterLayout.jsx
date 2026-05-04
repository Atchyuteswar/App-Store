import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Beaker, LayoutDashboard, List, User, Settings } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
      
      <div className="flex-1 flex flex-col md:flex-row border-t overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r bg-muted/10 shrink-0 p-4 overflow-y-auto">
          <div className="mb-8 px-2 flex items-center gap-2">
            <Beaker className="h-5 w-5 text-purple-500" />
            <h2 className="font-bold text-lg tracking-tight">Tester Panel</h2>
          </div>
          
          <nav className="space-y-1.5">
            <Link 
              to="/tester/dashboard" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${location.pathname === '/tester/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </Link>
            <Link 
              to="/tester/active" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${location.pathname.includes('/tester/active') || location.pathname.includes('/tester/apps') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <List className="h-4 w-4" /> Active Tests
            </Link>
            <Link 
              to="/profile" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${location.pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <Link 
              to="/tester/settings" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${location.pathname === '/tester/settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Breadcrumb Header */}
          <header className="h-14 border-b flex items-center px-6 bg-card shrink-0">
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
        </div>
      </div>
    </div>
  );
}
