import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  ShieldCheck,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  FileDown,
  CheckCircle2,
  Check,
  CalendarCheck,
  Users,
  ClipboardList,
  Smartphone,
  Plus,
} from 'lucide-react';

import { ImpactStoreProvider } from './data/impactStore';
import { ProgramOverview } from './pages/ProgramOverview';
import { ProgrammesContextBar } from './components/ProgrammesContextBar';
import { SonnerToast, type ToastItem } from './components/SonnerToast';

const OperationsAudits = lazy(() => import('./pages/OperationsAudits').then(m => ({ default: m.OperationsAudits })));
const BaselineProfile = lazy(() => import('./pages/BaselineProfile').then(m => ({ default: m.BaselineProfile })));
const TrainingEarlySignals = lazy(() => import('./pages/TrainingEarlySignals').then(m => ({ default: m.TrainingEarlySignals })));
const IncomeChange = lazy(() => import('./pages/IncomeChange').then(m => ({ default: m.IncomeChange })));
const Entrepreneurship = lazy(() => import('./pages/Entrepreneurship').then(m => ({ default: m.Entrepreneurship })));
const DigitalAdoption = lazy(() => import('./pages/DigitalAdoption').then(m => ({ default: m.DigitalAdoption })));
const PrePostSummary = lazy(() => import('./pages/PrePostSummary').then(m => ({ default: m.PrePostSummary })));
const GeographicComparison = lazy(() => import('./pages/GeographicComparison').then(m => ({ default: m.GeographicComparison })));
const NGOPerformance = lazy(() => import('./pages/NGOPerformance').then(m => ({ default: m.NGOPerformance })));
const NgoErpConsole = lazy(() => import('./pages/NgoErpConsole').then(m => ({ default: m.NgoErpConsole })));
const FieldOfficerApp = lazy(() => import('./pages/FieldOfficerApp').then(m => ({ default: m.FieldOfficerApp })));

export type PerspectiveId = 'funder' | 'ngo_erp' | 'field_app';

export type ScreenId =
  | 'overview'
  | 'income' | 'entrepreneurship' | 'sustainability'
  | 'digital' | 'financial' | 'prepost'
  | 'ngo'
  | 'geographic'
  | 'operations' | 'baseline' | 'training' | 'training-outcome';

export type PillarId = 'pulse' | 'programmes' | 'ngo' | 'operations';

interface PillarNav {
  id: PillarId;
  label: string;
  icon: React.ElementType;
  defaultScreen: ScreenId;
}

const PILLARS: PillarNav[] = [
  { id: 'pulse',       label: 'Pulse',               icon: LayoutDashboard, defaultScreen: 'geographic' },
  { id: 'programmes',  label: 'Programmes',          icon: FolderKanban,    defaultScreen: 'income' },
  { id: 'ngo',         label: 'NGO Partners',        icon: Building2,       defaultScreen: 'ngo' },
  { id: 'operations',  label: 'Operations & Audits', icon: ShieldCheck,     defaultScreen: 'operations' },
];

const PROGRAMME_TABS: { id: ScreenId; label: string }[] = [
  { id: 'income',           label: 'Earnings & Income' },
  { id: 'entrepreneurship', label: 'Enterprise & Survival' },
  { id: 'digital',          label: 'Financial & Digital' },
  { id: 'prepost',          label: 'Before vs. After' },
];

const OPERATIONS_TABS: { id: ScreenId; label: string }[] = [
  { id: 'operations', label: 'Audit Cases & Tranche Governance' },
  { id: 'training',   label: 'Training & Execution Quality' },
  { id: 'baseline',   label: 'Intake Baseline (M0)' },
];

const SEARCHABLE_ITEMS: { id: ScreenId; label: string; pillar: string }[] = [
  { id: 'overview',         label: 'Portfolio Overview',              pillar: 'Executive Summary' },
  { id: 'income',           label: 'Income Lift & Trajectory',        pillar: 'Programmes' },
  { id: 'entrepreneurship', label: 'Enterprise Setup & QR Pay',       pillar: 'Programmes' },
  { id: 'sustainability',   label: '6-Month Business Survival',       pillar: 'Programmes' },
  { id: 'digital',          label: 'Digital Payments Adoption',       pillar: 'Programmes' },
  { id: 'financial',        label: 'Banking & Formal Credit',         pillar: 'Programmes' },
  { id: 'prepost',          label: 'Pre vs. Post Endline Summary',    pillar: 'Programmes' },
  { id: 'ngo',              label: 'NGO 1:1 Comparative Arena',       pillar: 'NGO Partners' },
  { id: 'geographic',       label: 'State & District Saturation',     pillar: 'Geographies' },
  { id: 'operations',       label: 'Audit Cases & Tranche Governance',pillar: 'Operations & Audits' },
  { id: 'training',         label: 'Training & Execution Quality',    pillar: 'Operations & Audits' },
  { id: 'baseline',         label: 'Beneficiary Intake Baseline (M0)',pillar: 'Operations & Audits' },
];

function getActivePillar(screenId: ScreenId): PillarId {
  if (screenId === 'geographic' || screenId === 'overview') return 'pulse';
  if (['income', 'entrepreneurship', 'sustainability', 'digital', 'financial', 'prepost'].includes(screenId)) {
    return 'programmes';
  }
  if (screenId === 'ngo') return 'ngo';
  if (['operations', 'baseline', 'training', 'training-outcome'].includes(screenId)) {
    return 'operations';
  }
  return 'pulse';
}

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-[#F6F3EC] w-full rounded-2xl border border-[#E3DDD0] p-12">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#0B4A7D] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-sans text-[#8C8479] tracking-wider uppercase">Loading analytical models...</span>
    </div>
  </div>
);

function App() {
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search).get('screen') as ScreenId;
      if (search) return search;
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (hash) return hash;
    }
    return 'geographic';
  });
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [perspective, setPerspective] = useState<PerspectiveId>('funder');
  const [erpTab, setErpTab] = useState<'batches' | 'beneficiaries' | 'qa_queue'>('batches');

  // Persistent Programmes Hub Filter State
  const [programFilter, setProgramFilter] = useState<'micro-skilling' | 'literacy'>('micro-skilling');
  const [stateFilter, setStateFilter] = useState<string>('All States');
  const [ngoFilter, setNgoFilter] = useState<string>('All NGOs');
  const [cohortFilter, setCohortFilter] = useState<string>('All Cohorts');

  const activePillar = getActivePillar(activeId);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handlePillarClick = (pillarId: PillarId) => {
    const p = PILLARS.find(item => item.id === pillarId);
    if (p) {
      setActiveId(p.defaultScreen);
      if (isMobile) setSidebarOpen(false);
    }
  };

  const addToast = (title: string, desc?: string) => {
    const id = String(Date.now());
    setToasts(prev => [...prev, { id, title, desc }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleExport = () => {
    addToast('Executive Brief Generated', 'FY 2024–25 Portfolio summary exported for Board review.');
    window.print();
  };

  const renderPage = () => {
    if (perspective === 'ngo_erp') {
      return <NgoErpConsole activeTab={erpTab} onSelectTab={setErpTab} />;
    }
    if (perspective === 'field_app') {
      return <FieldOfficerApp />;
    }
    switch (activeId) {
      case 'overview':         return <ProgramOverview onNavigate={setActiveId} />;
      case 'operations':       return <OperationsAudits />;
      case 'baseline':         return <BaselineProfile onNavigate={(id) => setActiveId(id as ScreenId)} />;
      case 'training':         return <TrainingEarlySignals onNavigate={(id) => setActiveId(id as ScreenId)} />;
      case 'income':           return <IncomeChange selectedProgram={programFilter} onNavigate={setActiveId} />;
      case 'entrepreneurship': return <Entrepreneurship selectedProgram={programFilter} onNavigate={setActiveId} />;
      case 'sustainability':   return <Entrepreneurship selectedProgram={programFilter} onNavigate={setActiveId} />;
      case 'digital':          return <DigitalAdoption selectedProgram={programFilter} onNavigate={setActiveId} />;
      case 'financial':        return <DigitalAdoption selectedProgram={programFilter} onNavigate={setActiveId} />;
      case 'prepost':          return <PrePostSummary selectedProgram={programFilter} onNavigate={setActiveId} />;
      case 'geographic':       return <GeographicComparison onNavigate={(id) => setActiveId(id as ScreenId)} />;
      case 'ngo':              return <NGOPerformance />;
      case 'training-outcome': return <TrainingEarlySignals onNavigate={(id) => setActiveId(id as ScreenId)} />;
      default:                 return <ProgramOverview onNavigate={setActiveId} />;
    }
  };

  const filteredSearchItems = SEARCHABLE_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.pillar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePillarObj = PILLARS.find(p => p.id === activePillar);
  const activeProgrammeTab = PROGRAMME_TABS.find(t => t.id === activeId);
  const activeOperationsTab = OPERATIONS_TABS.find(t => t.id === activeId);

  const subLabel = activeProgrammeTab?.label || activeOperationsTab?.label;

  return (
    <ImpactStoreProvider>
      <div className="flex min-h-screen bg-[#F7F4ED] text-[#1C1917] relative overflow-x-clip">
        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── 240px FIXED NAVIGATION SIDEBAR / 280px MOBILE DRAWER (ZERO SCROLLBAR) ── */}
        <aside
          className={`h-screen flex flex-col justify-between flex-shrink-0 bg-[#EFECE4] border-r border-[#E2DDD2] transition-all duration-200 select-none pb-4 ${
            isMobile
              ? 'fixed inset-y-0 left-0 shadow-2xl z-40'
              : 'lg:fixed lg:inset-y-0 lg:left-0 lg:w-[240px] lg:z-30'
          }`}
          style={{
            width: sidebarOpen ? (isMobile ? 280 : 240) : 0,
            minWidth: sidebarOpen ? (isMobile ? 280 : 240) : 0,
            maxWidth: isMobile ? 280 : 240,
            overflow: 'hidden',
          }}
        >
          {/* Top Section: Brand + Navigation */}
          <div className="flex flex-col">
            {/* Brand Header */}
            <div className="h-14 px-5 border-b border-[#E2DDD2] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                {perspective === 'funder' && (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-[#0B4A7D] flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-2xs">
                      B
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold tracking-tight text-[#1C1917] leading-none">
                        Bajaj Finserv
                      </div>
                      <div className="text-[10px] font-sans font-medium text-[#8C8479] tracking-wider mt-0.5">
                        ImpactOS
                      </div>
                    </div>
                  </>
                )}
                {perspective === 'ngo_erp' && (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-[#2E6B4E] flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-2xs">
                      P
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold tracking-tight text-[#1C1917] leading-none">
                        Pratham Foundation
                      </div>
                      <div className="text-[10px] font-sans font-medium text-[#2E6B4E] tracking-wider mt-0.5">
                        NGO Operations ERP
                      </div>
                    </div>
                  </>
                )}
                {perspective === 'field_app' && (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-[#2E6B4E] flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-2xs">
                      <Smartphone size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold tracking-tight text-[#1C1917] leading-none">
                        Frontline Mobile
                      </div>
                      <div className="text-[10px] font-sans font-medium text-[#8C8479] tracking-wider mt-0.5">
                        Pune Urban & Peri-Urban Cluster
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917]"
                  aria-label="Close navigation"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Navigation Links based on active perspective */}
            {perspective === 'funder' && (
              <nav className="p-3 space-y-1.5" role="tablist">
                {PILLARS.map(p => {
                  const Icon = p.icon;
                  const isActive = activePillar === p.id;

                  return (
                    <button
                      key={p.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handlePillarClick(p.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all text-left relative cursor-pointer ${
                        isActive
                          ? 'bg-[#E7F0F7] text-[#0B4A7D] font-semibold'
                          : 'text-[#646058] hover:text-[#181D24] hover:bg-[#EAE6DD]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0B4A7D] rounded-r-full" />
                      )}
                      <Icon
                        size={16}
                        strokeWidth={1.75}
                        className={isActive ? 'text-[#0B4A7D]' : 'text-[#8C8479]'}
                      />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {perspective === 'ngo_erp' && (
              <nav className="p-3 space-y-1.5" role="tablist">
                <button
                  type="button"
                  onClick={() => setErpTab('batches')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all text-left relative cursor-pointer ${
                    erpTab === 'batches'
                      ? 'bg-[#E8F3EC] text-[#2E6B4E] font-semibold'
                      : 'text-[#646058] hover:text-[#181D24] hover:bg-[#EAE6DD]'
                  }`}
                >
                  {erpTab === 'batches' && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#2E6B4E] rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <CalendarCheck size={16} strokeWidth={1.75} className={erpTab === 'batches' ? 'text-[#2E6B4E]' : 'text-[#8C8479]'} />
                    <span className="truncate">Batches & Attendance</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-medium ${
                    erpTab === 'batches' ? 'bg-[#2E6B4E]/15 text-[#2E6B4E]' : 'bg-[#E2DDD2] text-[#8C8479]'
                  }`}>
                    6
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setErpTab('beneficiaries')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all text-left relative cursor-pointer ${
                    erpTab === 'beneficiaries'
                      ? 'bg-[#E8F3EC] text-[#2E6B4E] font-semibold'
                      : 'text-[#646058] hover:text-[#181D24] hover:bg-[#EAE6DD]'
                  }`}
                >
                  {erpTab === 'beneficiaries' && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#2E6B4E] rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <Users size={16} strokeWidth={1.75} className={erpTab === 'beneficiaries' ? 'text-[#2E6B4E]' : 'text-[#8C8479]'} />
                    <span className="truncate">Beneficiary 360° Ledger</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-medium ${
                    erpTab === 'beneficiaries' ? 'bg-[#2E6B4E]/15 text-[#2E6B4E]' : 'bg-[#E2DDD2] text-[#8C8479]'
                  }`}>
                    12
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setErpTab('qa_queue')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all text-left relative cursor-pointer ${
                    erpTab === 'qa_queue'
                      ? 'bg-[#E8F3EC] text-[#2E6B4E] font-semibold'
                      : 'text-[#646058] hover:text-[#181D24] hover:bg-[#EAE6DD]'
                  }`}
                >
                  {erpTab === 'qa_queue' && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#2E6B4E] rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 min-w-0">
                    <ClipboardList size={16} strokeWidth={1.75} className={erpTab === 'qa_queue' ? 'text-[#2E6B4E]' : 'text-[#8C8479]'} />
                    <span className="truncate">Survey QA & Sync Queue</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold bg-[#FDF4E3] text-[#A86414] border border-[#A86414]/20">
                    2
                  </span>
                </button>
              </nav>
            )}

            {perspective === 'field_app' && (
              <div className="p-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F6F3EC] border border-[#E3DDD0] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6B4E] block">
                    Mobile Officer Node
                  </span>
                  <div className="font-semibold text-[#181D24]">Mithun K.</div>
                  <p className="text-[11px] text-[#646058]">Pune Urban & Peri-Urban Cluster Frontline Officer</p>
                  <p className="text-[10px] text-[#8C8479]">Offline-First Device Cache Active</p>
                </div>
                <p className="text-[11px] text-[#646058] leading-relaxed">
                  Interactive mobile simulator running on the right. Tap phone bottom tabs to switch between Today, Attendance, and M6 Survey.
                </p>
              </div>
            )}
          </div>

          {/* ── PERSPECTIVE SWITCHER (FUNDER / NGO ERP / FIELD APP) ── */}
          <div className="p-3 border-t border-[#E2DDD2] bg-[#F7F4ED] flex-shrink-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C8479] mb-1.5 flex items-center justify-between">
              <span>Perspective Switcher</span>
              <span className={`w-1.5 h-1.5 rounded-full ${perspective === 'funder' ? 'bg-[#0B4A7D]' : 'bg-[#2E6B4E]'}`} />
            </div>
            <div className="grid grid-cols-1 gap-1 relative">
              <button
                type="button"
                onClick={() => {
                  setPerspective('funder');
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-transform duration-100 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none ${
                  perspective === 'funder'
                    ? 'text-white'
                    : 'text-[#646058] hover:bg-[#EAE6DD] hover:text-[#181D24]'
                }`}
              >
                {perspective === 'funder' && (
                  <motion.div
                    layoutId="perspective-active-pill"
                    className="absolute inset-0 bg-[#0B4A7D] rounded-lg shadow-2xs z-0"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">Funder · Bajaj CSR</span>
                {perspective === 'funder' && <Check size={12} strokeWidth={2.5} className="relative z-10" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPerspective('ngo_erp');
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-transform duration-100 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2E6B4E]/25 focus-visible:outline-none ${
                  perspective === 'ngo_erp'
                    ? 'text-white'
                    : 'text-[#646058] hover:bg-[#EAE6DD] hover:text-[#181D24]'
                }`}
              >
                {perspective === 'ngo_erp' && (
                  <motion.div
                    layoutId="perspective-active-pill"
                    className="absolute inset-0 bg-[#2E6B4E] rounded-lg shadow-2xs z-0"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">NGO ERP · Pratham Pune</span>
                {perspective === 'ngo_erp' && <Check size={12} strokeWidth={2.5} className="relative z-10" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPerspective('field_app');
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-transform duration-100 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2E6B4E]/25 focus-visible:outline-none ${
                  perspective === 'field_app'
                    ? 'text-white'
                    : 'text-[#646058] hover:bg-[#EAE6DD] hover:text-[#181D24]'
                }`}
              >
                {perspective === 'field_app' && (
                  <motion.div
                    layoutId="perspective-active-pill"
                    className="absolute inset-0 bg-[#2E6B4E] rounded-lg shadow-2xs z-0"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">Field App · Mobile View</span>
                {perspective === 'field_app' && <Check size={12} strokeWidth={2.5} className="relative z-10" />}
              </button>
            </div>
          </div>

          {/* Footer: User Profile with Theme Toggle Button */}
          <div className="p-3.5 pb-4 border-t border-[#E2DDD2] flex items-center justify-between bg-[#EFECE4] flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                perspective === 'funder' ? 'bg-[#0B4A7D]/15 text-[#0B4A7D]' : 'bg-[#2E6B4E]/15 text-[#2E6B4E]'
              }`}>
                {perspective === 'funder' ? 'SB' : perspective === 'ngo_erp' ? 'RG' : 'MK'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate text-[#1C1917]">
                  {perspective === 'funder' ? 'Suman Bajaj' : perspective === 'ngo_erp' ? 'Rajesh Gaikwad' : 'Mithun K.'}
                </div>
                <div className="text-[10px] text-[#8C8479] truncate">
                  {perspective === 'funder' ? 'Head of CSR (Bajaj)' : perspective === 'ngo_erp' ? 'Pratham Team Lead' : 'Field Officer (Pune)'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
              className="p-1.5 rounded-lg text-[#8C8479] hover:text-[#1C1917] hover:bg-[#E2DDD2] transition-colors flex-shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ──────────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ${sidebarOpen ? 'lg:pl-[240px]' : 'lg:pl-0'}`}>
          {/* Unified Persistent Top Bar across all 5 Pillars */}
          <header className="h-14 border-b border-[#E5DFD3] bg-[#F7F4ED]/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20 flex-shrink-0 gap-2">
            {/* Left: Mobile Toggle + Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1.5 rounded-lg border border-[#E5DFD3] text-[#8C8479] hover:text-[#1C1917] hover:bg-[#EFECE4] flex-shrink-0 cursor-pointer"
                  aria-label="Toggle navigation"
                >
                  <Menu size={16} strokeWidth={1.5} />
                </button>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs truncate">
                <span className="text-[#8C8479] font-medium hidden sm:inline">ImpactOS</span>
                <span className="text-[#D5CEC0] hidden sm:inline">/</span>
                {perspective === 'funder' && (
                  <>
                    <span className="font-semibold text-[#1C1917] truncate">
                      {activePillarObj?.label}
                    </span>
                    {subLabel && (
                      <>
                        <span className="text-[#D5CEC0] hidden md:inline">/</span>
                        <span className="text-[#6B655C] font-medium hidden md:inline truncate">{subLabel}</span>
                      </>
                    )}
                  </>
                )}
                {perspective === 'ngo_erp' && (
                  <>
                    <span className="font-semibold text-[#1C1917] truncate">Pratham</span>
                    <span className="text-[#D5CEC0] hidden sm:inline">/</span>
                    <span className="text-[#2E6B4E] font-medium hidden sm:inline truncate">NGO ERP</span>
                  </>
                )}
                {perspective === 'field_app' && (
                  <>
                    <span className="font-semibold text-[#1C1917] truncate">Field App</span>
                    <span className="text-[#D5CEC0] hidden sm:inline">/</span>
                    <span className="text-[#2E6B4E] font-medium hidden sm:inline truncate">Frontline Node</span>
                  </>
                )}
              </div>
            </div>

            {/* Center: 1-Tap Perspective Switcher on Mobile (< lg) */}
            <div className="lg:hidden flex items-center bg-[#FCFBF8] border border-[#E5DFD3] rounded-lg p-0.5 text-[10px] font-semibold flex-shrink-0">
              <button
                type="button"
                onClick={() => setPerspective('funder')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  perspective === 'funder' ? 'bg-[#0B4A7D] text-white shadow-2xs' : 'text-[#646058] hover:text-[#181D24]'
                }`}
              >
                Funder
              </button>
              <button
                type="button"
                onClick={() => setPerspective('ngo_erp')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  perspective === 'ngo_erp' ? 'bg-[#2E6B4E] text-white shadow-2xs' : 'text-[#646058] hover:text-[#181D24]'
                }`}
              >
                ERP
              </button>
              <button
                type="button"
                onClick={() => setPerspective('field_app')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  perspective === 'field_app' ? 'bg-[#2E6B4E] text-white shadow-2xs' : 'text-[#646058] hover:text-[#181D24]'
                }`}
              >
                Field
              </button>
            </div>

            {/* Right: Persona-Aware Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              {perspective === 'funder' && (
                <>
                  {/* Year Selector */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5DFD3] bg-[#FCFBF8] text-xs font-medium text-[#1C1917] shadow-2xs">
                    <span>FY 2024–25</span>
                    <ChevronDown size={12} className="text-[#8C8479]" />
                  </div>

                  {/* Search ⌘K Pill on desktop / Icon on mobile */}
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-1.5 sm:px-3 sm:py-1 rounded-lg border border-[#E5DFD3] bg-[#FCFBF8] text-xs text-[#8C8479] hover:border-[#D5CEC0] hover:text-[#1C1917] transition-all shadow-2xs cursor-pointer flex items-center gap-2"
                    aria-label="Search indicators"
                  >
                    <Search size={13} strokeWidth={1.5} />
                    <span className="text-[11px] hidden sm:inline">Search indicators...</span>
                    <kbd className="text-[10px] font-sans px-1 py-0.2 rounded border border-[#E5DFD3] bg-[#F7F4ED] text-[#8C8479] hidden sm:inline">⌘K</kbd>
                  </button>

                  {/* Board Pack */}
                  <button
                    onClick={handleExport}
                    className="text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-lg border border-[#E5DFD3] bg-[#FCFBF8] text-[#1C1917] hover:border-[#0B4A7D] hover:text-[#0B4A7D] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileDown size={13} strokeWidth={1.5} className="text-[#B42318]" />
                    <span className="hidden md:inline">Board Pack</span>
                  </button>

                  {/* + New Programme Button */}
                  <button
                    onClick={() => addToast('New Programme RFP', 'Tender creation workflow initiated.')}
                    className="text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-lg bg-[#0B4A7D] text-white hover:bg-[#083A63] transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Plus size={13} strokeWidth={2} />
                    <span className="hidden md:inline">New Programme</span>
                  </button>
                </>
              )}

              {perspective === 'ngo_erp' && (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5DFD3] bg-[#FCFBF8] text-xs font-medium text-[#1C1917] shadow-2xs">
                    <span>FY 2024–25</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#2E6B4E] bg-[#E8F3EC] border border-[#2E6B4E]/20 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle2 size={12} /> <span className="hidden sm:inline">Synced to </span>Bajaj
                  </span>
                </div>
              )}

              {perspective === 'field_app' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#2E6B4E] bg-[#E8F3EC] border border-[#2E6B4E]/20 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E6B4E] animate-pulse" />
                    <span className="hidden sm:inline">Offline Cache Ready · </span>Synced
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Sonner-Style Action Toasts */}
          <SonnerToast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

          {/* Page Content Body */}
          <main className={activePillar === 'pulse' && perspective === 'funder' ? 'w-full flex-1 p-0 overflow-y-auto lg:overflow-hidden relative' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 flex-1'}>
            {/* ── PERSISTENT PROGRAMME CONTEXT BAR ACROSS ALL 4 OUTCOME TABS ── */}
            {activePillar === 'programmes' && perspective === 'funder' && (
              <ProgrammesContextBar
                selectedProgram={programFilter}
                onProgramChange={setProgramFilter}
                selectedState={stateFilter}
                onStateChange={setStateFilter}
                selectedNgo={ngoFilter}
                onNgoChange={setNgoFilter}
                selectedCohort={cohortFilter}
                onCohortChange={setCohortFilter}
                activeScreen={activeId}
                onSelectScreen={setActiveId}
              />
            )}

            {/* Internal Sub-Tabs for Operations & Audits Hub with Gliding Indicator */}
            {activePillar === 'operations' && perspective === 'funder' && (
              <div className="flex items-center gap-1.5 border-b border-[#E5DFD3] pb-3 mb-6 overflow-x-auto relative">
                {OPERATIONS_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveId(tab.id)}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-transform duration-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none ${
                      activeId === tab.id
                        ? 'text-white'
                        : 'text-[#646058] hover:text-[#181D24] hover:bg-[#EFECE4]'
                    }`}
                  >
                    {activeId === tab.id && (
                      <motion.div
                        layoutId="operations-active-pill"
                        className="absolute inset-0 bg-[#0B4A7D] rounded-lg shadow-2xs z-0"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}

            <Suspense fallback={<LoadingFallback />}>
              {renderPage()}
            </Suspense>
          </main>
        </div>

        {/* ── ⌘K COMMAND PALETTE MODAL ────────────────────────────────────── */}
        {searchOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <div
              className="w-full max-w-lg bg-[#FCFBF8] border border-[#D5CEC0] rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5DFD3] bg-[#EFECE4]">
                <Search size={16} className="text-[#0B4A7D]" />
                <input
                  type="text"
                  placeholder="Type indicator name, programme, or view..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none outline-none text-xs text-[#1C1917] placeholder-[#8C8479]"
                />
                <kbd className="text-[10px] font-sans px-1.5 py-0.5 rounded border border-[#E5DFD3] bg-[#FCFBF8] text-[#8C8479]">ESC</kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredSearchItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8C8479]">
                    No matching views or indicators found.
                  </div>
                ) : (
                  filteredSearchItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveId(item.id);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-[#F7F4ED] transition-colors text-left group cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-[#1C1917] group-hover:text-[#0B4A7D]">{item.label}</div>
                        <div className="text-[10px] text-[#8C8479]">{item.pillar}</div>
                      </div>
                      <span className="text-[11px] text-[#8C8479] group-hover:text-[#0B4A7D]">Jump →</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ImpactStoreProvider>
  );
}

export default App;
