import { Link, useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { 
  Activity, LayoutDashboard, Target, Users, Play, FileBarChart, 
  Search, SlidersHorizontal, ChevronRight, Menu, X, Settings, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOUNT_DATA } from "@/lib/data";
import { useDataStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/programs", label: "Programs", icon: Activity },
  { href: "/beneficiaries", label: "Beneficiaries", icon: Users },
  { href: "/operations", label: "Operations", icon: Play },
  { href: "/investigate", label: "Investigate", icon: SlidersHorizontal },
  { href: "/actions", label: "Actions", icon: Target },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Data / Settings", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { actions, beneficiaries } = useDataStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locality, setLocality] = useState("All Localities");
  const [cohort, setCohort] = useState("All Cohorts");
  const [period, setPeriod] = useState("Feb–Aug 2026");
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  const pendingActions = actions.filter(a => a.status === 'pending').length;
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return [
      ...MOUNT_DATA.programs.filter(item => item.name.toLowerCase().includes(q)).map(item => ({ type: "Program", label: item.name, href: `/programs/${item.id}` })),
      ...beneficiaries.filter(item => `${item.name} ${item.profession}`.toLowerCase().includes(q)).map(item => ({ type: "Beneficiary", label: `${item.name} · ${item.profession}`, href: `/beneficiaries/${item.id}` })),
      ...actions.filter(item => item.title.toLowerCase().includes(q)).map(item => ({ type: "Action", label: item.title, href: "/actions" })),
    ].slice(0, 8);
  }, [actions, beneficiaries, query]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary selection:text-white">
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] z-50 mix-blend-multiply" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex h-14 items-center justify-between px-4 border-b border-border bg-card absolute inset-x-0 top-0 z-30">
        <div className="flex items-center gap-2 text-foreground font-semibold tracking-tight">
          <div className="w-3 h-3 bg-primary" />
          Impact Intelligence
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r border-border bg-card flex flex-col justify-between shrink-0 absolute inset-y-0 left-0 z-40 transform transition-transform md:relative md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div>
          <div className="h-14 hidden md:flex items-center px-6 border-b border-border">
            <div className="flex items-center gap-2 text-foreground font-semibold tracking-tight">
              <div className="w-3 h-3 bg-primary" />
              Impact Intelligence
            </div>
          </div>
          
          <div className="p-4 space-y-6">
            <div>
              <p className="px-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Workspace</p>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/');
                  return (
                    <Link key={item.href} href={item.href} className={cn(
                      "flex items-center gap-3 px-2 py-2 text-sm font-medium transition-colors hover:bg-accent/50 group relative",
                      isActive ? "text-foreground bg-accent" : "text-muted-foreground"
                    )}>
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                      )}
                      <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {item.label}
                      {item.href === '/actions' && pendingActions > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center bg-primary text-[10px] text-white font-mono">
                          {pendingActions}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-medium">
              PS
            </div>
            <div>
              <p className="text-sm font-medium leading-none">{MOUNT_DATA.program.manager}</p>
              <p className="text-xs text-muted-foreground mt-1">Program Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-background/50 bg-grid-pattern h-full md:h-auto pt-14 md:pt-0">
        
        {/* Global Context Header */}
        <header className="hidden md:flex h-14 border-b border-border bg-card/80 backdrop-blur items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center text-muted-foreground gap-2">
              <span className="font-medium text-foreground">{MOUNT_DATA.program.name}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
              <span>{locality}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
              <span>{cohort}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
              <span>{period}</span>
            </div>
            <div className="h-4 w-px bg-border mx-2" />
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground">Pop:</span>
              <span className="font-medium">{MOUNT_DATA.program.totalBeneficiaries}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background hover:bg-accent/50 transition-colors text-sm text-muted-foreground w-64 justify-between">
              <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search...</span>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-muted rounded-sm">⌘K</kbd>
            </button>
            <button onClick={() => setFiltersOpen(true)} aria-label="Global filters" className="p-1.5 border border-transparent hover:border-border hover:bg-accent/50 text-muted-foreground transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button onClick={() => setLocation("/")} aria-label="Attention notifications" className="relative p-1.5 border border-transparent hover:border-border hover:bg-accent/50 text-muted-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 bg-primary text-white text-[9px] font-mono flex items-center justify-center">3</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader><DialogTitle>Search workspace</DialogTitle></DialogHeader>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Programs, beneficiaries, actions…" className="w-full border border-border bg-background py-2.5 pl-10 pr-3 outline-none focus:border-primary" />
          </div>
          <div className="min-h-36 divide-y divide-border border border-border">
            {!query && <p className="p-6 text-sm text-muted-foreground">Start typing to search across the current NGO scope.</p>}
            {query && results.length === 0 && <p className="p-6 text-sm text-muted-foreground">No matching records.</p>}
            {results.map(result => (
              <Link key={`${result.type}-${result.label}`} href={result.href} onClick={() => setSearchOpen(false)} className="flex items-center justify-between p-4 hover:bg-accent/40">
                <span>{result.label}</span><Badge variant="outline" className="font-mono text-[10px] uppercase">{result.type}</Badge>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader><DialogTitle>Global context</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">Locality
              <select value={locality} onChange={event => setLocality(event.target.value)} className="border border-border bg-background p-2">
                <option>All Localities</option>{MOUNT_DATA.localities.map(item => <option key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm">Cohort
              <select value={cohort} onChange={event => setCohort(event.target.value)} className="border border-border bg-background p-2">
                <option>All Cohorts</option><option>MH-01</option><option>MH-02</option><option>MH-03</option><option>MH-04</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">Period
              <select value={period} onChange={event => setPeriod(event.target.value)} className="border border-border bg-background p-2">
                <option>Feb–Aug 2026</option><option>Last 30 days</option><option>Current quarter</option>
              </select>
            </label>
            <button onClick={() => setFiltersOpen(false)} className="bg-primary text-primary-foreground p-2 text-sm font-mono uppercase">Apply context</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}