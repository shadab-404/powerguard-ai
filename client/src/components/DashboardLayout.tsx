/**
 * DashboardLayout — responsive shell: sidebar (desktop), sheet nav (mobile), top bar.
 */

import { ReactNode, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  FileText,
  Hash,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Meters", href: "/meters", icon: Hash },
  { label: "Alerts", href: "/alerts", icon: AlertTriangle },
  { label: "Reports", href: "/reports", icon: FileText },
] as const;

function routeMeta(pathname: string): { title: string; subtitle: string } {
  if (pathname.startsWith("/meter/")) {
    return {
      title: "Meter detail",
      subtitle: "Consumption, risk, and investigation tools",
    };
  }
  const map: Record<string, { title: string; subtitle: string }> = {
    "/": {
      title: "Operations overview",
      subtitle: "KPIs, trends, and priority alerts",
    },
    "/meters": {
      title: "Meter inventory",
      subtitle: "Search and filter monitored endpoints",
    },
    "/alerts": {
      title: "Alerts",
      subtitle: "Suspicious activity and escalation queue",
    },
    "/reports": {
      title: "Reports",
      subtitle: "Exports and compliance summaries",
    },
    "/settings": {
      title: "Settings",
      subtitle: "Workspace and notification preferences",
    },
  };
  return (
    map[pathname] ?? {
      title: "PowerGuard",
      subtitle: "Electricity theft detection",
    }
  );
}

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const location = useLocation();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.href ||
          (item.href !== "/" && location.pathname.startsWith(item.href));

        return (
          <Link key={item.href} to={item.href} onClick={onNavigate}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-5 shrink-0 opacity-90" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const meta = useMemo(() => routeMeta(location.pathname), [location.pathname]);

  const initials = useMemo(() => {
    if (!user?.name) return "?";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sidebarBrand = (
    <div className="flex items-center gap-3 px-2">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-primary/20">
        <Activity className="size-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold tracking-tight">
          PowerGuard
        </p>
        <p className="truncate text-xs text-muted-foreground">AI detection</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="border-b border-sidebar-border p-5">{sidebarBrand}</div>
          <div className="flex-1 overflow-y-auto p-3">
            <NavLinks />
          </div>
          <div className="border-t border-sidebar-border p-3">
            <Link to="/settings">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Settings className="size-5" />
                Settings
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-5" />
              Sign out
            </button>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {isMobile && (
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Open menu">
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="flex w-[min(100%,18rem)] flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
                  >
                    <SheetHeader className="border-b border-sidebar-border p-5 text-left">
                      <SheetTitle className="sr-only">Navigation</SheetTitle>
                      {sidebarBrand}
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-3">
                      <NavLinks onNavigate={() => setMobileNavOpen(false)} />
                    </div>
                    <div className="border-t border-sidebar-border p-3">
                      <Link
                        to="/settings"
                        onClick={() => setMobileNavOpen(false)}
                      >
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent">
                          <Settings className="size-5" />
                          Settings
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileNavOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <LogOut className="size-5" />
                        Sign out
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  {meta.title}
                </h1>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {meta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-1.5 sm:flex">
                <span
                  className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  aria-hidden
                />
                <span className="text-xs font-medium text-muted-foreground">
                  Live
                </span>
              </div>

              {switchable && toggleTheme && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={
                    theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
                  }
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full font-semibold"
                    aria-label="Account menu"
                  >
                    {initials}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
