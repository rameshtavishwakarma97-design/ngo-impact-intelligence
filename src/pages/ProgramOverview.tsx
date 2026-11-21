import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowRight,
  FileDown,
  Plus,
  ChevronDown,
  X,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ScreenId } from '../App';
import { useImpactStore } from '../data/impactStore';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { SonnerToast, type ToastItem } from '../components/SonnerToast';

interface ProgramOverviewProps {
  onNavigate?: (screen: ScreenId, programFilter?: 'micro-skilling' | 'literacy') => void;
}

interface ActiveProgramRecord {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  allocatedCr: number;
  disbursedCr: number;
  womenReached: number;
  flagshipOutcome: string;
  partnersCount: number;
  hasFlaggedPartner?: boolean;
  programFilter: 'micro-skilling' | 'literacy';
}

const fmtNum = (n: number) => n.toLocaleString('en-IN');

export const ProgramOverview: React.FC<ProgramOverviewProps> = ({ onNavigate }) => {
  const { portfolio, microSkilling, literacy, decisions, approveTranche, holdTranche, fieldErpPulse } = useImpactStore();

  // ─── Live Dynamic State (Interactive Decisions & Actions) ───
  const [activeTab, setActiveTab] = useState<'capital' | 'women' | 'sync'>('capital');
  const [corpusReallocated, setCorpusReallocated] = useState<boolean>(false);
  const [customProgrammes, setCustomProgrammes] = useState<ActiveProgramRecord[]>([]);

  // Velocity Chart Data (Quarterly Cumulative)
  const velocityData = useMemo(() => [
    { quarter: 'Q1', actual: 8.5, target: 10.5, women: 9200, syncPct: 98 },
    { quarter: 'Q2', actual: 18.2, target: 21.0, women: 21400, syncPct: 92 },
    { quarter: 'Q3', actual: 29.6, target: 31.5, women: 32800, syncPct: 88 },
    { quarter: 'Q4', actual: portfolio.disbursedCr, target: 42.0, women: 42850, syncPct: 84 },
  ], [portfolio.disbursedCr]);

  const prathamApproved = decisions.find(d => d.id === 'dec-pratham' || d.ngoId === 'pratham')?.status === 'approved';
  const magicBusHeld = decisions.find(d => d.id === 'dec-magic-bus' || d.ngoId === 'magic-bus')?.status === 'held';

  const programmes = useMemo<ActiveProgramRecord[]>(() => {
    const base: ActiveProgramRecord[] = [
      {
        id: 'prog-micro-skilling',
        name: 'Micro-Skilling: Women Entrepreneurs',
        category: 'Livelihood',
        categoryColor: '#2E6B4E',
        allocatedCr: microSkilling.committedCr,
        disbursedCr: microSkilling.disbursedCr,
        womenReached: microSkilling.enrolled,
        flagshipOutcome: '+₹1,500/mo · 78% 6-mo survival',
        partnersCount: microSkilling.activePartnersCount,
        hasFlaggedPartner: microSkilling.flaggedPartnersCount > 0,
        programFilter: 'micro-skilling',
      },
      {
        id: 'prog-literacy',
        name: "Foundational Women's Literacy",
        category: 'Education',
        categoryColor: '#B5532A',
        allocatedCr: literacy.committedCr,
        disbursedCr: literacy.disbursedCr,
        womenReached: literacy.enrolled,
        flagshipOutcome: '82% FLN Level 3 · 74% UPI fluent',
        partnersCount: literacy.activePartnersCount,
        hasFlaggedPartner: literacy.flaggedPartnersCount > 0,
        programFilter: 'literacy',
      },
    ];
    return [...base, ...customProgrammes];
  }, [microSkilling, literacy, customProgrammes]);

  // Interactive Drawers & Popovers
  const [activeDrawer, setActiveDrawer] = useState<'pratham' | 'magic-bus' | 'corpus' | null>(null);
  const [boardPackOpen, setBoardPackOpen] = useState<boolean>(false);
  const [newProgramModalOpen, setNewProgramModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [approvingPratham, setApprovingPratham] = useState<boolean>(false);

  // New Programme Form State
  const [newProgName, setNewProgName] = useState('');
  const [newProgCategory, setNewProgCategory] = useState('Livelihood');
  const [newProgAllocated, setNewProgAllocated] = useState('5.0');
  const [newProgTargetWomen, setNewProgTargetWomen] = useState('6,000');
  const [newProgPartners, setNewProgPartners] = useState('3');

  const boardPackRef = useRef<HTMLDivElement>(null);
  const inboxRef = useRef<HTMLDivElement>(null);

  // Global ESC key listener to dismiss drawers & modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDrawer(null);
        setBoardPackOpen(false);
        setNewProgramModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close board pack
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boardPackRef.current && !boardPackRef.current.contains(e.target as Node)) {
        setBoardPackOpen(false);
      }
    };
    if (boardPackOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [boardPackOpen]);

  // Sonner-style stacked toast
  const showToast = (title: string, desc?: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, title, desc }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Remaining pending sign-off count
  const pendingCount = (prathamApproved ? 0 : 1) + (magicBusHeld ? 0 : 1) + (corpusReallocated ? 0 : 1);

  // Dynamic Pending Summary for Headline and Stat 4
  const getPendingSummary = () => {
    const tranches = (prathamApproved ? 0 : 40) + (magicBusHeld ? 0 : 35);
    const hasReserve = !corpusReallocated;
    if (pendingCount === 0) return 'all items cleared';
    if (tranches > 0 && hasReserve) return `₹${tranches} L tranches · ₹3.6 Cr reserve`;
    if (tranches > 0) return `₹${tranches} L tranches`;
    return '₹3.6 Cr reserve';
  };

  // Handler: Approve Pratham Tranche with Stateful Morph
  const handleConfirmPratham = () => {
    setApprovingPratham(true);
    setTimeout(() => {
      approveTranche('dec-pratham');
      setApprovingPratham(false);
      setActiveDrawer(null);
      showToast(
        '₹40 L Tranche Released',
        'Pratham Foundation (Pune) milestone M6 cleared. Treasury transfer token sent.'
      );
    }, 320);
  };

  // Handler: Hold Magic Bus
  const handleConfirmMagicBus = () => {
    holdTranche('dec-magic-bus');
    setActiveDrawer(null);
    showToast(
      'Formal Audit Hold Placed',
      'Magic Bus (Thane) Q4 disbursement locked pending physical re-survey verification.'
    );
  };

  // Handler: Reallocate Corpus
  const handleConfirmCorpus = () => {
    setCorpusReallocated(true);
    setActiveDrawer(null);
    showToast(
      '₹3.6 Cr Reallocated',
      'Unspent funds scheduled for SEWA Bharat & Goonj Tier-2 FPO expansion before Mar 31.'
    );
  };

  // Handler: Add New Programme
  const handleCreateProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName.trim()) return;

    const allocated = parseFloat(newProgAllocated) || 4.0;
    const newRecord: ActiveProgramRecord = {
      id: `prog-${Date.now()}`,
      name: newProgName.trim(),
      category: newProgCategory,
      categoryColor: newProgCategory === 'Livelihood' ? '#2E6B4E' : '#B5532A',
      allocatedCr: allocated,
      disbursedCr: 0.5,
      womenReached: parseInt(newProgTargetWomen.replace(/,/g, '')) || 5000,
      flagshipOutcome: 'Baseline intake active (M0)',
      partnersCount: parseInt(newProgPartners) || 2,
      hasFlaggedPartner: false,
      programFilter: 'micro-skilling',
    };

    setCustomProgrammes(prev => [...prev, newRecord]);
    setNewProgramModalOpen(false);
    setNewProgName('');
    showToast(
      'New CSR Programme Initialized',
      `${newRecord.name} added with ₹${newRecord.allocatedCr} Cr budget commitment.`
    );
  };

  return (
    <div className="space-y-12 pb-20">
      {/* ── BAND 1: EDITORIAL BRIEFING & UNIVERSAL 4-STAT STRIP ── */}
      <section className="space-y-8 pt-2">
        {/* Header Row: Narrative Title + Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <h1 className="font-narrative text-[24px] sm:text-[26px] lg:text-[28px] font-normal tracking-tight text-[#1C1917] leading-snug">
              91.4% of Bajaj's ₹42 Cr corpus is deployed across {portfolio.partnersCount} NGOs — {portfolio.onTargetCount} partners are on target, while {pendingCount > 0 ? `${pendingCount} decisions (${getPendingSummary()})` : 'all decisions are cleared'} need your review.
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#6B655C]">
              Bajaj Finserv Foundation · FY 2024–25 · 2 Active Programmes · {portfolio.statesCount} States · {portfolio.partnersCount} NGO Partners
            </p>
          </div>

          {/* Action CTAs: + New Programme & Board Pack Popover */}
          <div className="flex items-center gap-2.5 flex-shrink-0 relative">
            <button
              type="button"
              onClick={() => setNewProgramModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>New Programme</span>
            </button>

            {/* Board Pack Dropdown Button */}
            <div className="relative" ref={boardPackRef}>
              <button
                type="button"
                onClick={() => setBoardPackOpen(!boardPackOpen)}
                className="px-3.5 py-2 rounded-lg border border-[#E5DFD3] bg-[#FCFBF8] text-[#1C1917] text-xs font-semibold hover:border-[#0B4A7D] hover:text-[#0B4A7D] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none"
              >
                <FileDown size={14} strokeWidth={1.75} className="text-[#8C8479]" />
                <span>Board Pack</span>
                <ChevronDown size={12} className="text-[#8C8479]" />
              </button>

              {/* Board Pack Popover */}
              {boardPackOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#FCFBF8] border border-[#D5CEC0] rounded-xl shadow-xl p-2 z-40 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider border-b border-[#E5DFD3]">
                    Statutory &amp; Board Briefs
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBoardPackOpen(false);
                      showToast('Quarterly Board Deck Generated', 'Executive summary PDF compiled with 5-Act partner breakdown.');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F7F4ED] flex items-center gap-2 text-[#1C1917] cursor-pointer"
                  >
                    <FileText size={14} className="text-[#0B4A7D]" />
                    <div>
                      <div className="font-semibold">Quarterly Board Deck</div>
                      <div className="text-[10px] text-[#6B655C]">FY25 Q4 Funder Summary</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBoardPackOpen(false);
                      showToast('Statutory CSR-2 Annexure Exported', 'Ministry of Corporate Affairs compliant reporting table.');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F7F4ED] flex items-center gap-2 text-[#1C1917] cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-[#0B4A7D]" />
                    <div>
                      <div className="font-semibold">Statutory CSR-2 Summary</div>
                      <div className="text-[10px] text-[#6B655C]">MCA Schedule VII Format</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBoardPackOpen(false);
                      showToast('Independent Audit Summary Exported', 'Third-party KPMG spot verification ledger.');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F7F4ED] flex items-center gap-2 text-[#1C1917] cursor-pointer"
                  >
                    <ShieldCheck size={14} className="text-[#0B4A7D]" />
                    <div>
                      <div className="font-semibold">Audit Integrity Summary</div>
                      <div className="text-[10px] text-[#6B655C]">GPS &amp; IVR Spot Ledger</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Universal Borderless Metrics (No Boxes, Thin Hairline Dividers) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 py-5 border-y border-[#E5DFD3]">
          {/* Stat 1: Corpus Deployed */}
          <div className="pr-4 sm:pr-6 py-2">
            <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
              CORPUS DEPLOYED
            </span>
            <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight flex items-baseline">
              <AnimatedNumber value={portfolio.disbursedCr} decimals={1} prefix="₹" suffix=" Cr" />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B655C]">
              <span>of ₹{portfolio.committedCr.toFixed(1)} Cr</span>
              <span className="text-[#8C8479]">·</span>
              <span className="font-medium text-[#0B4A7D]">
                {portfolio.disbursedPct}% on pace
              </span>
            </div>
            {/* Sleek 3px Bajaj Blue Progress Bar */}
            <div className="mt-2.5 h-[3px] w-full max-w-[180px] bg-[#E5DFD3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0B4A7D] rounded-full transition-all duration-500"
                style={{ width: `${portfolio.disbursedPct}%` }}
              />
            </div>
          </div>

          {/* Stat 2: Women Tracked */}
          <div className="pl-4 sm:px-6 py-2 border-l border-[#E5DFD3]">
            <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
              WOMEN TRACKED
            </span>
            <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
              <AnimatedNumber value={portfolio.totalEnrolled} />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B655C]">
              <span className="font-medium text-[#2E6B4E] flex items-center gap-0.5">
                <ArrowUpRight size={12} strokeWidth={2.5} />
                {portfolio.totalVerified.toLocaleString('en-IN')} verified
              </span>
              <span className="text-[#8C8479]">·</span>
              <span>Across {portfolio.statesCount} States</span>
            </div>
          </div>

          {/* Stat 3: Partners on Target */}
          <div className="pr-4 sm:px-6 py-2 border-t lg:border-t-0 lg:border-l border-[#E5DFD3]">
            <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
              PARTNERS ON TARGET
            </span>
            <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
              {portfolio.onTargetCount} / {portfolio.partnersCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B655C]">
              <span className="text-[#2E6B4E] font-medium">{portfolio.onTargetCount} verified</span>
              <span className="text-[#8C8479]">·</span>
              <span className="text-[#B42318] font-medium">{portfolio.flaggedCount} audit flagged</span>
            </div>
          </div>

          {/* Stat 4: Pending Sign-Offs (Clickable anchor to inbox) */}
          <div
            onClick={() => inboxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="pl-4 sm:px-6 py-2 border-t lg:border-t-0 border-l border-[#E5DFD3] cursor-pointer group"
          >
            <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block group-hover:text-[#0B4A7D] transition-colors">
              PENDING SIGN-OFFS
            </span>
            <div className={`font-sans tabular-nums font-semibold text-2xl sm:text-3xl mt-1 tracking-tight group-hover:underline ${pendingCount > 0 ? 'text-[#A86414]' : 'text-[#2E6B4E]'}`}>
              {pendingCount} items
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#6B655C]">
              <span>{getPendingSummary()}</span>
              {pendingCount > 0 && (
                <ArrowRight size={11} className="text-[#A86414] group-hover:translate-x-0.5 transition-transform" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BAND 2: CENTERPIECE SPLIT (65% VELOCITY CHART / 35% DECISIONS INBOX) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (65%): Fiscal Capital & Impact Velocity Chart */}
        <div className="lg:col-span-8 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD3] pb-4">
            <div>
              <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
                Budget &amp; Delivery Pace
              </h2>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Cumulative quarterly deployment vs statutory target pacing across FY 2024–25.
              </p>
            </div>

            {/* 3-Tab Switcher with Shared-Element Gliding Pill */}
            <div className="inline-flex rounded-lg bg-[#F7F4ED] p-0.5 border border-[#E5DFD3] text-xs self-start sm:self-auto relative">
              {([
                { id: 'capital', label: 'Capital Pace' },
                { id: 'women', label: 'Reach' },
                { id: 'sync', label: 'Survey Sync' },
              ] as const).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3 py-1 rounded-md cursor-pointer font-medium whitespace-nowrap transition-transform duration-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none ${
                      isActive ? 'text-white font-semibold' : 'text-[#6B655C] hover:text-[#1C1917]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="budget-pace-tab"
                        className="absolute inset-0 bg-[#0B4A7D] rounded-md shadow-2xs z-0"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SVG Recharts Velocity Canvas */}
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={velocityData} margin={{ top: 15, right: 15, left: -5, bottom: 15 }}>
                <defs>
                  <linearGradient id="velocityBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B4A7D" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0B4A7D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD3" />
                <XAxis
                  dataKey="quarter"
                  tick={{ fontSize: 11, fill: '#8C8479' }}
                  axisLine={{ stroke: '#E5DFD3' }}
                />
                <YAxis
                  domain={
                    activeTab === 'capital' ? [0, 45] : activeTab === 'women' ? [0, 50000] : [70, 100]
                  }
                  tick={{ fontSize: 11, fill: '#8C8479' }}
                  axisLine={{ stroke: '#E5DFD3' }}
                  tickFormatter={val =>
                    activeTab === 'capital' ? `₹${val} Cr` : activeTab === 'women' ? `${val / 1000}k` : `${val}%`
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-[#FCFBF8] border border-[#D5CEC0] p-3 rounded-xl shadow-xl text-xs space-y-1.5 tabular-nums">
                        <p className="font-bold text-[#1C1917] border-b border-[#E5DFD3] pb-1">
                          Fiscal Wave: {label}
                        </p>
                        {payload.map((e: any, idx: number) => (
                          <div key={idx} className="flex justify-between gap-4">
                            <span style={{ color: e.color }}>{e.name}:</span>
                            <span className="font-bold text-[#1C1917]">
                              {activeTab === 'capital' ? `₹${e.value} Cr` : activeTab === 'women' ? fmtNum(e.value) : `${e.value}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />

                {/* Target Benchmark Curve (Muted Dashed Line) */}
                {activeTab === 'capital' && (
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Statutory Target Pace"
                    stroke="#8C8479"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}

                {/* Actual Realized Disbursal Curve */}
                <Area
                  type="monotone"
                  dataKey={activeTab === 'capital' ? 'actual' : activeTab === 'women' ? 'women' : 'syncPct'}
                  name={activeTab === 'capital' ? 'Actual Disbursed' : activeTab === 'women' ? 'Women Enrolled' : 'Forms Verified'}
                  stroke="#0B4A7D"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#velocityBlue)"
                  dot={{ r: 4, fill: '#0B4A7D', stroke: '#FCFBF8', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Inline Endpoint Callouts (Zero Axis Clipping) */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#8C8479] pt-3 border-t border-[#E5DFD3]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#0B4A7D] font-semibold">
                <span className="w-2.5 h-0.5 bg-[#0B4A7D]" />
                ₹{portfolio.disbursedCr.toFixed(1)} Cr Actual Disbursed
              </span>
              <span className="flex items-center gap-1.5 text-[#8C8479]">
                <span className="w-2.5 h-0.5 border-t border-dashed border-[#8C8479]" />
                ₹42.0 Cr Statutory Budget Goal
              </span>
            </div>
            <span className="text-[11px]">Next board compliance gate: March 31</span>
          </div>
        </div>

        {/* Right (35%): Decisions Requiring Action (Interactive Inbox) */}
        <div
          ref={inboxRef}
          className="lg:col-span-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 flex flex-col justify-between shadow-xs"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                  Decisions Requiring Action
                </h3>
                <p className="text-xs text-[#6B655C]">Executive sign-offs awaiting Suman Bajaj</p>
              </div>
              <span className="text-[10px] font-semibold text-[#A86414] bg-[#FDF4E3] border border-[#A86414]/20 px-2 py-0.5 rounded-full">
                {pendingCount} Pending
              </span>
            </div>

            {/* 3 Concrete Action Rows (Open Divider Layout, Zero Box Nesting) */}
            <div className="divide-y divide-[#E5DFD3]">
              {/* Decision 1: Pratham Tranche Release */}
              <div className="py-3 first:pt-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#2E6B4E] tracking-wider block">
                      Tranche Release Ready
                    </span>
                    <h4 className="font-sans text-xs font-semibold text-[#1C1917]">
                      Pratham Foundation (Pune)
                    </h4>
                    <p className="text-[11px] text-[#6B655C] leading-relaxed">
                      96/100 audit score · 99.4% GPS match; +₹1,600/mo verified income lift.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-sans tabular-nums text-xs font-semibold text-[#1C1917]">
                    ₹40 L Tranche 2
                  </span>
                  {prathamApproved ? (
                    <span className="text-xs font-semibold text-[#2E6B4E] flex items-center gap-1">
                      <Check size={14} /> Approved ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveDrawer('pratham')}
                      className="px-2.5 py-1 rounded-md bg-[#0B4A7D] text-white text-[11px] font-semibold hover:bg-[#083A63] transition-all shadow-2xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none"
                    >
                      Approve ₹40 L
                    </button>
                  )}
                </div>
              </div>

              {/* Decision 2: Magic Bus Audit Hold */}
              <div className="py-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#B42318] tracking-wider block">
                      Audit Hold Recommended
                    </span>
                    <h4 className="font-sans text-xs font-semibold text-[#1C1917]">
                      Magic Bus (Thane Cluster)
                    </h4>
                    <p className="text-[11px] text-[#6B655C] leading-relaxed">
                      Audit flagged 74/100 · 8.2% drop-out in tailoring hubs; GPS coordinates cluster mismatch.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-sans tabular-nums text-xs font-semibold text-[#B42318]">
                    ₹35 L at Risk
                  </span>
                  {magicBusHeld ? (
                    <span className="text-xs font-semibold text-[#B42318] flex items-center gap-1">
                      <ShieldCheck size={14} /> On Hold ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveDrawer('magic-bus')}
                      className="px-2.5 py-1 rounded-md border border-[#B42318] bg-[#FCECEB] text-[#B42318] text-[11px] font-semibold hover:bg-[#B42318] hover:text-white transition-all shadow-2xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#B42318]/25 focus-visible:outline-none"
                    >
                      Review &amp; Hold
                    </button>
                  )}
                </div>
              </div>

              {/* Decision 3: Unspent Corpus Reallocation */}
              <div className="py-3 last:pb-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#A86414] tracking-wider block">
                      Unspent Corpus Alert
                    </span>
                    <h4 className="font-sans text-xs font-semibold text-[#1C1917]">
                      FY25 Statutory Reserve
                    </h4>
                    <p className="text-[11px] text-[#6B655C] leading-relaxed">
                      ₹3.6 Cr unallocated balance must be contractually committed before Mar 31 statutory close.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-sans tabular-nums text-xs font-semibold text-[#1C1917]">
                    ₹3.6 Cr Uncommitted
                  </span>
                  {corpusReallocated ? (
                    <span className="text-xs font-semibold text-[#2E6B4E] flex items-center gap-1">
                      <Check size={14} /> Reallocated ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveDrawer('corpus')}
                      className="px-2.5 py-1 rounded-md border border-[#E5DFD3] bg-[#FCFBF8] text-[#1C1917] text-[11px] font-semibold hover:border-[#0B4A7D] hover:text-[#0B4A7D] transition-all shadow-2xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none"
                    >
                      Reallocate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5DFD3] text-[11px] text-[#8C8479]">
            Actions update statutory audit trails immediately.
          </div>
        </div>
      </section>

      {/* ── BAND 3: ACTIVE PROGRAMMES OPERATIONAL LEDGER (SCALES 2 TO 10+ ROWS) ── */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
              Active CSR Programmes
            </h2>
            <p className="text-xs text-[#6B655C] mt-0.5">
              Live operational ledger across all approved thematic CSR projects.
            </p>
          </div>
          <span className="text-xs text-[#8C8479]">{programmes.length} Active Programmes</span>
        </div>

        {/* Operational Ledger Table (Strict Shared Column Alignment) */}
        <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] overflow-hidden shadow-xs">
          <div className="divide-y divide-[#E5DFD3]">
            {programmes.map((p: ActiveProgramRecord) => {
              const burnPct = Math.round((p.disbursedCr / p.allocatedCr) * 100);
              return (
                <div
                  key={p.id}
                  className="p-5 hover:bg-[#F7F4ED]/40 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  {/* Col 1: Name + Category + Flagship Achieved (md:col-span-4) */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: `${p.categoryColor}15`, color: p.categoryColor }}
                      >
                        {p.category}
                      </span>
                      <h3 className="font-sans text-sm font-semibold text-[#1C1917]">
                        {p.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[#6B655C]">
                      Achieved: <span className="text-[#1C1917] font-medium">{p.flagshipOutcome}</span>
                    </p>
                  </div>

                  {/* Col 2: Budget Deployed (md:col-span-3) */}
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[10px] uppercase font-medium text-[#8C8479] tracking-wider block">
                      BUDGET DEPLOYED
                    </span>
                    <div className="font-semibold text-xs text-[#1C1917] tabular-nums">
                      ₹{p.disbursedCr.toFixed(1)} / ₹{p.allocatedCr.toFixed(1)} Cr
                    </div>
                    <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0B4A7D] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(burnPct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#8C8479] tabular-nums">
                      <span>{burnPct}% deployed</span>
                      <span>₹{(p.allocatedCr - p.disbursedCr).toFixed(1)} Cr reserve</span>
                    </div>
                  </div>

                  {/* Col 3: Women Tracked (md:col-span-2) */}
                  <div className="md:col-span-2 space-y-0.5">
                    <span className="text-[10px] uppercase font-medium text-[#8C8479] tracking-wider block">
                      WOMEN TRACKED
                    </span>
                    <span className="text-sm font-semibold text-[#1C1917] tabular-nums block">
                      {fmtNum(p.womenReached)}
                    </span>
                    <span className="text-[10px] text-[#6B655C] block">active cohort</span>
                  </div>

                  {/* Col 4: Partners (md:col-span-2) */}
                  <div className="md:col-span-2 space-y-0.5">
                    <span className="text-[10px] uppercase font-medium text-[#8C8479] tracking-wider block">
                      PARTNERS
                    </span>
                    {p.hasFlaggedPartner ? (
                      <span className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                        <span>{p.partnersCount} NGOs</span>
                        <span className="text-[#B42318] text-[11px] font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B42318]" />
                          1 flagged
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                        <span>{p.partnersCount} NGOs</span>
                        <span className="text-[#2E6B4E] text-[11px] font-medium">all on track</span>
                      </span>
                    )}
                    <span className="text-[10px] text-[#6B655C] block">100% audited</span>
                  </div>

                  {/* Col 5: Actions (md:col-span-1) */}
                  <div className="md:col-span-1 flex md:flex-col lg:flex-row items-center justify-end gap-2 pt-2 md:pt-0">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('ngo', p.programFilter)}
                      className="px-2.5 py-1 rounded-lg border border-[#E5DFD3] text-xs font-semibold text-[#1C1917] hover:border-[#0B4A7D] hover:text-[#0B4A7D] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none"
                    >
                      Compare
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('income')}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#0B4A7D] hover:underline cursor-pointer"
                    >
                      <span>Open</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BAND 4: GROUND PULSE (50% REGIONAL FOOTPRINT / 50% LIVE NGO ERP FEED) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (50%): Regional Footprint */}
        <div className="lg:col-span-6 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
                Regional Footprint
              </h2>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Saturation &amp; beneficiary allocation across operating states.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('geographic')}
              className="text-xs font-semibold text-[#0B4A7D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Geographies</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Clean Open Divider Layout (Zero Nested Box Cards) */}
          <div className="divide-y divide-[#E5DFD3] pt-1">
            {/* Maharashtra */}
            <div className="py-3 first:pt-1 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-sm text-[#1C1917]">Maharashtra</span>
                  <span className="text-[#8C8479] ml-2 text-[11px]">Pratham, Magic Bus, Room to Read</span>
                </div>
                <div className="tabular-nums">
                  <span className="font-semibold text-[#1C1917]">20,750 women</span>
                  <span className="ml-2 font-semibold text-[#2E6B4E]">+28% lift</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                <div className="h-full bg-[#0B4A7D] rounded-full" style={{ width: '48.4%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#8C8479]">
                <span>Pune, Thane, Nashik industrial belts</span>
                <span>48.4% portfolio share</span>
              </div>
            </div>

            {/* Madhya Pradesh */}
            <div className="py-3 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-sm text-[#1C1917]">Madhya Pradesh</span>
                  <span className="text-[#8C8479] ml-2 text-[11px]">Goonj, Educate Girls</span>
                </div>
                <div className="tabular-nums">
                  <span className="font-semibold text-[#1C1917]">12,000 women</span>
                  <span className="ml-2 font-semibold text-[#2E6B4E]">+22% lift</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                <div className="h-full bg-[#0B4A7D] rounded-full" style={{ width: '28.0%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#8C8479]">
                <span>Chhindwara, Jabalpur rural tribal blocks</span>
                <span>28.0% portfolio share</span>
              </div>
            </div>

            {/* Tamil Nadu */}
            <div className="py-3 last:pb-1 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-sm text-[#1C1917]">Tamil Nadu</span>
                  <span className="text-[#8C8479] ml-2 text-[11px]">Smile Foundation</span>
                </div>
                <div className="tabular-nums">
                  <span className="font-semibold text-[#1C1917]">10,100 women</span>
                  <span className="ml-2 font-semibold text-[#2E6B4E]">+24% lift</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                <div className="h-full bg-[#0B4A7D] rounded-full" style={{ width: '23.6%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#8C8479]">
                <span>Chennai peri-urban coastal blocks</span>
                <span>23.6% portfolio share</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right (50%): Live Field Activity */}
        <div className="lg:col-span-6 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2E6B4E] animate-pulse" />
              <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                Live Field Activity
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-[#2E6B4E] bg-[#E8F3EC] border border-[#2E6B4E]/20 px-2 py-0.5 rounded">
              Pratham Pune Node Live
            </span>
          </div>

          <p className="text-xs text-[#6B655C]">
            Live telemetry stream from frontline offline-first Android apps and NGO Team Leader verification queues.
          </p>

          {/* Clean 4-Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 py-3 border-y border-[#E5DFD3]">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">
                Synced M6
              </span>
              <div className="text-xl font-semibold text-[#2E6B4E] tabular-nums">
                <AnimatedNumber value={fieldErpPulse.syncedSurveysCount} />
              </div>
              <p className="text-[10px] text-[#6B655C]">Verified for pack</p>
            </div>

            <div className="space-y-0.5 pl-3 border-l border-[#E5DFD3]">
              <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">
                Attendance
              </span>
              <div className="text-xl font-semibold text-[#1C1917] tabular-nums">
                {fieldErpPulse.weeklyAttendancePct}%
              </div>
              <p className="text-[10px] text-[#6B655C]">{fieldErpPulse.activeBatchesCount} cohorts</p>
            </div>

            <div className="space-y-0.5 pl-3 border-l border-[#E5DFD3]">
              <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">
                Pending QA
              </span>
              <div className="text-xl font-semibold text-[#A86414] tabular-nums">
                {fieldErpPulse.pendingQACount}
              </div>
              <p className="text-[10px] text-[#6B655C]">In QA queue</p>
            </div>

            <div className="space-y-0.5 pl-3 border-l border-[#E5DFD3]">
              <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">
                Geofence
              </span>
              <div className="text-xl font-semibold text-[#2E6B4E] tabular-nums">
                99.4%
              </div>
              <p className="text-[10px] text-[#6B655C]">GPS pass rate</p>
            </div>
          </div>

          {/* Recent Live Verified Field Events */}
          <div className="space-y-2 pt-1 pb-4 pr-1 max-h-56 overflow-y-auto">
            {fieldErpPulse.recentAuditEvents.slice(0, 3).map((evt) => (
              <div key={evt.id} className="p-2 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-start gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E6B4E] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C1917] truncate text-[11px]">{evt.title}</span>
                    <span className="text-[10px] text-[#8C8479] tabular-nums flex-shrink-0">{evt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#6B655C] truncate">{evt.detail}</p>
                  <span className="text-[10px] text-[#8C8479] block mt-0.5">By {evt.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE SLIDE-OVER ACTION DRAWERS (440px) IN ANIMATEPRESENCE ─── */}
      <AnimatePresence>
        {/* 1. Pratham Tranche Approval Drawer */}
        {activeDrawer === 'pratham' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveDrawer(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.26 }}
              className="relative z-10 w-full sm:max-w-md max-h-[88dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl flex flex-col justify-between"
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#0B4A7D] tracking-wider block">
                      Tranche 2 Disbursement
                    </span>
                    <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                      Pratham Foundation (Pune)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Verification Checklist */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>KPMG Spot Audit Verification</span>
                      <span className="text-[#2E6B4E]">96/100 score · 99.4% GPS match ✓</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C]">
                      All 12,450 beneficiary records matched against PMC/PCMC municipal ward coordinates.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>Reported Income Lift</span>
                      <span className="text-[#2E6B4E]">+₹1,600 / month</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C]">
                      Verified with digital UPI transaction receipts in 94% of sampled micro-enterprises.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>Grant Amount Requested</span>
                      <span className="font-bold text-[#1C1917]">₹40 L</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C]">
                      Will disburse directly to Pratham Foundation HDFC CSR Escrow Account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  disabled={approvingPratham}
                  onClick={handleConfirmPratham}
                  className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-transform duration-100 active:scale-[0.98] shadow-xs cursor-pointer flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25"
                >
                  {approvingPratham ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Releasing Tranche...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Confirm &amp; Disburse ₹40 L</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="w-full py-2 rounded-xl bg-[#F7F4ED] text-xs font-semibold text-[#6B655C] hover:text-[#1C1917] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.aside>
          </div>
        )}

        {/* 2. Magic Bus Review & Hold Drawer (Desktop: 420px · Mobile: Bottom Sheet) */}
        {activeDrawer === 'magic-bus' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveDrawer(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.26 }}
              className="relative z-10 w-full sm:max-w-md max-h-[88dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl flex flex-col justify-between"
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#B42318] tracking-wider block">
                      Audit Review &amp; Sanction
                    </span>
                    <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                      Magic Bus (Thane Cluster)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FCECEB] border border-[#B42318]/20 space-y-1">
                    <div className="flex justify-between font-semibold text-[#B42318]">
                      <span>Audit Score Deficit</span>
                      <span>74 / 100 Flagged</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C]">
                      Mumbra &amp; Bhiwandi training centers show 26% coordinate clustering variance.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>Drop-Out Anomaly</span>
                      <span className="text-[#B42318]">16.0% Drop-out</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C]">
                      Nearly double the portfolio average (8.0%). Beneficiaries cited missing sewing machines.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>Action: Hold Q4 Disbursement</span>
                      <span className="font-bold text-[#1C1917]">₹35 L Locked</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C]">
                      Freezes funds until Magic Bus submits an audited corrective action plan (CAP).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={handleConfirmMagicBus}
                  className="w-full py-2.5 rounded-xl bg-[#B42318] text-white text-xs font-semibold hover:bg-[#991B1B] transition-transform duration-100 active:scale-[0.98] shadow-xs cursor-pointer flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#B42318]/25"
                >
                  <ShieldCheck size={14} />
                  <span>Issue Formal Audit Hold (₹35 L)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="w-full py-2 rounded-xl bg-[#F7F4ED] text-xs font-semibold text-[#6B655C] hover:text-[#1C1917] transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.aside>
          </div>
        )}

        {/* 3. Corpus Reallocation Drawer (Desktop: 420px · Mobile: Bottom Sheet) */}
        {activeDrawer === 'corpus' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveDrawer(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.26 }}
              className="relative z-10 w-full sm:max-w-md max-h-[88dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl flex flex-col justify-between"
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A86414] tracking-wider block">
                      Statutory Compliance
                    </span>
                    <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                      Corpus Reallocation Plan
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-[#6B655C] leading-relaxed">
                    Indian Companies Act Section 135 requires unspent CSR funds to be transferred to designated funds unless committed to ongoing projects.
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-2">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>Recommended Allocation</span>
                      <span className="text-[#0B4A7D]">₹3.6 Cr</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-[#6B655C]">
                      <div className="flex justify-between">
                        <span>• SEWA Bharat (Jabalpur FPO expansion)</span>
                        <span className="font-semibold text-[#1C1917]">₹2.2 Cr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Goonj (Chhindwara processing units)</span>
                        <span className="font-semibold text-[#1C1917]">₹1.4 Cr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={handleConfirmCorpus}
                  className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-transform duration-100 active:scale-[0.98] shadow-xs cursor-pointer flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25"
                >
                  <Check size={14} />
                  <span>Commit &amp; Reallocate ₹3.6 Cr</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="w-full py-2 rounded-xl bg-[#F7F4ED] text-xs font-semibold text-[#6B655C] hover:text-[#1C1917] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.aside>
          </div>
        )}

        {/* ─── MODAL: + NEW PROGRAMME MODAL ─── */}
        {newProgramModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setNewProgramModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.22 }}
              className="relative z-10 w-full max-w-lg bg-[#FCFBF8] border border-[#D5CEC0] rounded-2xl shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <div>
                  <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                    Initialize New CSR Programme
                  </h3>
                  <p className="text-xs text-[#6B655C]">Add an approved CSR grant initiative to the funder portfolio.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewProgramModalOpen(false)}
                  className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateProgramme} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-[#1C1917] mb-1">Programme Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Rural Agri-Producer Collective FPOs"
                    value={newProgName}
                    onChange={e => setNewProgName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#F7F4ED] text-[#1C1917] focus:outline-none focus:border-[#0B4A7D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">Category</label>
                    <select
                      value={newProgCategory}
                      onChange={e => setNewProgCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#F7F4ED] text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer"
                    >
                      <option value="Livelihood">Livelihood</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Financial Inclusion">Financial Inclusion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">Allocated Budget (₹ Cr)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newProgAllocated}
                      onChange={e => setNewProgAllocated(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#F7F4ED] text-[#1C1917] focus:outline-none focus:border-[#0B4A7D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">Target Beneficiaries</label>
                    <input
                      type="text"
                      value={newProgTargetWomen}
                      onChange={e => setNewProgTargetWomen(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#F7F4ED] text-[#1C1917] focus:outline-none focus:border-[#0B4A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">Initial NGO Partners</label>
                    <input
                      type="number"
                      value={newProgPartners}
                      onChange={e => setNewProgPartners(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-[#F7F4ED] text-[#1C1917] focus:outline-none focus:border-[#0B4A7D]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewProgramModalOpen(false)}
                    className="px-3 py-2 rounded-lg text-[#6B655C] hover:text-[#1C1917] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#0B4A7D] text-white font-semibold hover:bg-[#083A63] transition-all shadow-xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25"
                  >
                    Initialize Programme
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sonner-Style Stacked Toasts */}
      <SonnerToast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};
