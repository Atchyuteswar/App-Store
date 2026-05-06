import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Moon, Sun, Menu, Shield, User, LogOut, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

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
    <header className="sticky top-0 z-50 w-full bg-background border-b md:border-none md:bg-background/80 md:backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Shield className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline text-primary">App Store</span>
        </Link>

        {/* Play Store Styled Search */}
        <div className="flex-1 max-w-2xl px-2 sm:px-4">
          <div className="relative group">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <Input
              placeholder="Search apps..."
              value={searchValue || ""}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-4 rounded-full border-none bg-secondary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary transition-all text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-6 mr-2">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Apps</Link>
            {admin && (
              <Link to="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Admin Panel
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2 border border-border play-shadow">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{admin ? admin.username[0].toUpperCase() : user?.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{admin ? admin.username : user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{admin ? admin.email : user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem onClick={() => navigate('/tester/dashboard')}>
                    <Beaker className="mr-2 h-4 w-4" />
                    <span>Testing Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  logout();
                  navigate('/');
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Toggle pressed={dark} onPressedChange={setDark} size="sm" className="rounded-full">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Toggle>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-left">Navigation</SheetTitle>
              <nav className="flex flex-col gap-4 mt-8">
                <Button variant="ghost" className="justify-start text-lg" asChild onClick={() => setOpen(false)}>
                  <Link to="/">Home</Link>
                </Button>
                {isAuthenticated && (
                  <>
                    <Button variant="ghost" className="justify-start text-lg" asChild onClick={() => setOpen(false)}>
                      <Link to="/profile">Profile</Link>
                    </Button>
                    {user && (
                      <Button variant="ghost" className="justify-start text-lg" asChild onClick={() => setOpen(false)}>
                        <Link to="/tester/dashboard">Testing Hub</Link>
                      </Button>
                    )}
                  </>
                )}
                {admin && (
                  <Button variant="ghost" className="justify-start text-lg" asChild onClick={() => setOpen(false)}>
                    <Link to="/admin/dashboard">Admin Panel</Link>
                  </Button>
                )}
                {!isAuthenticated && (
                  <Button variant="ghost" className="justify-start text-lg" asChild onClick={() => setOpen(false)}>
                    <Link to="/login">Sign In</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
