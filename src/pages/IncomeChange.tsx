import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Info,
  X,
  CheckCircle2,
  Calendar,
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

interface IncomeChangeProps {
  onNavigate?: (screen: ScreenId) => void;
  selectedProgram?: 'micro-skilling' | 'literacy';
}

// ─── MICRO-SKILLING DATA (STRICT 28,400 WOMEN TOTAL) ───────────────────────────
const TRAJECTORY_DATA_MICRO = [
  { wave: 'M0 (Intake)',   program: 5400, benchmark: 5400, delta: 0 },
  { wave: 'M2 (Check-in)', program: 5750, benchmark: 5500, delta: 250 },
  { wave: 'M3 (Midline)',  program: 6100, benchmark: 5610, delta: 490 },
  { wave: 'M4 (Check-in)', program: 6500, benchmark: 5710, delta: 790 },
  { wave: 'M6 (Endline)',  program: 6900, benchmark: 5820, delta: 1080 },
];

const OUTCOME_DISTRIBUTION_MICRO = [
  {
    key: 'declined',
    label: 'Declined (>10%)',
    pct: 8,
    count: 2099,
    color: '#B42318',
    interactive: true,
  },
  {
    key: 'no-change',
    label: 'No Change (±10%)',
    pct: 19,
    count: 4986,
    color: '#646058',
    interactive: true,
  },
  {
    key: 'moderate',
    label: 'Moderate Growth (10–30%)',
    pct: 38,
    count: 9972,
    color: '#2E6B4E',
    interactive: false,
  },
  {
    key: 'strong',
    label: 'Strong Growth (30–50%)',
    pct: 24,
    count: 6298,
    color: '#2E6B4E',
    interactive: false,
  },
  {
    key: 'very-strong',
    label: 'Very Strong Growth (>50%)',
    pct: 11,
    count: 2887,
    color: '#24553E',
    interactive: false,
  },
];

const TRADE_DUMBBELL_DATA = [
  {
    trade: 'Tailoring & Garments',
    count: 11360,
    pctTotal: 40,
    m0: 5800,
    m6: 7600,
    gain: 1800,
    liftPct: 31,
    tag: 'Scale Track',
    tagColor: '#2E6B4E',
    tagBg: '#E8F3EC',
  },
  {
    trade: 'Mobile & Electronics Repair',
    count: 3976,
    pctTotal: 14,
    m0: 5200,
    m6: 7400,
    gain: 2200,
    liftPct: 42,
    tag: 'High ROI Track',
    tagColor: '#0B4A7D',
    tagBg: '#E7F0F7',
  },
  {
    trade: 'Vegetable & Agri-Vending',
    count: 6816,
    pctTotal: 24,
    m0: 5400,
    m6: 6800,
    gain: 1400,
    liftPct: 26,
    tag: 'Stable Cashflow',
    tagColor: '#0B4A7D',
    tagBg: '#E7F0F7',
  },
  {
    trade: 'Daily Wage Labor Conversion',
    count: 4544,
    pctTotal: 16,
    m0: 4600,
    m6: 5600,
    gain: 1000,
    liftPct: 22,
    tag: 'Add Working Capital',
    tagColor: '#A86414',
    tagBg: '#FDF4E3',
  },
  {
    trade: 'Handicrafts & Artisans',
    count: 1704,
    pctTotal: 6,
    m0: 4900,
    m6: 6000,
    gain: 1100,
    liftPct: 22,
    tag: 'Market Linkage Needed',
    tagColor: '#B5532A',
    tagBg: '#FAEDE6',
  },
];

// ─── WOMEN'S LITERACY DATA (STRICT 14,450 WOMEN TOTAL) ─────────────────────────
const TRAJECTORY_DATA_LITERACY = [
  { wave: 'M0 (Intake)',   program: 18.2, benchmark: 18.2, delta: 0 },
  { wave: 'M2 (Check-in)', program: 36.5, benchmark: 24.0, delta: 12.5 },
  { wave: 'M3 (Midline)',  program: 58.4, benchmark: 31.0, delta: 27.4 },
  { wave: 'M4 (Check-in)', program: 71.0, benchmark: 36.0, delta: 35.0 },
  { wave: 'M6 (Endline)',  program: 82.4, benchmark: 40.6, delta: 41.8 },
];

const OUTCOME_DISTRIBUTION_LITERACY = [
  {
    key: 'declined',
    label: 'Pre-Emergent (<Grade 1)',
    pct: 5,
    count: 723,
    color: '#B42318',
    interactive: true,
  },
  {
    key: 'no-change',
    label: 'Emergent (Grade 1–2)',
    pct: 13,
    count: 1878,
    color: '#646058',
    interactive: true,
  },
  {
    key: 'moderate',
    label: 'Functional Fluency (Grade 3)',
    pct: 44,
    count: 6358,
    color: '#2E6B4E',
    interactive: false,
  },
  {
    key: 'strong',
    label: 'Advanced Fluency (>Grade 3)',
    pct: 26,
    count: 3757,
    color: '#0B4A7D',
    interactive: false,
  },
  {
    key: 'very-strong',
    label: 'Digital Reading & UPI Fluent',
    pct: 12,
    count: 1734,
    color: '#24553E',
    interactive: false,
  },
];

const LITERACY_DUMBBELL_DATA = [
  {
    trade: 'Letter & Basic Word Recognition',
    count: 14450,
    pctTotal: 100,
    m0: 24,
    m6: 94,
    gain: 70,
    liftPct: 291,
    tag: 'Core Foundation',
    tagColor: '#2E6B4E',
    tagBg: '#E8F3EC',
  },
  {
    trade: 'Sentence & Paragraph Reading',
    count: 12427,
    pctTotal: 86,
    m0: 18,
    m6: 82,
    gain: 64,
    liftPct: 355,
    tag: 'Grade 3 Benchmark',
    tagColor: '#0B4A7D',
    tagBg: '#E7F0F7',
  },
  {
    trade: 'Basic Daily Arithmetic & Addition',
    count: 11271,
    pctTotal: 78,
    m0: 14,
    m6: 76,
    gain: 62,
    liftPct: 442,
    tag: 'Commercial Utility',
    tagColor: '#0B4A7D',
    tagBg: '#E7F0F7',
  },
  {
    trade: 'Bank Passbook & Deposit Slips',
    count: 10260,
    pctTotal: 71,
    m0: 11,
    m6: 71,
    gain: 60,
    liftPct: 545,
    tag: 'Financial Independence',
    tagColor: '#B5532A',
    tagBg: '#FAEDE6',
  },
  {
    trade: 'Smartphone Digital Text & UPI',
    count: 9826,
    pctTotal: 68,
    m0: 8,
    m6: 68,
    gain: 60,
    liftPct: 750,
    tag: 'Digital Inclusion',
    tagColor: '#7C3AED',
    tagBg: '#F5F3FF',
  },
];

export const IncomeChange: React.FC<IncomeChangeProps> = ({ onNavigate, selectedProgram: propProgram }) => {
  // ─── Filter States ─────────────────────────────────────────────────────────
  const [internalProgram, setInternalProgram] = useState<'micro-skilling' | 'literacy'>('micro-skilling');
  const selectedProgram = propProgram || internalProgram;
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedNgo, setSelectedNgo] = useState('All NGOs');
  const [selectedCohort, setSelectedCohort] = useState('All Cohorts');

  // UI Interactive States
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [inspectionDrawerOpen, setInspectionDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Active tab within the 4 consolidated outcome tabs
  const [activeOutcomeTab, setActiveOutcomeTab] = useState<string>('primary');

  const verificationRef = useRef<HTMLDivElement>(null);

  // Close verification popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (verificationRef.current && !verificationRef.current.contains(e.target as Node)) {
        setVerificationModalOpen(false);
      }
    };
    if (verificationModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [verificationModalOpen]);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleScheduleFollowUp = () => {
    setInspectionDrawerOpen(false);
    showToast(
      'Field Remediation Task Scheduled',
      '2,099 underperforming beneficiaries flagged for rapid working-capital micro-grant survey by field supervisors.'
    );
  };

  const isMicro = selectedProgram === 'micro-skilling';
  const trajectoryData = isMicro ? TRAJECTORY_DATA_MICRO : TRAJECTORY_DATA_LITERACY;
  const outcomeDistribution = isMicro ? OUTCOME_DISTRIBUTION_MICRO : OUTCOME_DISTRIBUTION_LITERACY;
  const dumbbellData = isMicro ? TRADE_DUMBBELL_DATA : LITERACY_DUMBBELL_DATA;

  return (
    <div className="space-y-8 pb-16">
      {/* ─── TOAST NOTIFICATION ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#FCFBF8] border border-[#E5DFD3] px-5 py-3.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={18} className="text-[#2E6B4E] flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#1C1917]">{toastMessage.title}</p>
            <p className="text-[11px] text-[#6B655C]">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* ── CONTEXT HEADER (Only rendered if not supplied by parent App.tsx) ── */}
      {!propProgram && (
        <section className="bg-[#FCFBF8] border border-[#E5DFD3] rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Programme Selector Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-medium text-[#8C8479] tracking-wider hidden sm:inline">
                CSR Programme:
              </span>
              <div className="relative inline-block">
                <select
                  aria-label="Select CSR Programme"
                  value={selectedProgram}
                  onChange={(e) => {
                    setInternalProgram(e.target.value as 'micro-skilling' | 'literacy');
                    setActiveOutcomeTab('primary');
                  }}
                  className="appearance-none pl-3.5 pr-9 py-2 bg-[#F7F4ED] hover:bg-[#EFECE4] border border-[#E5DFD3] rounded-xl text-xs sm:text-sm font-semibold text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer transition-colors shadow-2xs"
                >
                  <option value="micro-skilling">
                    Micro-Skilling: Women Entrepreneurs (28,400 Women · 9 NGOs)
                  </option>
                  <option value="literacy">
                    Foundational Women's Literacy (14,450 Women · 5 NGOs)
                  </option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]"
                />
              </div>
            </div>

            {/* Right: Inline Filter Trio */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  aria-label="Filter by State"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 bg-[#FCFBF8] hover:bg-[#F7F4ED] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer shadow-2xs"
                >
                  <option value="All States">All States (Maharashtra &amp; MP)</option>
                  <option value="Maharashtra">Maharashtra (18 Districts)</option>
                  <option value="Madhya Pradesh">Madhya Pradesh (10 Districts)</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
              </div>

              <div className="relative">
                <select
                  aria-label="Filter by NGO Partner"
                  value={selectedNgo}
                  onChange={(e) => setSelectedNgo(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 bg-[#FCFBF8] hover:bg-[#F7F4ED] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer shadow-2xs"
                >
                  <option value="All NGOs">All NGO Partners ({isMicro ? '9' : '5'} NGOs)</option>
                  <option value="Pratham">Pratham Foundation</option>
                  <option value="Goonj">Goonj</option>
                  <option value="Magic Bus">Magic Bus</option>
                  <option value="SEWA Bharat">SEWA Bharat</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
              </div>

              <div className="relative">
                <select
                  aria-label="Filter by Cohort Wave"
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 bg-[#FCFBF8] hover:bg-[#F7F4ED] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer shadow-2xs"
                >
                  <option value="All Cohorts">All Cohorts (142 Batches)</option>
                  <option value="Cohort 1">Cohort 1 (M6 Endline Audited)</option>
                  <option value="Cohort 2">Cohort 2 (M3 Midline Active)</option>
                  <option value="Cohort 3">Cohort 3 (M0 Intake Baseline)</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[#E5DFD3] pt-3 overflow-x-auto">
            {isMicro ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveOutcomeTab('primary')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    activeOutcomeTab === 'primary'
                      ? 'bg-[#0B4A7D] text-white shadow-2xs'
                      : 'text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED]'
                  }`}
                >
                  Earnings &amp; Income
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('entrepreneurship')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED] whitespace-nowrap cursor-pointer transition-all"
                >
                  Enterprise &amp; Survival
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('digital')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED] whitespace-nowrap cursor-pointer transition-all"
                >
                  Financial &amp; Digital
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('prepost')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED] whitespace-nowrap cursor-pointer transition-all"
                >
                  Before vs. After
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveOutcomeTab('primary')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    activeOutcomeTab === 'primary'
                      ? 'bg-[#0B4A7D] text-white shadow-2xs'
                      : 'text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED]'
                  }`}
                >
                  Reading &amp; Numeracy
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('digital')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED] whitespace-nowrap cursor-pointer transition-all"
                >
                  Banking &amp; UPI Fluency
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('entrepreneurship')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED] whitespace-nowrap cursor-pointer transition-all"
                >
                  Autonomy &amp; Agency
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('prepost')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED] whitespace-nowrap cursor-pointer transition-all"
                >
                  Before vs. After
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── EDITORIAL BRIEFING TITLE (NEWSREADER SERIF) ────────────────────── */}
      <div className="space-y-1.5">
        <h1 className="font-narrative text-[24px] sm:text-[26px] lg:text-[28px] font-normal tracking-tight text-[#1C1917] leading-snug">
          {isMicro
            ? 'Micro-entrepreneurs raised median earnings from ₹5,400 to ₹6,900—73% achieved meaningful growth, while 8% need follow-up.'
            : 'Foundational literacy rose from 18% to 82%—76% of women now independently verify bank records and UPI transactions.'}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#6B655C]">
          {isMicro
            ? 'Bajaj Finserv Micro-Skilling Programme · FY25 Wave (M0 → M6 Longitudinal Evaluation) · 28,400 Surveyed Women'
            : "Bajaj Finserv Women's Literacy Programme · FY25 Wave (M0 → M6 FLN Evaluation) · 14,450 Surveyed Women"}
        </p>
      </div>

      {/* ── 4 BORDERLESS OPEN-CANVAS HERO STATS (ZERO BLACK CARDS) ─────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 py-5 border-y border-[#E5DFD3]">
        {/* Stat 1: Baseline */}
        <div className="pr-4 sm:pr-6 py-2">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'MEDIAN BASELINE (M0)' : 'BASELINE LITERACY (M0)'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '₹5,400' : '18.2%'}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {isMicro ? 'Intake survey verified monthly earnings' : 'FLN Grade 2+ reading proficiency'}
          </div>
        </div>

        {/* Stat 2: Endline */}
        <div className="pl-4 sm:px-6 py-2 border-l border-[#E5DFD3]">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'MEDIAN ENDLINE (M6)' : 'ENDLINE LITERACY (M6)'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '₹6,900' : '82.4%'}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B655C]">
            <span className="font-medium text-[#2E6B4E]">
              {isMicro ? '+28% gross lift (+₹1,500)' : '+64.2% absolute gain'}
            </span>
            <span className="text-[#8C8479]">·</span>
            <span>M6 audit</span>
          </div>
          {/* Sleek 3px Botanical Moss Bar */}
          <div className="mt-2 h-[3px] w-full max-w-[160px] bg-[#E5DFD3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2E6B4E] rounded-full"
              style={{ width: isMicro ? '78%' : '82%' }}
            />
          </div>
        </div>

        {/* Stat 3: Net Attributed Program Lift (with Verified ⓘ popover) */}
        <div className="pr-4 sm:px-6 py-2 border-t lg:border-t-0 lg:border-l border-[#E5DFD3] relative" ref={verificationRef}>
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
              {isMicro ? 'NET PROGRAMME LIFT' : 'NET LITERACY GAIN'}
            </span>
            <button
              type="button"
              onClick={() => setVerificationModalOpen(!verificationModalOpen)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#0B4A7D] bg-[#E7F0F7] hover:bg-[#D5E5F2] transition-colors cursor-pointer"
              title="Click to view econometric difference-in-differences proof"
            >
              <span>Verified</span>
              <Info size={11} strokeWidth={2} />
            </button>
          </div>

          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#2E6B4E] mt-1 tracking-tight">
            {isMicro ? '+₹1,080' : '+41.8%'}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {isMicro ? 'Above local non-program average (₹5,820)' : 'Above rural adult control baseline'}
          </div>

          {/* Statistical Proof Popover */}
          {verificationModalOpen && (
            <div className="absolute left-6 right-0 top-full mt-2 w-80 bg-[#FCFBF8] border border-[#D5CEC0] rounded-xl shadow-xl p-3.5 z-40 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                <span className="font-bold text-[#1C1917]">Econometric Impact Attribution</span>
                <span className="text-[10px] font-semibold text-[#0B4A7D] bg-[#E7F0F7] px-1.5 py-0.2 rounded">
                  p &lt; 0.001
                </span>
              </div>
              <p className="text-[11px] text-[#6B655C] leading-relaxed">
                {isMicro
                  ? 'Paired Wilcoxon Signed-Rank Test & Difference-in-Differences (DiD) model evaluated against a localized non-program control cohort (n = 4,200). Enrolled women grew by +₹1,500 vs +₹420 peer organic wage drift, proving +₹1,080 net foundation attribution.'
                  : 'Difference-in-Differences evaluation against District Primary Education rural benchmarks (n = 2,800). Enrolled women gained +64.2% reading literacy vs +22.4% control adult group, establishing +41.8% isolated net programme impact.'}
              </p>
              <div className="pt-1.5 border-t border-[#E5DFD3] flex justify-between text-[10px] text-[#8C8479]">
                <span>Method: Quasi-Experimental DiD</span>
                <span>Confidence: 99.9%</span>
              </div>
            </div>
          )}
        </div>

        {/* Stat 4: Growth Achievement Rate */}
        <div className="pl-4 sm:px-6 py-2 border-t lg:border-t-0 border-l border-[#E5DFD3]">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'GROWTH ACHIEVEMENT' : 'FUNCTIONAL INDEPENDENCE'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '73%' : '76%'}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {isMicro
              ? '19,157 of 26,242 verified women achieved ≥10% growth'
              : '10,982 independently read passbooks'}
          </div>
        </div>
      </section>

      {/* ── DUAL COLUMN: TRAJECTORY CHART (58%) & OUTCOME DISTRIBUTION (42%) ─ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (58% / col-span-7): Longitudinal Earnings / Literacy Curve */}
        <div className="lg:col-span-7 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="border-b border-[#E5DFD3] pb-4">
            <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
              {isMicro ? 'Median Monthly Earnings (M0 → M6)' : 'Reading & Numeracy Fluency Trajectory'}
            </h2>
            <p className="text-xs text-[#6B655C] mt-0.5">
              {isMicro
                ? 'Trajectory of enrolled women vs local non-program control benchmark across 6-month evaluation.'
                : 'FLN Level 3 mastery progression vs government non-participant rural peer baseline.'}
            </p>
          </div>

          {/* SVG Recharts Canvas with Ample Margin to Avoid Axis Clipping */}
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={trajectoryData}
                margin={{ top: 15, right: 35, left: 15, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="programLiftShade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B4A7D" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0B4A7D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD3" vertical={false} />
                <XAxis
                  dataKey="wave"
                  tick={{ fontSize: 11, fill: '#8C8479' }}
                  axisLine={{ stroke: '#E5DFD3' }}
                  tickLine={false}
                />
                <YAxis
                  domain={isMicro ? [4000, 8000] : [0, 100]}
                  ticks={isMicro ? [4000, 5000, 6000, 7000, 8000] : [0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: '#8C8479' }}
                  axisLine={{ stroke: '#E5DFD3' }}
                  tickLine={false}
                  tickFormatter={(v) => (isMicro ? `₹${v / 1000}k` : `${v}%`)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const progVal = payload.find((p) => p.dataKey === 'program')?.value;
                    const benchVal = payload.find((p) => p.dataKey === 'benchmark')?.value;
                    const netDiff =
                      typeof progVal === 'number' && typeof benchVal === 'number'
                        ? progVal - benchVal
                        : 0;
                    return (
                      <div className="bg-[#FCFBF8] border border-[#D5CEC0] p-3 rounded-xl shadow-xl text-xs space-y-1.5 tabular-nums">
                        <p className="font-bold text-[#1C1917] border-b border-[#E5DFD3] pb-1">
                          Wave: {label}
                        </p>
                        <div className="flex justify-between gap-4 text-[#0B4A7D] font-semibold">
                          <span>Enrolled Cohort:</span>
                          <span>{isMicro ? `₹${progVal?.toLocaleString()}` : `${progVal}%`}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-[#8C8479]">
                          <span>Control Benchmark:</span>
                          <span>{isMicro ? `₹${benchVal?.toLocaleString()}` : `${benchVal}%`}</span>
                        </div>
                        <div className="pt-1 border-t border-[#E5DFD3] flex justify-between gap-4 text-[#2E6B4E] font-bold">
                          <span>Net Attributed Lift:</span>
                          <span>{isMicro ? `+₹${netDiff.toLocaleString()}/mo` : `+${netDiff.toFixed(1)}%`}</span>
                        </div>
                      </div>
                    );
                  }}
                />

                {/* Shaded Area for Net Lift */}
                <Area
                  type="monotone"
                  dataKey="program"
                  name="Enrolled Trajectory"
                  fill="url(#programLiftShade)"
                  stroke="#0B4A7D"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0B4A7D', stroke: '#FCFBF8', strokeWidth: 2 }}
                />

                {/* Benchmark Dashed Curve */}
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="Local Control Peer Average"
                  stroke="#8C8479"
                  strokeWidth={1.75}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#8C8479', stroke: '#FCFBF8', strokeWidth: 1.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Direct Endpoint Callouts (No Collision) */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#8C8479] pt-3 border-t border-[#E5DFD3]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#0B4A7D] font-semibold">
                <span className="w-2.5 h-0.5 bg-[#0B4A7D]" />
                {isMicro ? '₹6,900 Endline (Enrolled)' : '82.4% Endline (Enrolled)'}
              </span>
              <span className="flex items-center gap-1.5 text-[#8C8479]">
                <span className="w-2.5 h-0.5 border-t border-dashed border-[#8C8479]" />
                {isMicro ? '₹5,820 Peer Average (Control)' : '40.6% Control Baseline'}
              </span>
            </div>
            <span className="font-semibold text-[#2E6B4E] text-[11px]">
              {isMicro ? '+₹1,080 Isolated Net Lift' : '+41.8% Net Attributed'}
            </span>
          </div>
        </div>

        {/* Right (42% / col-span-5): Outcome Distribution */}
        <div className="lg:col-span-5 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="border-b border-[#E5DFD3] pb-3">
              <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
                Who Grew &amp; Who Fell Behind
              </h2>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Share of {isMicro ? '28,400' : '14,450'} surveyed women by 6-month delta.
              </p>
            </div>

            {/* 5 Distribution Bars */}
            <div className="space-y-3.5 pt-4">
              {outcomeDistribution.map((item) => (
                <div
                  key={item.key}
                  onClick={() => {
                    if (item.interactive) setInspectionDrawerOpen(true);
                  }}
                  className={`group space-y-1.5 ${item.interactive ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-[#1C1917] flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.interactive && (
                        <span className="text-[10px] font-semibold text-[#B91C1C] group-hover:underline inline-flex items-center gap-0.5">
                          Inspect →
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-semibold text-[#1C1917]">{item.pct}%</span>
                      <span className="text-[11px] text-[#8C8479]">
                        ({item.count.toLocaleString()} women)
                      </span>
                    </div>
                  </div>

                  {/* Progress Fill */}
                  <div className="h-2 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.pct * 2}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Proof Footer */}
          <div className="pt-4 border-t border-[#E5DFD3] space-y-1 text-xs">
            <div className="font-semibold text-[#2E6B4E] flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>
                {isMicro
                  ? '73% (19,157 women) achieved ≥10% monthly income growth'
                  : '82% (11,849 women) achieved Functional Literacy (Grade 3+)'}
              </span>
            </div>
            <p className="text-[11px] text-[#6B655C]">
              {isMicro
                ? '8% (2,099 women) declined due to working capital and machine repair gaps in 2 clusters.'
                : '5% (723 women) pre-emergent learners enrolled in remedial evening study circles.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── BOTTOM FULL WIDTH: SVG DUMBBELL RANGE CHART (EARNINGS BY TRADE) ─ */}
      <section className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E5DFD3] pb-4">
          <div>
            <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
              {isMicro
                ? 'Which Trades Deliver the Strongest Earnings?'
                : 'Which Literacy Competencies Improved the Most?'}
            </h2>
            <p className="text-xs text-[#6B655C] mt-0.5">
              {isMicro
                ? 'Baseline (M0) to Endline (M6) median earnings across micro-sectors on a shared ₹4k–₹9k scale.'
                : 'Intake vs Endline performance across functional reading and comprehension modules.'}
            </p>
          </div>
          <span className="text-xs text-[#8C8479]">
            {isMicro ? '28,400 Women Across 5 Sectors' : '14,450 Women Across 5 Modules'}
          </span>
        </div>

        {/* Dumbbell Chart Grid Ledger */}
        <div className="divide-y divide-[#E5DFD3]">
          {dumbbellData.map((row, idx) => {
            // SVG Dumbbell calculation on shared axis
            // Domain for Micro-skilling: 4000 to 9000 (span = 5000)
            // Domain for Literacy: 0 to 100 (span = 100)
            const minDomain = isMicro ? 4000 : 0;
            const maxDomain = isMicro ? 9000 : 100;
            const span = maxDomain - minDomain;

            const m0Pct = Math.max(0, Math.min(100, ((row.m0 - minDomain) / span) * 100));
            const m6Pct = Math.max(0, Math.min(100, ((row.m6 - minDomain) / span) * 100));

            return (
              <div
                key={idx}
                className="py-4 hover:bg-[#F7F4ED]/40 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
              >
                {/* Col 1: Trade Title + Headcount (md:col-span-4) */}
                <div className="md:col-span-4 space-y-0.5">
                  <h3 className="font-sans text-sm font-semibold text-[#1C1917]">
                    {row.trade}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#6B655C] tabular-nums">
                    <span>{row.count.toLocaleString()} women</span>
                    <span>·</span>
                    <span>{row.pctTotal}% of cohort</span>
                  </div>
                </div>

                {/* Col 2: Start → End Values (md:col-span-2) */}
                <div className="md:col-span-2 space-y-0.5 tabular-nums">
                  <span className="text-[10px] uppercase font-medium text-[#8C8479] tracking-wider block">
                    M0 → M6
                  </span>
                  <div className="text-xs font-semibold text-[#1C1917]">
                    {isMicro ? `₹${row.m0.toLocaleString()} → ₹${row.m6.toLocaleString()}` : `${row.m0}% → ${row.m6}%`}
                  </div>
                  <span className="text-[10px] text-[#6B655C]">median / mo</span>
                </div>

                {/* Col 3: SVG Dumbbell Range Visual (md:col-span-3) */}
                <div className="md:col-span-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-[#8C8479] tabular-nums">
                    <span>{isMicro ? '₹4k' : '0%'}</span>
                    <span>{isMicro ? '₹6.5k' : '50%'}</span>
                    <span>{isMicro ? '₹9k' : '100%'}</span>
                  </div>

                  {/* SVG Dumbbell Visual */}
                  <div className="h-6 w-full relative flex items-center">
                    {/* Background track line */}
                    <div className="absolute inset-x-0 h-[2px] bg-[#E5DFD3]" />

                    {/* Connecting Dumbbell Range Bar */}
                    <div
                      className="absolute h-[3px] bg-[#2E6B4E] rounded-full"
                      style={{
                        left: `${m0Pct}%`,
                        width: `${m6Pct - m0Pct}%`,
                      }}
                    />

                    {/* M0 Hollow Grey Circle */}
                    <div
                      className="absolute w-3 h-3 rounded-full border-2 border-[#8C8479] bg-[#FCFBF8] -translate-x-1.5"
                      style={{ left: `${m0Pct}%` }}
                      title={`M0 Baseline: ${isMicro ? `₹${row.m0}` : `${row.m0}%`}`}
                    />

                    {/* M6 Solid Botanical Moss Circle */}
                    <div
                      className="absolute w-3.5 h-3.5 rounded-full bg-[#2E6B4E] border-2 border-[#FCFBF8] -translate-x-1.5 shadow-2xs"
                      style={{ left: `${m6Pct}%` }}
                      title={`M6 Endline: ${isMicro ? `₹${row.m6}` : `${row.m6}%`}`}
                    />
                  </div>
                </div>

                {/* Col 4: Lift / Gain (md:col-span-1) */}
                <div className="md:col-span-1 space-y-0.5 tabular-nums">
                  <span className="text-[10px] uppercase font-medium text-[#8C8479] tracking-wider block">
                    GAIN
                  </span>
                  <div className="text-xs font-semibold text-[#2E6B4E]">
                    {isMicro ? `+₹${row.gain.toLocaleString()}` : `+${row.gain}%`}
                  </div>
                  <span className="text-[10px] text-[#2E6B4E] font-medium">+{row.liftPct}%</span>
                </div>

                {/* Col 5: Actionable Tag (md:col-span-2) */}
                <div className="md:col-span-2 flex items-center justify-end">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-md"
                    style={{
                      color: row.tagColor,
                      backgroundColor: row.tagBg,
                    }}
                  >
                    {row.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── INTERACTIVE SLIDE-OVER INSPECTION DRAWER (Desktop: 420px · Mobile: Bottom Sheet) ── */}
      {inspectionDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <aside className="w-full sm:max-w-md max-h-[88dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl flex flex-col justify-between">
            {/* Drag Handle */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B42318] tracking-wider block">
                    Underperforming Cohort Inspection
                  </span>
                  <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                    8% Declined Group (2,099 Women)
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Beneficiaries reporting &gt;10% drop in monthly income at M6 audit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectionDrawerOpen(false)}
                  className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Geographic Concentration */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                  Geographic Concentration
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1C1917]">Thane Cluster (Magic Bus)</div>
                      <div className="text-[11px] text-[#6B655C]">Bhiwandi &amp; Mumbra urban slums</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-[#B42318]">44% (999 women)</div>
                      <div className="text-[10px] text-[#8C8479]">Highest drop-out</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1C1917]">Chhindwara Rural (Goonj)</div>
                      <div className="text-[11px] text-[#6B655C]">Tribal agricultural blocks</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-[#B42318]">28% (636 women)</div>
                      <div className="text-[10px] text-[#8C8479]">Seasonal migration</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1C1917]">Jabalpur &amp; Pune Blocks</div>
                      <div className="text-[11px] text-[#6B655C]">SEWA Bharat &amp; Pratham</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-[#1C1917]">28% (637 women)</div>
                      <div className="text-[10px] text-[#8C8479]">Scattered variance</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Root Causes */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                  Primary Root Causes (Field Surveyor Reports)
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>1. Working Capital Bottleneck</span>
                      <span className="text-[#B42318]">48% of cases</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C] leading-relaxed">
                      Women completed sewing courses but lacked ₹3,000–₹5,000 to purchase initial fabric rolls in bulk, forcing reliance on high-cost informal credit.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>2. Seasonal Agricultural Demand Dip</span>
                      <span className="text-[#B42318]">32% of cases</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C] leading-relaxed">
                      Post-monsoon harvest labor migration reduced local purchasing power in rural weekly haat markets.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1">
                    <div className="flex justify-between font-semibold text-[#1C1917]">
                      <span>3. Sewing Machine Maintenance Delay</span>
                      <span className="text-[#B42318]">20% of cases</span>
                    </div>
                    <p className="text-[11px] text-[#6B655C] leading-relaxed">
                      Provided motor attachments suffered mechanical breakdowns without nearby repair technicians in remote tribal clusters.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
              <button
                type="button"
                onClick={handleScheduleFollowUp}
                className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar size={14} />
                <span>Schedule Field Follow-Up</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectionDrawerOpen(false)}
                className="w-full py-2 rounded-xl bg-[#F7F4ED] text-xs font-semibold text-[#6B655C] hover:text-[#1C1917] cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
