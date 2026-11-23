import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  BookOpen,
  CheckCircle2 as CheckCircle,
  X,
  HelpCircle as Question,
  Clock as ClockAfternoon,
  Sparkles as Sparkle,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  CONTROL_BENCHMARK,
  computePortfolioKPIs,
} from '../data/ngoPerformanceData';
import type { ProgramType, NGOProgramRecord } from '../data/ngoPerformanceData';
import { useImpactStore } from '../data/impactStore';
import { AnimatedNumber } from '../components/AnimatedNumber';

// ─── Number Formatters ───
const fmtINR = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const fmtNum = (val: number) => val.toLocaleString('en-IN');

export const NGOPerformance: React.FC = () => {
  const { ngos, draftAllocation, saveDraftAllocation } = useImpactStore();

  // ─── Header & Program State ───
  const [program, setProgram] = useState<ProgramType>('micro-skilling');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Districts');
  const [partnerAId, setPartnerAId] = useState<string>('pratham');
  const [partnerBId, setPartnerBId] = useState<string>('smile');

  // Drawers & Modals
  const [metricGuideOpen, setMetricGuideOpen] = useState<boolean>(false);
  const [guideActiveSection, setGuideActiveSection] = useState<number>(1);

  // Act 2 Regional Gap Adjustment
  const [regionalGapAdjusted, setRegionalGapAdjusted] = useState<boolean>(false);

  // Act 3 Funnel Display Mode (100 women vs actual count)
  const [funnelMode, setFunnelMode] = useState<'per100' | 'actual'>('per100');
  const [activeFunnelHover, setActiveFunnelHover] = useState<'stage1-2' | 'stage2-3' | 'stage3-4' | null>(null);

  // ─── Capital Reallocation Simulator State ───
  const [simAllocations, setSimAllocations] = useState<Record<string, number>>(() => ({
    pratham: draftAllocation?.pratham ?? 8.2,
    smile: draftAllocation?.smile ?? 9.0,
    goonj: draftAllocation?.goonj ?? 4.8,
    'magic-bus': draftAllocation?.['magic-bus'] ?? 6.0,
  }));
  const [simToast, setSimToast] = useState<{ title: string; desc: string } | null>(null);

  const baselineAlloc = useMemo(() => ({
    pratham: 8.2,
    smile: 9.0,
    goonj: 4.8,
    'magic-bus': 6.0,
  }), []);

  const computeMetrics = useCallback((alloc: Record<string, number>) => {
    const pAlloc = alloc.pratham ?? 8.2;
    const sAlloc = alloc.smile ?? 9.0;
    const gAlloc = alloc.goonj ?? 4.8;
    const mAlloc = alloc['magic-bus'] ?? 6.0;
    const totalCr = Number((pAlloc + sAlloc + gAlloc + mAlloc).toFixed(1));

    const pNgo = ngos.find(n => n.ngoId === 'pratham') || { costPerOutcome: 6250, extraMonthlyIncome: 1600, sroiMultiplier: 3.42, auditIntegrityScore: 96 };
    const sNgo = ngos.find(n => n.ngoId === 'smile') || { costPerOutcome: 7150, extraMonthlyIncome: 1550, sroiMultiplier: 2.95, auditIntegrityScore: 91 };
    const gNgo = ngos.find(n => n.ngoId === 'goonj') || { costPerOutcome: 4400, extraMonthlyIncome: 1800, sroiMultiplier: 4.18, auditIntegrityScore: 94 };
    const mNgo = ngos.find(n => n.ngoId === 'magic-bus') || { costPerOutcome: 11400, extraMonthlyIncome: 950, sroiMultiplier: 1.48, auditIntegrityScore: 74 };

    const pGrads = Math.round((pAlloc * 10000000) / pNgo.costPerOutcome);
    const sGrads = Math.round((sAlloc * 10000000) / sNgo.costPerOutcome);
    const gGrads = Math.round((gAlloc * 10000000) / gNgo.costPerOutcome);
    const mGrads = Math.round((mAlloc * 10000000) / mNgo.costPerOutcome);
    const totalGrads = pGrads + sGrads + gGrads + mGrads;

    const pInc = (pGrads * pNgo.extraMonthlyIncome * 12) / 10000000;
    const sInc = (sGrads * sNgo.extraMonthlyIncome * 12) / 10000000;
    const gInc = (gGrads * gNgo.extraMonthlyIncome * 12) / 10000000;
    const mInc = (mGrads * mNgo.extraMonthlyIncome * 12) / 10000000;
    const totalAnnualIncomeCr = Number((pInc + sInc + gInc + mInc).toFixed(2));

    const blendedSroi = totalCr > 0
      ? Number(((pAlloc * pNgo.sroiMultiplier + sAlloc * sNgo.sroiMultiplier + gAlloc * gNgo.sroiMultiplier + mAlloc * mNgo.sroiMultiplier) / totalCr).toFixed(2))
      : 0;

    return {
      totalCr,
      pGrads,
      sGrads,
      gGrads,
      mGrads,
      totalGrads,
      totalAnnualIncomeCr,
      newSroi: blendedSroi,
      pNgo,
      sNgo,
      gNgo,
      mNgo,
    };
  }, [ngos]);

  const baselineMetrics = useMemo(() => computeMetrics(baselineAlloc), [computeMetrics, baselineAlloc]);

  // ─── Mathematical Model for Capital Reallocation Simulator ───
  const simMath = useMemo(() => {
    const live = computeMetrics(simAllocations);
    const totalCr = live.totalCr;
    const isBalanced = Math.abs(totalCr - 28.0) < 0.05;
    const deltaBudget = Number((totalCr - 28.0).toFixed(1));
    const deltaGrads = live.totalGrads - baselineMetrics.totalGrads;
    const deltaAnnualIncomeCr = Number((live.totalAnnualIncomeCr - baselineMetrics.totalAnnualIncomeCr).toFixed(2));
    const sroiLiftPct = baselineMetrics.newSroi > 0
      ? Math.round(((live.newSroi - baselineMetrics.newSroi) / baselineMetrics.newSroi) * 100)
      : 0;

    return {
      ...live,
      isBalanced,
      deltaBudget,
      deltaGrads,
      deltaAnnualIncomeCr,
      sroiLiftPct,
      baselineGrads: baselineMetrics.totalGrads,
      baselineSroi: baselineMetrics.newSroi,
    };
  }, [computeMetrics, simAllocations, baselineMetrics]);

  const handleAutoBalance = () => {
    const currentTotal = (simAllocations.pratham || 8.2) + (simAllocations.smile || 9.0) + (simAllocations.goonj || 4.8) + (simAllocations['magic-bus'] || 6.0);
    if (currentTotal === 0) return;
    const factor = 28.0 / currentTotal;
    setSimAllocations({
      pratham: Number(((simAllocations.pratham || 8.2) * factor).toFixed(1)),
      smile: Number(((simAllocations.smile || 9.0) * factor).toFixed(1)),
      goonj: Number(((simAllocations.goonj || 4.8) * factor).toFixed(1)),
      'magic-bus': Number((28.0 - (Number(((simAllocations.pratham || 8.2) * factor).toFixed(1)) + Number(((simAllocations.smile || 9.0) * factor).toFixed(1)) + Number(((simAllocations.goonj || 4.8) * factor).toFixed(1)))).toFixed(1)),
    });
  };

  const handleResetAllocation = () => {
    setSimAllocations({
      pratham: 8.2,
      smile: 9.0,
      goonj: 4.8,
      'magic-bus': 6.0,
    });
  };

  const handleSaveDraftAllocation = () => {
    saveDraftAllocation(simAllocations);
    setSimToast({
      title: 'FY26 Draft Allocation Proposal Saved',
      desc: `Micro-Skilling envelope saved at ₹${simMath.totalCr} Cr. Board committee briefing paper updated.`,
    });
    setTimeout(() => setSimToast(null), 3500);
  };

  // Act 4 Metric Tab
  const [growthMetricTab, setGrowthMetricTab] = useState<'income' | 'businesses' | 'upi'>('income');

  // Ref for Act 2 smooth scroll
  const act2Ref = useRef<HTMLDivElement>(null);

  // ─── Program Switching Handler ───
  const handleProgramChange = (newProg: ProgramType) => {
    setProgram(newProg);
    setSelectedLocation('All Districts');
    if (newProg === 'micro-skilling') {
      setPartnerAId('pratham');
      setPartnerBId('smile');
      setGrowthMetricTab('income');
    } else {
      setPartnerAId('educate-girls');
      setPartnerBId('room-to-read');
      setGrowthMetricTab('income');
    }
  };

  // ─── Filter Logic ───
  const filteredRecords = useMemo(() => {
    return ngos.filter(r => {
      if (r.program !== program) return false;
      if (selectedLocation !== 'All Districts' && r.district !== selectedLocation) return false;
      return true;
    });
  }, [ngos, program, selectedLocation]);

  const portfolio = useMemo(() => computePortfolioKPIs(filteredRecords), [filteredRecords]);

  // Available districts for the current program
  const availableDistricts = useMemo(() => {
    const progs = ngos.filter(r => r.program === program);
    return Array.from(new Set(progs.map(r => r.district)));
  }, [ngos, program]);

  // Compared Partners
  const partnerA = useMemo(() => {
    return ngos.find(r => r.ngoId === partnerAId) || filteredRecords[0] || ngos[0];
  }, [partnerAId, filteredRecords, ngos]);

  const partnerB = useMemo(() => {
    return ngos.find(r => r.ngoId === partnerBId) || filteredRecords[1] || ngos[1];
  }, [partnerBId, filteredRecords, ngos]);

  // Swap Partners
  const handleSelectPartner = (ngoId: string) => {
    if (ngoId === partnerAId) return;
    if (ngoId === partnerBId) {
      setPartnerBId(partnerAId);
      setPartnerAId(ngoId);
    } else {
      setPartnerBId(ngoId);
    }
    act2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Open Metric Guide to specific section
  const openMetricGuide = (actNumber: number) => {
    setGuideActiveSection(actNumber);
    setMetricGuideOpen(true);
  };

  // ─── Program Text Configuration ───
  const isLiteracy = program === 'literacy';
  const programConfig = useMemo(() => {
    if (isLiteracy) {
      return {
        title: "Foundational Women's Literacy (FLN)",
        headlineSummary: `Across 4 foundational literacy partners, Bajaj's ${fmtINR(portfolio.totalGrantDisbursed)} grant achieved an average ${portfolio.avgNetLift}pt literacy mastery jump per ₹1 spent — comparing retention, functional numeracy, and third-party audit rigor.`,
        valueMapYAxis: "FLN Reading Mastery Jump (pts)",
        valueMapCostLabel: "Cost per Literate Graduate (₹)",
        funnelStages: [
          { name: "Joined Program", sub: "Intake baseline" },
          { name: "Finished Primer", sub: "Completed 6-mo curriculum" },
          { name: "Functionally Literate", sub: "FLN Level 3 passed" },
          { name: "Sustained Reading", sub: "Active habit at 12 months" },
        ],
        growthTabs: [
          { id: 'income', label: 'FLN Score Jump (pts)' },
          { id: 'businesses', label: 'Applied Numeracy (%)' },
          { id: 'upi', label: 'Autonomous Bank/ATM Use (%)' },
        ],
        dropoffStage12A: `${partnerA.ngoName} reports 5% drop-out due to seasonal crop harvest migrations.`,
        dropoffStage12B: `${partnerB.ngoName} reports 4% drop-out due to domestic eldercare responsibilities.`,
      };
    }
    return {
      title: "Micro-Skilling: Women Entrepreneurs",
      headlineSummary: `Across 4 enterprise partners, Bajaj's ${fmtINR(portfolio.totalGrantDisbursed)} grant generated ₹${portfolio.blendedSROI} in verified women's income per ₹1 spent — comparing market conversion, 1-year enterprise survival, and field audit integrity.`,
      valueMapYAxis: "Extra Rupees Earned / Month (₹)",
      valueMapCostLabel: "Cost per Successful Graduate (₹)",
      funnelStages: [
        { name: "Joined Program", sub: "Base cohort enrolled" },
        { name: "Finished Training", sub: "100% course attendance" },
        { name: "Opened Business", sub: "Live micro-enterprise" },
        { name: "Earning at 1 Year", sub: "12-month staying power" },
      ],
      growthTabs: [
        { id: 'income', label: 'Monthly Income (₹)' },
        { id: 'businesses', label: 'New Businesses Running' },
        { id: 'upi', label: 'Digital UPI Usage (%)' },
      ],
      dropoffStage12A: `${partnerA.ngoName} loses 5% due to relocation to peri-urban manufacturing hubs for formal factory shifts.`,
      dropoffStage12B: `${partnerB.ngoName} loses 8% due to rural childcare bottlenecks and seasonal crop harvesting.`,
    };
  }, [isLiteracy, portfolio, partnerA, partnerB]);

  // ─── Act 2: 5-Axis Radar Data ───
  const radarChartData = useMemo(() => {
    return [
      { axis: isLiteracy ? 'Literacy Depth' : 'Income Lift Depth', partnerA: partnerA.radarMetrics.impactDepth, partnerB: partnerB.radarMetrics.impactDepth },
      { axis: 'Cost Efficiency', partnerA: partnerA.radarMetrics.costEfficiency, partnerB: partnerB.radarMetrics.costEfficiency },
      { axis: isLiteracy ? 'Course Attendance' : 'Training Completion', partnerA: partnerA.radarMetrics.retentionAttendance, partnerB: partnerB.radarMetrics.retentionAttendance },
      { axis: isLiteracy ? '12-Mo Retention' : '1-Year Staying Power', partnerA: partnerA.radarMetrics.sustainabilityM12, partnerB: partnerB.radarMetrics.sustainabilityM12 },
      { axis: 'Audit Verification', partnerA: partnerA.radarMetrics.dataIntegrity, partnerB: partnerB.radarMetrics.dataIntegrity },
    ];
  }, [partnerA, partnerB, isLiteracy]);

  // ─── Act 4: Longitudinal Trajectory Data ───
  const longitudinalChartData = useMemo(() => {
    const waves: ('M0' | 'M3' | 'M6' | 'M12')[] = ['M0', 'M3', 'M6', 'M12'];
    const control = CONTROL_BENCHMARK[program];

    return waves.map((w, idx) => {
      const row: Record<string, string | number> = { wave: w };
      const ctrlPoint = control[idx];
      row['Control_Benchmark'] = ctrlPoint.value;

      const ptA = partnerA.longitudinal.find(p => p.wave === w);
      if (ptA) row[partnerA.ngoName] = ptA.value;

      const ptB = partnerB.longitudinal.find(p => p.wave === w);
      if (ptB) row[partnerB.ngoName] = ptB.value;

      return row;
    });
  }, [partnerA, partnerB, program]);

  return (
    <div className="min-h-screen text-[var(--text-primary)] pb-32">
      {/* ─── TOAST NOTIFICATION ─── */}
      {simToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#FCFBF8] border border-[#2E6B4E]/40 px-5 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle size={18} className="text-[#2E6B4E]" />
          <div>
            <p className="text-xs font-semibold text-[#1C1917]">{simToast.title}</p>
            <p className="text-[11px] text-[#6B655C]">{simToast.desc}</p>
          </div>
        </div>
      )}

      {/* ─── SLEEK COMPARISON CONTEXT BAR (STICKY UNDER GLOBAL TOP BAR, ZERO MARGIN OVERFLOW) ─── */}
      <div
        aria-label="Executive comparative workspace controls"
        className="sticky top-14 z-20 bg-[#FCFBF8] border border-[#E5DFD3] rounded-2xl px-4 sm:px-5 py-3 shadow-2xs mb-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-3"
      >
        {/* Left: Program & Location Dropdowns */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Program Dropdown */}
          <select
            value={program}
            onChange={e => handleProgramChange(e.target.value as ProgramType)}
            className="font-narrative text-sm sm:text-base font-semibold text-[#1C1917] bg-transparent border-0 border-b border-[#E5DFD3] pb-0.5 focus:border-[#0B4A7D] focus:outline-none cursor-pointer pr-3"
          >
            <option value="micro-skilling">Micro-Skilling: Women Entrepreneurs (28,400 Women · 4 NGOs)</option>
            <option value="literacy">Foundational Women's Literacy (14,450 Women · 2 NGOs)</option>
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="hidden sm:inline-block text-xs font-medium text-[#6B655C] hover:text-[#1C1917] bg-[#FCFBF8] border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="All Districts">All Districts</option>
            {availableDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Center: Live Matchup Selector (Visual Anchor) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCFBF8] border border-[#E5DFD3] text-xs shadow-2xs">
          <span className="text-[#8C8479] font-medium">Comparing:</span>
          
          {/* Partner A Dropdown */}
          <select
            value={partnerAId}
            onChange={e => setPartnerAId(e.target.value)}
            className="font-bold text-[#0B4A7D] bg-transparent focus:outline-none cursor-pointer"
          >
            {ngos.filter(r => r.program === program).map(r => (
              <option key={r.ngoId} value={r.ngoId}>
                {r.ngoName} ({r.district})
              </option>
            ))}
          </select>

          <span className="text-[#8C8479] text-[11px] font-sans">vs</span>

          {/* Partner B Dropdown */}
          <select
            value={partnerBId}
            onChange={e => setPartnerBId(e.target.value)}
            className="font-bold text-[#B5532A] bg-transparent focus:outline-none cursor-pointer"
          >
            {ngos.filter(r => r.program === program).map(r => (
              <option key={r.ngoId} value={r.ngoId}>
                {r.ngoName} ({r.district})
              </option>
            ))}
          </select>
        </div>

        {/* Right: Metric Guide & Export Brief */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('capital-simulator');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0B4A7D] text-white hover:bg-[#083A63] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25"
          >
            <span>Simulate Reallocation ▾</span>
          </button>

          <button
            type="button"
            onClick={() => openMetricGuide(1)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E5DFD3] bg-[#FCFBF8] text-[#6B655C] hover:text-[#1C1917] hover:border-[#0B4A7D] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25"
          >
            <BookOpen size={14} className="text-[#0B4A7D]" />
            <span>Metric Guide</span>
          </button>
        </div>

        {/* Mobile Matchup Selector (Visible on < lg) */}
        <div className="w-full lg:hidden flex items-center justify-between gap-2 pt-2 border-t border-[#E5DFD3] text-xs">
          <span className="text-[#8C8479] font-medium text-[11px]">Compare:</span>
          <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
            <select
              value={partnerAId}
              onChange={e => setPartnerAId(e.target.value)}
              className="font-bold text-[#0B4A7D] bg-transparent text-xs focus:outline-none cursor-pointer truncate max-w-[120px]"
            >
              {ngos.filter(r => r.program === program).map(r => (
                <option key={r.ngoId} value={r.ngoId}>
                  {r.ngoName}
                </option>
              ))}
            </select>
            <span className="text-[#8C8479] text-[10px]">vs</span>
            <select
              value={partnerBId}
              onChange={e => setPartnerBId(e.target.value)}
              className="font-bold text-[#B5532A] bg-transparent text-xs focus:outline-none cursor-pointer truncate max-w-[120px]"
            >
              {ngos.filter(r => r.program === program).map(r => (
                <option key={r.ngoId} value={r.ngoId}>
                  {r.ngoName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── CLICKABLE METRIC GUIDE SLIDE-OVER SIDEBAR (400px WIDE) ─── */}
      {metricGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <aside className="w-full sm:max-w-md max-h-[88dvh] sm:max-h-full sm:h-full bg-[var(--surface-card)] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[var(--border-hairline)] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl">
            {/* Mobile Drag Handle */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[var(--accent)]" />
                <h2 className="font-narrative text-xl font-medium text-[var(--text-primary)]">
                  CSR Metric Guide
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMetricGuideOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Every metric on this dashboard follows Suman Bajaj's capital-allocation governance model for {programConfig.title}. Click any stage below to inspect definitions, mathematical formulas, and boardroom rationale.
            </p>

            {/* Stages Accordion */}
            <div className="space-y-4">
              {/* Act 1 Guide */}
              <div className={`p-4 rounded-xl border transition-all ${guideActiveSection === 1 ? 'border-[var(--accent)] bg-[var(--surface-raised)]/40' : 'border-[var(--border-hairline)] bg-[var(--surface-card)]'}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">Act 1 · Capital &amp; Scale</span>
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">{isLiteracy ? 'Cost per Literate Graduate' : 'Cost per Successful Graduate'}</span>
                </div>
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mt-2">
                  <p><strong>What it means:</strong> The true grant spend required to produce one woman who finishes the program and sustains verified outcomes at Month 12.</p>
                  <p className="tabular-nums text-[11px] text-[var(--accent)] bg-[var(--surface-card)] p-2 rounded border border-[var(--border-hairline)] font-medium">
                    Total Grant Disbursed ÷ Women Sustaining Outcome at Month 12
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]"><strong>Why Bajaj tracks it:</strong> Exposes the real cost of drop-out leakage and prevents paying for enrollment numbers that fail to convert.</p>
                </div>
              </div>

              {/* Act 2 Guide */}
              <div className={`p-4 rounded-xl border transition-all ${guideActiveSection === 2 ? 'border-[var(--accent)] bg-[var(--surface-raised)]/40' : 'border-[var(--border-hairline)] bg-[var(--surface-card)]'}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">Act 2 · The Matchup</span>
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">5-Axis Performance Polygon</span>
                </div>
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mt-2">
                  <p><strong>What it means:</strong> Normalized 0–100 benchmark comparing Impact Depth, Cost Efficiency, Attendance, 1-Year Staying Power, and Field Audit Accuracy.</p>
                  <p className="text-[11px] text-[var(--text-muted)]"><strong>Why Bajaj tracks it:</strong> Prevents picking an NGO that excels at only one dimension (like cheap enrollment) while failing on long-term survival or data honesty.</p>
                </div>
              </div>

              {/* Act 3 Guide */}
              <div className={`p-4 rounded-xl border transition-all ${guideActiveSection === 3 ? 'border-[var(--accent)] bg-[var(--surface-raised)]/40' : 'border-[var(--border-hairline)] bg-[var(--surface-card)]'}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">Act 3 · Conversion Funnel</span>
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">The 100-Woman Flow</span>
                </div>
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mt-2">
                  <p><strong>What it means:</strong> Out of 100 women who register, how many complete training, pass endline milestones, and survive at 12 months?</p>
                  <p className="text-[11px] text-[var(--text-muted)]"><strong>Why Bajaj tracks it:</strong> Pinpoints the exact operational bottleneck where beneficiaries leak out of the pipeline so Bajaj can demand targeted programmatic fixes from the partner.</p>
                </div>
              </div>

              {/* Act 4 Guide */}
              <div className={`p-4 rounded-xl border transition-all ${guideActiveSection === 4 ? 'border-[var(--accent)] bg-[var(--surface-raised)]/40' : 'border-[var(--border-hairline)] bg-[var(--surface-card)]'}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">Act 4 · Rupee Efficiency</span>
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">Grant Rupee Anatomy</span>
                </div>
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mt-2">
                  <p><strong>What it means:</strong> Where did every ₹100 of Bajaj's CSR grant go? Splitting spend into Direct Training, Field Mentors, Admin Overhead, and Drop-out Leakage.</p>
                  <p className="text-[11px] text-[var(--text-muted)]"><strong>Why Bajaj tracks it:</strong> Enforces strict statutory compliance with Indian Companies Act CSR guidelines and eliminates administrative bloat.</p>
                </div>
              </div>

              {/* Act 5 Guide */}
              <div className={`p-4 rounded-xl border transition-all ${guideActiveSection === 5 ? 'border-[var(--accent)] bg-[var(--surface-raised)]/40' : 'border-[var(--border-hairline)] bg-[var(--surface-card)]'}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">Act 5 · Audit &amp; Consistency</span>
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">Field Verification Matrix</span>
                </div>
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mt-2">
                  <p><strong>What it means:</strong> Replaces opaque trust scores with 3 hard independent checks: GPS village match, random 5% phone callbacks, and UPI/bank transaction proofs.</p>
                  <p className="text-[11px] text-[var(--text-muted)]"><strong>Why Bajaj tracks it:</strong> Protects Suman Bajaj and the Board from reporting fabricated attendance or phantom beneficiary claims.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => setMetricGuideOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[var(--surface-raised)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-tag)] cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── ACT 1: THE BIG PICTURE & PARTNER SELECTION (MINIMALIST ENTRY) ─── */}
      <section className="space-y-10 pt-10">
        {/* Editorial Headline */}
        <div className="max-w-4xl space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            Act 1 · Portfolio Landscape &amp; Selection
          </p>
          <h1 className="font-narrative text-2xl sm:text-3xl lg:text-4xl leading-snug font-normal text-[var(--text-primary)]">
            {programConfig.headlineSummary}
          </h1>
        </div>

        {/* 4 Borderless Open-Canvas Typographic Stats Separated by Thin Hairlines */}
        <div className="grid grid-cols-2 md:grid-cols-4 py-4 border-y border-[var(--border-hairline)]">
          {/* Stat 1: Grant Disbursed */}
          <div className="pr-6 py-2">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium block">
              Grant Disbursed
            </span>
            <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
              {fmtINR(portfolio.totalGrantDisbursed)}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
              {portfolio.blendedUtilization}% utilized across {filteredRecords.length} partners
            </span>
          </div>

          {/* Stat 2: Women Reached */}
          <div className="px-6 py-2 border-l border-[var(--border-hairline)]">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium block">
              Women Reached
            </span>
            <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
              {fmtNum(portfolio.totalEnrolled)}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
              {fmtNum(portfolio.totalOutcomes)} completed baseline &amp; endline
            </span>
          </div>

          {/* Stat 3: Return per ₹1 (SROI) */}
          <div className="px-6 py-2 border-l border-[var(--border-hairline)]">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium block">
              Value per ₹1 Spent
            </span>
            <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[var(--accent)] mt-1">
              ₹{portfolio.blendedSROI}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
              Verified income generated per rupee funded
            </span>
          </div>

          {/* Stat 4: Field Audit Accuracy */}
          <div className="pl-6 py-2 border-l border-[var(--border-hairline)]">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium block">
              Field Audit Integrity
            </span>
            <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
              {portfolio.auditScore} <span className="text-sm font-normal text-[var(--text-muted)]">/ 100</span>
            </div>
            <span className="text-[11px] text-[#B91C1C] font-semibold block mt-0.5">
              94.2% GPS pass · 1 partner flagged (Magic Bus)
            </span>
          </div>
        </div>

        {/* Visual 1 — Value vs. Cost Map (Bubble Scatter Plot) */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="font-narrative text-xl font-normal text-[var(--text-primary)]">
                Value for Money: Cost vs. Verified Outcome
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Which partner achieves the highest outcome depth for the lowest grant spend per graduate? Click any bubble to swap into the 1:1 matchup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openMetricGuide(1)}
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1 cursor-pointer"
            >
              <Question size={13} />
              <span>How this is mapped</span>
            </button>
          </div>

          <div className="relative h-80 w-full rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-4 pt-6">
            {/* Top-Left Best Value Zone Callout */}
            <div className="absolute top-5 left-16 z-10 pointer-events-none text-[10px] font-bold uppercase tracking-wider text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
              Optimal Efficiency (High Outcome · Low Grant Spend)
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 25, left: 56 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                <XAxis
                  type="number"
                  dataKey="costPerOutcome"
                  name="Cost per Graduate"
                  unit="₹"
                  domain={isLiteracy ? [2500, 7500] : [3500, 12500]}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={{ stroke: 'var(--border-hairline)' }}
                  label={{
                    value: `${programConfig.valueMapCostLabel} → Lower spend is better`,
                    position: 'insideBottom',
                    offset: -15,
                    fill: 'var(--text-muted)',
                    fontSize: 10,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="extraMonthlyIncome"
                  name="Outcome Depth"
                  unit={isLiteracy ? " pts" : " ₹"}
                  domain={isLiteracy ? [30, 80] : [0, 2000]}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={{ stroke: 'var(--border-hairline)' }}
                  width={60}
                  label={{
                    value: programConfig.valueMapYAxis,
                    angle: -90,
                    position: 'insideLeft',
                    offset: -45,
                    fill: 'var(--text-muted)',
                    fontSize: 10,
                  }}
                />
                <ZAxis type="number" dataKey="enrolled" range={[120, 500]} />

                {/* Benchmark Dividers */}
                <ReferenceLine x={isLiteracy ? 5500 : 7500} stroke="var(--border-hairline)" strokeDasharray="4 4" />
                <ReferenceLine y={isLiteracy ? 60 : 1200} stroke="var(--border-hairline)" strokeDasharray="4 4" />

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as NGOProgramRecord;
                    return (
                      <div className="bg-[var(--surface-card)] border border-[var(--border-visible)] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[220px]">
                        <div className="flex justify-between items-center border-b border-[var(--border-hairline)] pb-1">
                          <span className="font-bold text-[var(--text-primary)]">{d.ngoName}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{d.district} ({d.tier})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-[11px] tabular-nums">
                          <span className="text-[var(--text-muted)]">Cost / Grad:</span>
                          <span className="font-bold text-[var(--text-primary)]">₹{fmtNum(d.costPerOutcome)}</span>
                          <span className="text-[var(--text-muted)]">{isLiteracy ? 'Literacy Jump:' : 'Extra Income:'}</span>
                          <span className="font-bold text-[var(--accent)]">{isLiteracy ? `+${d.extraMonthlyIncome} pts` : `+₹${fmtNum(d.extraMonthlyIncome)}/mo`}</span>
                          <span className="text-[var(--text-muted)]">Return / ₹1:</span>
                          <span className="font-bold text-[var(--accent)]">₹{d.sroiMultiplier}</span>
                          <span className="text-[var(--text-muted)]">Audit Pass:</span>
                          <span className="font-bold text-[var(--text-primary)]">{d.auditVerificationChecks.status} ({d.auditVerificationChecks.gpsGeofence}%)</span>
                        </div>
                        <p className="text-[10px] text-[var(--accent)] pt-1 border-t border-[var(--border-hairline)] font-medium">
                          Click bubble to compare 1:1 below ↓
                        </p>
                      </div>
                    );
                  }}
                />

                <Scatter
                  data={filteredRecords}
                  onClick={(d: any) => handleSelectPartner(d.ngoId)}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isA = payload.ngoId === partnerAId;
                    const isB = payload.ngoId === partnerBId;
                    const isFlagged = payload.auditStatus === 'flagged';
                    const color = isA ? '#0B4A7D' : isB ? '#B5532A' : isFlagged ? '#B42318' : '#646058';
                    const r = isA || isB ? 10 : 8;
                    const shortName = payload.ngoName.replace(' Foundation', '');

                    return (
                      <g className="cursor-pointer" onClick={() => handleSelectPartner(payload.ngoId)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill={color}
                          stroke="#FCFBF8"
                          strokeWidth={isA || isB ? 3 : 1.5}
                          className="hover:opacity-80 transition-all shadow-sm"
                        />
                        {/* Direct inline partner name label */}
                        <text
                          x={cx + r + 6}
                          y={cy + 4}
                          fontSize={11}
                          fontWeight={isA || isB ? 700 : 600}
                          fill={isA ? '#0B4A7D' : isB ? '#B5532A' : isFlagged ? '#B42318' : '#181D24'}
                          className="select-none pointer-events-none"
                        >
                          {shortName}
                        </text>
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partner Selector Strip (Replaces Cluttered Table & Row Dropdowns) */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline text-xs text-[var(--text-secondary)]">
            <span className="font-medium">Active Partners (Click any card to select or swap into the 1:1 matchup):</span>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              <span className="text-[#0B4A7D] font-bold">■</span> Partner A &nbsp;|&nbsp; <span className="text-[#B5532A] font-bold">■</span> Partner B
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredRecords.map(r => {
              const isA = r.ngoId === partnerAId;
              const isB = r.ngoId === partnerBId;

              return (
                <button
                  key={r.ngoId}
                  type="button"
                  onClick={() => handleSelectPartner(r.ngoId)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative ${
                    isA
                      ? 'border-t-4 border-t-[#0B4A7D] border-[var(--border-visible)] bg-[var(--surface-card)] shadow-sm'
                      : isB
                      ? 'border-t-4 border-t-[#B5532A] border-[var(--border-visible)] bg-[var(--surface-card)] shadow-sm'
                      : 'border-t-4 border-t-transparent border-[var(--border-hairline)] bg-[var(--surface-card)]/60 hover:bg-[var(--surface-card)] hover:border-[var(--border-visible)]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{r.ngoName}</span>
                    {isA && <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B4A7D] bg-[#E7F0F7] px-1.5 py-0.5 rounded">Partner A</span>}
                    {isB && <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5532A] bg-[#FAEDE6] px-1.5 py-0.5 rounded">Partner B</span>}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {r.district} · <span className="text-[var(--text-muted)]">{r.tier}</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[var(--border-hairline)] flex justify-between items-baseline text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Grant Spent</span>
                      <span className="font-semibold text-[var(--text-primary)]">{fmtINR(r.grantDisbursed)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--text-muted)] block">Return / ₹1</span>
                      <span className="font-bold text-[var(--accent)]">₹{r.sroiMultiplier}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ACT 2: THE MATCHUP VERDICT — 01 · OVERALL SHAPE (1:1 VERDICT) ─── */}
      <section ref={act2Ref} className="space-y-8 pt-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
            01 · Overall Shape
          </span>
          <div className="h-px bg-[var(--border-hairline)] flex-1" />
        </div>

        {/* Plain-English Verdict Callout (Single Font Role — Sans-Serif Body, Bold Key Numbers) */}
        <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-6 space-y-3">
          <p className="font-sans text-lg sm:text-xl font-normal leading-relaxed text-[var(--text-primary)]">
            <strong className="font-semibold text-[#0B4A7D]">{partnerA.ngoName} leads on cost efficiency and post-exit durability</strong>, delivering <strong>₹{Math.abs(partnerA.sroiMultiplier - partnerB.sroiMultiplier).toFixed(2)}</strong> more per rupee funded, while <strong className="font-semibold text-[#B5532A]">{partnerB.ngoName} achieves wider outreach</strong> reaching <strong>{fmtNum(Math.abs(partnerA.enrolled - partnerB.enrolled))}</strong> more women across a harder {partnerB.tier} operating geography.
          </p>

          {/* Regional Gap Adjustment Toggle */}
          {partnerA.tier !== partnerB.tier && (
            <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text-secondary)] pt-3 border-t border-[var(--border-hairline)] gap-2">
              <span>
                Operating environments: {partnerA.ngoName} in {partnerA.tier} ({partnerA.district}) vs. {partnerB.ngoName} in {partnerB.tier} ({partnerB.district})
              </span>
              <button
                type="button"
                onClick={() => setRegionalGapAdjusted(!regionalGapAdjusted)}
                className="text-[11px] font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkle size={13} />
                <span>{regionalGapAdjusted ? 'Adjusted for Regional Economic Base ✓' : 'Adjust for regional baseline difficulty ○'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Visual 2 — 5-Axis Pentagon Radar & 3-Point Head-to-Head Brief */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: 5-Axis Pentagon Radar Chart (55%) */}
          <div className="lg:col-span-7 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 space-y-2">
            <div className="flex justify-between items-baseline">
              <h3 className="font-narrative text-lg font-normal text-[var(--text-primary)]">
                5-Axis Performance Polygon
              </h3>
              <button
                type="button"
                onClick={() => openMetricGuide(2)}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer"
              >
                Axis Guide
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                  <PolarGrid stroke="var(--border-hairline)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-hairline)" tick={false} />
                  
                  {/* Partner A: Bajaj Heritage Blue Fill (16% Opacity) + Solid Stroke */}
                  <Radar
                    name={partnerA.ngoName}
                    dataKey="partnerA"
                    stroke="#0B4A7D"
                    strokeWidth={2.5}
                    fill="#0B4A7D"
                    fillOpacity={0.16}
                    isAnimationActive={true}
                    animationDuration={280}
                    animationEasing="ease-out"
                  />

                  {/* Partner B: Mineral Terracotta Outline (Dashed 4 4, Vertex Dots) */}
                  <Radar
                    name={partnerB.ngoName}
                    dataKey="partnerB"
                    stroke="#B5532A"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="#B5532A"
                    fillOpacity={0.02}
                    dot={{ r: 3, fill: '#B5532A' }}
                    isAnimationActive={true}
                    animationDuration={280}
                    animationEasing="ease-out"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center items-center gap-6 text-xs font-semibold pt-1 border-t border-[var(--border-hairline)]">
              <div className="flex items-center gap-1.5 text-[#0B4A7D]">
                <span className="w-3 h-1 bg-[#0B4A7D] inline-block" />
                <span>{partnerA.ngoName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#B5532A]">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#B5532A] inline-block" />
                <span>{partnerB.ngoName}</span>
              </div>
            </div>
          </div>

          {/* Right: 3-Point Head-to-Head Brief (45%) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Point 1: Where Partner A Wins */}
            <div className="p-4 rounded-xl bg-[var(--surface-card)] border-l-4 border-l-[#0B4A7D] border border-[var(--border-hairline)] space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#0B4A7D]">
                Where {partnerA.ngoName} Wins
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                ₹{fmtNum(Math.abs(partnerA.costPerOutcome - partnerB.costPerOutcome))} lower cost per graduate &amp; +₹{Math.abs(partnerA.sroiMultiplier - partnerB.sroiMultiplier).toFixed(2)} return per ₹1 grant.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Higher long-term staying power at 12 months ({partnerA.conversionFunnel.earning1Yr}% vs {partnerB.conversionFunnel.earning1Yr}% verified persistence).
              </p>
            </div>

            {/* Point 2: Where Partner B Wins */}
            <div className="p-4 rounded-xl bg-[var(--surface-card)] border-l-4 border-l-[#B5532A] border border-[var(--border-hairline)] space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#B5532A]">
                Where {partnerB.ngoName} Wins
              </span>
              <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                Mobilized {fmtNum(Math.abs(partnerA.enrolled - partnerB.enrolled))} more women across {partnerB.district} ({partnerB.tier}).
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Superior community immersion and grassroots mobilization rate in rural clusters.
              </p>
            </div>

            {/* Point 3: Audit Verification Status */}
            <div className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border-hairline)] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                <CheckCircle size={14} className="text-[var(--accent)]" />
                <span>Field Audit Verification</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {partnerA.auditStatus === 'flagged' || partnerB.auditStatus === 'flagged'
                  ? 'Audit Alert: Magic Bus flagged with 142 GPS anomalies under review. Clean partners averaged 98.1% GPS village match.'
                  : `Both partners cleared third-party KPMG spot audits (${partnerA.auditVerificationChecks.gpsGeofence}% vs ${partnerB.auditVerificationChecks.gpsGeofence}% GPS village match; field verified).`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ACT 3: FOLLOW THE WOMAN'S JOURNEY (PAIRED CONVERSION FUNNEL) ─── */}
      <section className="space-y-6 pt-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
            02 · Follow the Woman's Journey
          </span>
          <div className="h-px bg-[var(--border-hairline)] flex-1" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h2 className="font-narrative text-2xl font-normal text-[var(--text-primary)]">
              Follow the Woman's Journey: Conversion &amp; Staying Power
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Out of every 100 women who register, how many finish training, pass milestone gates, and remain active 12 months later?
            </p>
          </div>

          {/* Toggle between Per 100 Women and Actual Count */}
          <div className="inline-flex rounded-lg bg-[var(--surface-card)] p-0.5 border border-[var(--border-hairline)] text-xs flex-shrink-0">
            <button
              type="button"
              onClick={() => setFunnelMode('per100')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                funnelMode === 'per100' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Per 100 Women
            </button>
            <button
              type="button"
              onClick={() => setFunnelMode('actual')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                funnelMode === 'actual' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Actual Count
            </button>
          </div>
        </div>

        {/* Visual 3 — Custom SVG Paired Funnel Diagram */}
        <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-6 space-y-6">
          {/* SVG Diagram Canvas */}
          <div className="w-full overflow-x-auto">
            {(() => {
              const fA = partnerA.conversionFunnel;
              const fB = partnerB.conversionFunnel;

              // Proportional Half-Heights (Stage 1 base = 20px)
              const yA = 46;
              const hA1 = 20;
              const hA2 = Math.max(8, 20 * (fA.finished / 100));
              const hA3 = Math.max(8, 20 * (fA.opened / 100));
              const hA4 = Math.max(8, 20 * (fA.earning1Yr / 100));

              const yB = 126;
              const hB1 = 20;
              const hB2 = Math.max(8, 20 * (fB.finished / 100));
              const hB3 = Math.max(8, 20 * (fB.opened / 100));
              const hB4 = Math.max(8, 20 * (fB.earning1Yr / 100));

              const dropA_12 = fA.joined - fA.finished;
              const dropA_23 = fA.finished - fA.opened;
              const dropA_34 = fA.opened - fA.earning1Yr;

              const dropB_12 = fB.joined - fB.finished;
              const dropB_23 = fB.finished - fB.opened;
              const dropB_34 = fB.opened - fB.earning1Yr;

              return (
                <svg
                  viewBox="0 0 800 176"
                  className="w-full min-w-[680px] h-44 select-none"
                >
                  <defs>
                    <linearGradient id="funnelTealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0B4A7D" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#083A63" stopOpacity="0.14" />
                    </linearGradient>
                    <linearGradient id="funnelIndigoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#B5532A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8C3B18" stopOpacity="0.12" />
                    </linearGradient>
                  </defs>

                  {/* Connecting Trapezoids: Partner A (Bajaj Blue) with Genuine Proportional Tapering */}
                  <polygon
                    points={`100,${(yA - hA1).toFixed(1)} 300,${(yA - hA2).toFixed(1)} 300,${(yA + hA2).toFixed(1)} 100,${(yA + hA1).toFixed(1)}`}
                    fill="url(#funnelTealGrad)"
                    stroke="#0B4A7D"
                    strokeWidth="1.75"
                  />
                  <polygon
                    points={`300,${(yA - hA2).toFixed(1)} 500,${(yA - hA3).toFixed(1)} 500,${(yA + hA3).toFixed(1)} 300,${(yA + hA2).toFixed(1)}`}
                    fill="url(#funnelTealGrad)"
                    stroke="#0B4A7D"
                    strokeWidth="1.75"
                  />
                  <polygon
                    points={`500,${(yA - hA3).toFixed(1)} 700,${(yA - hA4).toFixed(1)} 700,${(yA + hA4).toFixed(1)} 500,${(yA + hA3).toFixed(1)}`}
                    fill="url(#funnelTealGrad)"
                    stroke="#0B4A7D"
                    strokeWidth="1.75"
                  />

                  {/* Connecting Trapezoids: Partner B (Terracotta) with Genuine Proportional Tapering */}
                  <polygon
                    points={`100,${(yB - hB1).toFixed(1)} 300,${(yB - hB2).toFixed(1)} 300,${(yB + hB2).toFixed(1)} 100,${(yB + hB1).toFixed(1)}`}
                    fill="url(#funnelIndigoGrad)"
                    stroke="#B5532A"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                  />
                  <polygon
                    points={`300,${(yB - hB2).toFixed(1)} 500,${(yB - hB3).toFixed(1)} 500,${(yB + hB3).toFixed(1)} 300,${(yB + hB2).toFixed(1)}`}
                    fill="url(#funnelIndigoGrad)"
                    stroke="#B5532A"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                  />
                  <polygon
                    points={`500,${(yB - hB3).toFixed(1)} 700,${(yB - hB4).toFixed(1)} 700,${(yB + hB4).toFixed(1)} 500,${(yB + hB3).toFixed(1)}`}
                    fill="url(#funnelIndigoGrad)"
                    stroke="#B5532A"
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                  />

                  {/* Stage Guide Lines */}
                  {[100, 300, 500, 700].map((x) => (
                    <line key={x} x1={x} y1="12" x2={x} y2="164" stroke="#E5DFD3" strokeWidth="1" strokeDasharray="2 2" />
                  ))}

                  {/* Partner A Central Nodes */}
                  <circle cx="100" cy={yA} r="4.5" fill="#0B4A7D" stroke="#FCFBF8" strokeWidth="2" />
                  <circle cx="300" cy={yA} r="4.5" fill="#0B4A7D" stroke="#FCFBF8" strokeWidth="2" />
                  <circle cx="500" cy={yA} r="4.5" fill="#0B4A7D" stroke="#FCFBF8" strokeWidth="2" />
                  <circle cx="700" cy={yA} r="4.5" fill="#0B4A7D" stroke="#FCFBF8" strokeWidth="2" />

                  {/* Partner B Central Nodes */}
                  <circle cx="100" cy={yB} r="4.5" fill="#B5532A" stroke="#FCFBF8" strokeWidth="2" />
                  <circle cx="300" cy={yB} r="4.5" fill="#B5532A" stroke="#FCFBF8" strokeWidth="2" />
                  <circle cx="500" cy={yB} r="4.5" fill="#B5532A" stroke="#FCFBF8" strokeWidth="2" />
                  <circle cx="700" cy={yB} r="4.5" fill="#B5532A" stroke="#FCFBF8" strokeWidth="2" />

                  {/* Partner A Slope-Attached Drop-Off Pills (Directly on Partner A Top Slope) */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveFunnelHover('stage1-2')}
                    onMouseLeave={() => setActiveFunnelHover(null)}
                  >
                    <rect x="180" y="8" width="40" height="18" rx="9" fill="#0B4A7D" stroke="#FCFBF8" strokeWidth="1.5" />
                    <text x="200" y="21" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">
                      -{dropA_12}%
                    </text>
                  </g>

                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveFunnelHover('stage2-3')}
                    onMouseLeave={() => setActiveFunnelHover(null)}
                  >
                    <rect x="380" y="12" width="40" height="18" rx="9" fill="#0B4A7D" stroke="#FCFBF8" strokeWidth="1.5" />
                    <text x="400" y="25" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">
                      -{dropA_23}%
                    </text>
                  </g>

                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveFunnelHover('stage3-4')}
                    onMouseLeave={() => setActiveFunnelHover(null)}
                  >
                    <rect x="580" y="16" width="40" height="18" rx="9" fill="#0B4A7D" stroke="#FCFBF8" strokeWidth="1.5" />
                    <text x="600" y="29" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">
                      -{dropA_34}%
                    </text>
                  </g>

                  {/* Partner B Slope-Attached Drop-Off Pills (Directly on Partner B Bottom Slope) */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveFunnelHover('stage1-2')}
                    onMouseLeave={() => setActiveFunnelHover(null)}
                  >
                    <rect x="180" y="148" width="40" height="18" rx="9" fill="#B5532A" stroke="#FCFBF8" strokeWidth="1.5" />
                    <text x="200" y="161" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">
                      -{dropB_12}%
                    </text>
                  </g>

                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveFunnelHover('stage2-3')}
                    onMouseLeave={() => setActiveFunnelHover(null)}
                  >
                    <rect x="380" y="148" width="40" height="18" rx="9" fill="#B5532A" stroke="#FCFBF8" strokeWidth="1.5" />
                    <text x="400" y="161" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">
                      -{dropB_23}%
                    </text>
                  </g>

                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveFunnelHover('stage3-4')}
                    onMouseLeave={() => setActiveFunnelHover(null)}
                  >
                    <rect x="580" y="148" width="40" height="18" rx="9" fill="#B5532A" stroke="#FCFBF8" strokeWidth="1.5" />
                    <text x="600" y="161" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">
                      -{dropB_34}%
                    </text>
                  </g>
                </svg>
              );
            })()}
          </div>

          {/* 4 Interactive Stage Cards with Hover Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Stage 1 */}
            <div className="p-4 rounded-xl bg-[var(--surface-raised)]/40 border border-[var(--border-hairline)] space-y-3">
              <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                1. {programConfig.funnelStages[0].name}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#0B4A7D]">{partnerA.ngoName}</span>
                  <span className="font-sans tabular-nums font-bold text-sm text-[var(--text-primary)]">
                    {funnelMode === 'per100' ? '100' : fmtNum(partnerA.enrolled)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#B5532A]">{partnerB.ngoName}</span>
                  <span className="font-sans tabular-nums font-bold text-sm text-[var(--text-primary)]">
                    {funnelMode === 'per100' ? '100' : fmtNum(partnerB.enrolled)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
                {programConfig.funnelStages[0].sub}
              </p>
            </div>

            {/* Stage 2 */}
            <div
              className="p-4 rounded-xl bg-[var(--surface-raised)]/40 border border-[var(--border-hairline)] space-y-3 cursor-pointer hover:border-[var(--accent)] transition-all"
              onMouseEnter={() => setActiveFunnelHover('stage1-2')}
              onMouseLeave={() => setActiveFunnelHover(null)}
            >
              <div className="flex justify-between items-center text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <span>2. {programConfig.funnelStages[1].name}</span>
                <span className="text-[10px] text-[var(--accent)] lowercase font-normal">hover for leak</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#0B4A7D]">{partnerA.ngoName}</span>
                  <span className="font-sans tabular-nums font-bold text-sm text-[var(--text-primary)]">
                    {funnelMode === 'per100' ? `${partnerA.conversionFunnel.finished}` : fmtNum(partnerA.retained)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#B5532A]">{partnerB.ngoName}</span>
                  <span className="font-sans tabular-nums font-bold text-sm text-[var(--text-primary)]">
                    {funnelMode === 'per100' ? `${partnerB.conversionFunnel.finished}` : fmtNum(partnerB.retained)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
                Completion: {partnerA.conversionFunnel.finished}% vs {partnerB.conversionFunnel.finished}%
              </p>
            </div>

            {/* Stage 3 */}
            <div
              className="p-4 rounded-xl bg-[var(--surface-raised)]/40 border border-[var(--border-hairline)] space-y-3 cursor-pointer hover:border-[var(--accent)] transition-all"
              onMouseEnter={() => setActiveFunnelHover('stage2-3')}
              onMouseLeave={() => setActiveFunnelHover(null)}
            >
              <div className="flex justify-between items-center text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <span>3. {programConfig.funnelStages[2].name}</span>
                <span className="text-[10px] text-[var(--accent)] lowercase font-normal">hover for leak</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#0B4A7D]">{partnerA.ngoName}</span>
                  <span className="font-sans tabular-nums font-bold text-sm text-[var(--text-primary)]">
                    {funnelMode === 'per100' ? `${partnerA.conversionFunnel.opened}` : fmtNum(Math.round(partnerA.enrolled * (partnerA.conversionFunnel.opened / 100)))}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#B5532A]">{partnerB.ngoName}</span>
                  <span className="font-sans tabular-nums font-bold text-sm text-[var(--text-primary)]">
                    {funnelMode === 'per100' ? `${partnerB.conversionFunnel.opened}` : fmtNum(Math.round(partnerB.enrolled * (partnerB.conversionFunnel.opened / 100)))}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
                Conversion: {partnerA.conversionFunnel.opened}% vs {partnerB.conversionFunnel.opened}%
              </p>
            </div>

            {/* Stage 4 */}
            <div
              className="p-4 rounded-xl bg-[var(--surface-raised)]/40 border border-[var(--border-hairline)] space-y-3 cursor-pointer hover:border-[var(--accent)] transition-all"
              onMouseEnter={() => setActiveFunnelHover('stage3-4')}
              onMouseLeave={() => setActiveFunnelHover(null)}
            >
              <div className="flex justify-between items-center text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <span>4. {programConfig.funnelStages[3].name}</span>
                <span className="text-[10px] text-[var(--accent)] lowercase font-normal">hover for leak</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#0B4A7D]">{partnerA.ngoName}</span>
                  <span className="font-sans tabular-nums font-bold text-sm text-[#0B4A7D]">
                    {funnelMode === 'per100' ? `${partnerA.conversionFunnel.earning1Yr}` : fmtNum(Math.round(partnerA.enrolled * (partnerA.conversionFunnel.earning1Yr / 100)))}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#B5532A]">{partnerB.ngoName}</span>
                  <span className="font-sans tabular-nums font-bold text-sm text-[#B5532A]">
                    {funnelMode === 'per100' ? `${partnerB.conversionFunnel.earning1Yr}` : fmtNum(Math.round(partnerB.enrolled * (partnerB.conversionFunnel.earning1Yr / 100)))}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
                1-Year Staying Power: {partnerA.conversionFunnel.earning1Yr}% vs {partnerB.conversionFunnel.earning1Yr}%
              </p>
            </div>
          </div>

          {/* Interactive Operational Root Cause Callout */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)]">
            {activeFunnelHover === 'stage1-2' && (
              <div>
                <strong className="text-[var(--text-primary)]">Training Drop-off Driver (Stage 1 → 2):</strong> {programConfig.dropoffStage12A} vs {programConfig.dropoffStage12B}
              </div>
            )}
            {activeFunnelHover === 'stage2-3' && (
              <div>
                <strong className="text-[var(--text-primary)]">Conversion Gap (Stage 2 → 3):</strong> {partnerA.conversionFunnel.dropoffFinishedToOpenedReason}.
              </div>
            )}
            {activeFunnelHover === 'stage3-4' && (
              <div>
                <strong className="text-[var(--text-primary)]">12-Month Persistence Gap (Stage 3 → 4):</strong> {partnerA.conversionFunnel.dropoffOpenedTo1YrReason}.
              </div>
            )}
            {!activeFunnelHover && (
              <div className="flex items-center gap-2">
                <ClockAfternoon size={14} className="text-[var(--accent)]" />
                <span>Hover over any stage or drop-off badge above to reveal the verified on-ground operational driver.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── ACT 4: FOLLOW THE MONEY — MONTHLY GROWTH & GRANT ANATOMY ─── */}
      <section className="space-y-6 pt-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
            03 · Follow the Money
          </span>
          <div className="h-px bg-[var(--border-hairline)] flex-1" />
        </div>

        <div>
          <h2 className="font-narrative text-2xl font-normal text-[var(--text-primary)]">
            Follow the Money: Month-by-Month Trajectory &amp; Grant Anatomy
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Verified longitudinal growth curves over time and statutory transparency on where every ₹100 of grant was deployed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Visual 4: Month-by-Month Growth Tracker (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 space-y-4">
            {/* Metric Tabs */}
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <div className="flex items-center gap-1.5 text-xs">
                {programConfig.growthTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setGrowthMetricTab(tab.id as any)}
                    className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                      growthMetricTab === tab.id ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-[var(--text-muted)] font-sans hidden sm:inline">Dashed = Non-program control</span>
            </div>

            {/* Line Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={longitudinalChartData} margin={{ top: 15, right: 30, left: 15, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
                  <XAxis
                    dataKey="wave"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={{ stroke: 'var(--border-hairline)' }}
                    label={{
                      value: 'Survey Wave: M0 (Intake) → M3 → M6 (Endline) → M12 (1-Year Persistence)',
                      position: 'insideBottom',
                      offset: -20,
                      fill: 'var(--text-muted)',
                      fontSize: 10,
                    }}
                  />
                  <YAxis
                    domain={isLiteracy ? [5, 80] : [4800, 7500]}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={{ stroke: 'var(--border-hairline)' }}
                    tickFormatter={val => isLiteracy ? `${val} pts` : `₹${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-[var(--surface-card)] border border-[var(--border-visible)] p-2.5 rounded-xl shadow-xl text-xs space-y-1 tabular-nums">
                          <p className="font-bold text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-1">
                            Survey Wave: {label}
                          </p>
                          {payload.map((e: any, idx: number) => (
                            <div key={idx} className="flex justify-between gap-4">
                              <span style={{ color: e.color }}>{e.dataKey}:</span>
                              <span className="font-bold text-[var(--text-primary)]">
                                {isLiteracy ? `${e.value} pts` : `₹${fmtNum(e.value)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />

                  {/* Non-Program Baseline Line */}
                  <Line
                    type="monotone"
                    dataKey="Control_Benchmark"
                    name="Local Average (No Program)"
                    stroke="#8C857B"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />

                  {/* Partner A */}
                  <Line
                    type="monotone"
                    dataKey={partnerA.ngoName}
                    stroke="#0B4A7D"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0B4A7D' }}
                  />

                  {/* Partner B */}
                  <Line
                    type="monotone"
                    dataKey={partnerB.ngoName}
                    stroke="#B5532A"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#B5532A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between text-xs text-[var(--text-muted)] pt-1 tabular-nums">
              <span>{partnerA.ngoName}: {isLiteracy ? `${partnerA.baselineVal} → ${partnerA.m12Val} pts (+${partnerA.m12Val - partnerA.baselineVal})` : `₹${partnerA.baselineVal} → ₹${partnerA.m12Val} (+₹${partnerA.m12Val - partnerA.baselineVal})`}</span>
              <span>{partnerB.ngoName}: {isLiteracy ? `${partnerB.baselineVal} → ${partnerB.m12Val} pts (+${partnerB.m12Val - partnerB.baselineVal})` : `₹${partnerB.baselineVal} → ₹${partnerB.m12Val} (+₹${partnerB.m12Val - partnerB.baselineVal})`}</span>
            </div>
          </div>

          {/* Visual 5: Where Every ₹100 of Grant Goes (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 space-y-4">
            <div>
              <h3 className="font-narrative text-lg font-normal text-[var(--text-primary)]">
                Where Every ₹100 of Grant Goes
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Statutory grant rupee breakdown into direct training, field staff, admin overhead, and drop-out leakage.
              </p>
            </div>

            {/* Stacked Proportional Bars */}
            <div className="space-y-4 pt-1">
              {/* Partner A Anatomy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#0B4A7D]">{partnerA.ngoName}</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{fmtINR(partnerA.grantDisbursed)} Total</span>
                </div>
                {/* 100% Stacked Bar */}
                <div className="h-5 rounded-lg overflow-hidden flex text-[10px] tabular-nums text-white font-bold">
                  <div style={{ width: `${partnerA.grantAnatomy.directTraining}%` }} className="bg-[#0B4A7D] flex items-center justify-center" title="Direct Training & Toolkits">
                    ₹{partnerA.grantAnatomy.directTraining}
                  </div>
                  <div style={{ width: `${partnerA.grantAnatomy.fieldMentorship}%` }} className="bg-[#2E6B4E] flex items-center justify-center" title="Field Staff & Mentors">
                    ₹{partnerA.grantAnatomy.fieldMentorship}
                  </div>
                  <div style={{ width: `${partnerA.grantAnatomy.adminOverhead}%` }} className="bg-[#A86414] flex items-center justify-center" title="Admin Overhead">
                    ₹{partnerA.grantAnatomy.adminOverhead}
                  </div>
                  <div style={{ width: `${partnerA.grantAnatomy.dropoutLeakage}%` }} className="bg-[#B42318] flex items-center justify-center" title="Drop-out Leakage">
                    ₹{partnerA.grantAnatomy.dropoutLeakage}
                  </div>
                </div>
              </div>

              {/* Partner B Anatomy */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#B5532A]">{partnerB.ngoName}</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{fmtINR(partnerB.grantDisbursed)} Total</span>
                </div>
                {/* 100% Stacked Bar */}
                <div className="h-5 rounded-lg overflow-hidden flex text-[10px] tabular-nums text-white font-bold">
                  <div style={{ width: `${partnerB.grantAnatomy.directTraining}%` }} className="bg-[#B5532A] flex items-center justify-center" title="Direct Training & Toolkits">
                    ₹{partnerB.grantAnatomy.directTraining}
                  </div>
                  <div style={{ width: `${partnerB.grantAnatomy.fieldMentorship}%` }} className="bg-[#D97746] flex items-center justify-center" title="Field Staff & Mentors">
                    ₹{partnerB.grantAnatomy.fieldMentorship}
                  </div>
                  <div style={{ width: `${partnerB.grantAnatomy.adminOverhead}%` }} className="bg-[#A86414] flex items-center justify-center" title="Admin Overhead">
                    ₹{partnerB.grantAnatomy.adminOverhead}
                  </div>
                  <div style={{ width: `${partnerB.grantAnatomy.dropoutLeakage}%` }} className="bg-[#B42318] flex items-center justify-center" title="Drop-out Leakage">
                    ₹{partnerB.grantAnatomy.dropoutLeakage}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-[var(--border-hairline)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0B4A7D]" />
                <span className="text-[var(--text-secondary)]">Direct Toolkits/Primers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2E6B4E]" />
                <span className="text-[var(--text-secondary)]">Field Mentors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#A86414]" />
                <span className="text-[var(--text-secondary)]">Admin Overhead</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#B42318]" />
                <span className="text-[var(--text-secondary)]">Drop-out Leakage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ACT 5: GRANULAR PROOF — BATCH CONSISTENCY & FIELD AUDITS ─── */}
      <section className="space-y-6 pt-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
            04 · Consistency &amp; Ground-Truth Proof
          </span>
          <div className="h-px bg-[var(--border-hairline)] flex-1" />
        </div>

        <div>
          <h2 className="font-narrative text-2xl font-normal text-[var(--text-primary)]">
            Granular Proof: Batch Consistency &amp; Field Audits
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Proving results are repeatable across every quarterly cohort and backed by GPS, phone callbacks, and transaction proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Visual 6 — Batch-by-Batch Reliability Strip (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 space-y-4">
            <h3 className="font-narrative text-lg font-normal text-[var(--text-primary)]">
              Quarterly Batch Reliability Strip
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Did all 4 quarterly batches perform reliably, or did one unrepresentative batch distort the yearly average?
            </p>

            <div className="space-y-3 pt-2">
              {/* Partner A Batches */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#0B4A7D]">{partnerA.ngoName} ({partnerA.district})</span>
                <div className="grid grid-cols-4 gap-2">
                  {partnerA.quarterlyReliability.map(q => (
                    <div key={q.quarter} className="p-2.5 rounded-lg bg-[var(--surface-raised)] text-center text-xs">
                      <span className="text-[10px] text-[var(--text-muted)] block font-medium">{q.quarter} Batch</span>
                      <span className="font-bold text-[#2E6B4E] tabular-nums text-sm">+{q.liftPct}%</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">{q.completionPct}% pass</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partner B Batches */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-[#B5532A]">{partnerB.ngoName} ({partnerB.district})</span>
                <div className="grid grid-cols-4 gap-2">
                  {partnerB.quarterlyReliability.map(q => (
                    <div key={q.quarter} className="p-2.5 rounded-lg bg-[var(--surface-raised)] text-center text-xs">
                      <span className="text-[10px] text-[var(--text-muted)] block font-medium">{q.quarter} Batch</span>
                      <span className="font-bold text-[#2E6B4E] tabular-nums text-sm">+{q.liftPct}%</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">{q.completionPct}% pass</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
              Both partners demonstrate tight batch-to-batch standard deviation (&lt;2.2 percentage points).
            </p>
          </div>

          {/* Visual 7 — Field Audit Verification Breakdown (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-narrative text-lg font-normal text-[var(--text-primary)]">
                Field Audit Verification Breakdown
              </h3>
              <span className="text-xs font-semibold text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
                Status: {partnerA.auditVerificationChecks.status} ✓
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              3 hard independent verification checks before final CSR Board submission.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              {/* Check 1: GPS Village Geofence */}
              <div className="p-3 rounded-xl bg-[var(--surface-raised)] space-y-1">
                <div className="flex justify-between font-semibold text-[var(--text-primary)] tabular-nums">
                  <span>1. GPS Location Match</span>
                  <span><span className="text-[#0B4A7D]">{partnerA.auditVerificationChecks.gpsGeofence}%</span> vs <span className="text-[#B5532A]">{partnerB.auditVerificationChecks.gpsGeofence}%</span></span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Verifies that field officer tablets recorded surveys from within the beneficiary's registered village coordinates.
                </p>
              </div>

              {/* Check 2: Random 5% Phone Callback */}
              <div className="p-3 rounded-xl bg-[var(--surface-raised)] space-y-1">
                <div className="flex justify-between font-semibold text-[var(--text-primary)] tabular-nums">
                  <span>2. Random Phone Callback Verified</span>
                  <span><span className="text-[#0B4A7D]">{partnerA.auditVerificationChecks.ivrCallback}%</span> vs <span className="text-[#B5532A]">{partnerB.auditVerificationChecks.ivrCallback}%</span></span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Independent third-party telephonic spot-checks confirming course completion and actual reported metrics.
                </p>
              </div>

              {/* Check 3: UPI / Bank Proof */}
              <div className="p-3 rounded-xl bg-[var(--surface-raised)] space-y-1">
                <div className="flex justify-between font-semibold text-[var(--text-primary)] tabular-nums">
                  <span>3. UPI / Bank Proof Checked</span>
                  <span><span className="text-[#0B4A7D]">{partnerA.auditVerificationChecks.upiProof}%</span> vs <span className="text-[#B5532A]">{partnerB.auditVerificationChecks.upiProof}%</span></span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Direct digital transaction ledger or stamped bank passbook proof of income generation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ACT 2: 05 · CAPITAL ALLOCATION SIMULATOR ─── */}
      <section
        id="capital-simulator"
        className="space-y-6 pt-14 border-t border-[var(--border-hairline)] scroll-mt-36"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)] block mb-1">
              05 · Capital Allocation Simulator
            </span>
            <h2 className="font-narrative text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
              Next-Cycle Budget Rebalancing: Micro-Skilling (₹28.0 Cr Cap)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              Model how shifting capital across the 4 Micro-Skilling partners expands cohort graduation, household income creation, and total portfolio SROI under a fixed statutory capital envelope.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAllocation}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              Reset Baseline
            </button>
            <button
              type="button"
              onClick={handleSaveDraftAllocation}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-[#0B4A7D] text-white hover:bg-[#083A63] transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Save Draft FY26 Allocation</span>
            </button>
          </div>
        </div>

        {/* Budget Envelope Status Indicator */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          simMath.isBalanced ? 'bg-[#E8F3EC] border-[#2E6B4E]/30' : 'bg-[#FDF4E3] border-[#A86414]/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${simMath.isBalanced ? 'bg-[#2E6B4E]' : 'bg-[#A86414] animate-pulse'}`} />
            <div>
              <div className="text-xs font-semibold text-[#181D24] flex items-center gap-2">
                <span>Total Portfolio Envelope:</span>
                <span className="text-sm font-bold tabular-nums">₹{simMath.totalCr.toFixed(1)} Cr</span>
                <span className="text-[#646058] font-normal">/ ₹28.0 Cr target</span>
              </div>
              <p className="text-[11px] text-[#646058]">
                {simMath.isBalanced
                  ? 'Budget is perfectly balanced to the ₹28.0 Cr statutory micro-skilling allocation.'
                  : simMath.deltaBudget > 0
                  ? `Over budget by ₹${simMath.deltaBudget} Cr. Rebalance sliders or use auto-balance.`
                  : `Under budget by ₹${Math.abs(simMath.deltaBudget)} Cr. Additional capital available to allocate.`}
              </p>
            </div>
          </div>

          {!simMath.isBalanced && (
            <button
              type="button"
              onClick={handleAutoBalance}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#181D24] text-white hover:bg-[#333] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Auto-Balance to ₹28.0 Cr</span>
            </button>
          )}
        </div>

        {/* 3 Projected Outcome Delta Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Projected Sustained Graduates */}
          <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Projected Sustained Graduates
              </span>
              <span className={`text-xs font-bold tabular-nums ${simMath.deltaGrads >= 0 ? 'text-[#2E6B4E]' : 'text-[#B42318]'}`}>
                {simMath.deltaGrads >= 0 ? `+${simMath.deltaGrads.toLocaleString('en-IN')}` : simMath.deltaGrads.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="font-sans font-semibold text-3xl text-[var(--text-primary)] tabular-nums">
              <AnimatedNumber value={simMath.totalGrads} />{' '}
              <span className="text-xs font-normal text-[var(--text-secondary)]">women</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Based on verified cost per 6-month enterprise survival (Baseline: {simMath.baselineGrads.toLocaleString('en-IN')} graduates).
            </p>
          </div>

          {/* Card 2: Annual Household Income Lift */}
          <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Annual Household Income Created
              </span>
              <span className={`text-xs font-bold tabular-nums ${simMath.deltaAnnualIncomeCr >= 0 ? 'text-[#2E6B4E]' : 'text-[#B42318]'}`}>
                {simMath.deltaAnnualIncomeCr >= 0 ? `+₹${simMath.deltaAnnualIncomeCr} Cr` : `-₹${Math.abs(simMath.deltaAnnualIncomeCr)} Cr`}/yr
              </span>
            </div>
            <div className="font-sans font-semibold text-3xl text-[var(--text-primary)] tabular-nums">
              <AnimatedNumber value={simMath.totalAnnualIncomeCr} decimals={1} prefix="₹" />{' '}
              <span className="text-xs font-normal text-[var(--text-secondary)]">Cr / year</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Cumulative recurring net earnings lift across all graduate households.
            </p>
          </div>

          {/* Card 3: Portfolio Return per ₹1 */}
          <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Portfolio SROI
              </span>
              <span className={`text-xs font-bold tabular-nums ${simMath.sroiLiftPct >= 0 ? 'text-[#2E6B4E]' : 'text-[#B42318]'}`}>
                {simMath.sroiLiftPct >= 0 ? `+${simMath.sroiLiftPct}%` : `${simMath.sroiLiftPct}%`} efficiency
              </span>
            </div>
            <div className="font-sans font-semibold text-3xl text-[var(--text-primary)] tabular-nums">
              <AnimatedNumber value={simMath.newSroi} decimals={2} prefix="₹" />{' '}
              <span className="text-xs font-normal text-[var(--text-secondary)]">per ₹1 disbursed</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              3-year blended economic value return per ₹1 grant invested (Baseline: ₹{simMath.baselineSroi.toFixed(2)}).
            </p>
          </div>
        </div>

        {/* 4 Interactive Partner Reallocation Sliders */}
        <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-hairline)] p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
            <div>
              <h3 className="font-narrative text-lg font-medium text-[var(--text-primary)]">
                Partner Budget Reallocation Levers
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Drag sliders to simulate shifting crores across NGO partners for FY 2025–26.
              </p>
            </div>
            <span className="text-xs text-[var(--text-muted)]">4 Active Micro-Skilling NGOs</span>
          </div>

          <div className="space-y-6 pt-2">
            {/* 1. Pratham Foundation */}
            <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-hairline)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0B4A7D]" />
                    <span className="font-semibold text-xs text-[var(--text-primary)]">Pratham Foundation</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Pune & Peri-Urban Cluster</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    ₹{simMath.pNgo.costPerOutcome.toLocaleString('en-IN')} / outcome · +₹{simMath.pNgo.extraMonthlyIncome.toLocaleString('en-IN')} monthly earnings lift · ₹{simMath.pNgo.sroiMultiplier.toFixed(2)} SROI / ₹1 · {simMath.pNgo.auditIntegrityScore}/100 audit score
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-[#0B4A7D] tabular-nums">
                    ₹{(simAllocations.pratham ?? 8.2).toFixed(1)} Cr
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                    ({simMath.pGrads.toLocaleString('en-IN')} grads)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-10">₹2.0 Cr</span>
                <input
                  type="range"
                  min="2.0"
                  max="14.0"
                  step="0.1"
                  value={simAllocations.pratham ?? 8.2}
                  onChange={(e) => setSimAllocations(prev => ({ ...prev, pratham: Number(e.target.value) }))}
                  className="flex-1 accent-[#0B4A7D] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-12 text-right">₹14.0 Cr</span>
              </div>
            </div>

            {/* 2. Smile Foundation */}
            <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-hairline)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B5532A]" />
                    <span className="font-semibold text-xs text-[var(--text-primary)]">Smile Foundation</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Tamil Nadu (Coimbatore & Salem)</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    ₹{simMath.sNgo.costPerOutcome.toLocaleString('en-IN')} / outcome · +₹{simMath.sNgo.extraMonthlyIncome.toLocaleString('en-IN')} monthly earnings lift · ₹{simMath.sNgo.sroiMultiplier.toFixed(2)} SROI / ₹1 · {simMath.sNgo.auditIntegrityScore}/100 audit score
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-[#B5532A] tabular-nums">
                    ₹{(simAllocations.smile ?? 9.0).toFixed(1)} Cr
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                    ({simMath.sGrads.toLocaleString('en-IN')} grads)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-10">₹2.0 Cr</span>
                <input
                  type="range"
                  min="2.0"
                  max="14.0"
                  step="0.1"
                  value={simAllocations.smile ?? 9.0}
                  onChange={(e) => setSimAllocations(prev => ({ ...prev, smile: Number(e.target.value) }))}
                  className="flex-1 accent-[#B5532A] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-12 text-right">₹14.0 Cr</span>
              </div>
            </div>

            {/* 3. Goonj */}
            <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-hairline)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E6B4E]" />
                    <span className="font-semibold text-xs text-[var(--text-primary)]">Goonj</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Madhya Pradesh (Tribal Craft Clusters)</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    ₹{simMath.gNgo.costPerOutcome.toLocaleString('en-IN')} / outcome · +₹{simMath.gNgo.extraMonthlyIncome.toLocaleString('en-IN')} monthly earnings lift · ₹{simMath.gNgo.sroiMultiplier.toFixed(2)} SROI / ₹1 · {simMath.gNgo.auditIntegrityScore}/100 audit score
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-[#2E6B4E] tabular-nums">
                    ₹{(simAllocations.goonj ?? 4.8).toFixed(1)} Cr
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                    ({simMath.gGrads.toLocaleString('en-IN')} grads)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-10">₹1.0 Cr</span>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.1"
                  value={simAllocations.goonj ?? 4.8}
                  onChange={(e) => setSimAllocations(prev => ({ ...prev, goonj: Number(e.target.value) }))}
                  className="flex-1 accent-[#2E6B4E] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-12 text-right">₹10.0 Cr</span>
              </div>
            </div>

            {/* 4. Magic Bus */}
            <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-hairline)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B42318]" />
                    <span className="font-semibold text-xs text-[var(--text-primary)]">Magic Bus</span>
                    <span className="text-[10px] text-[#B42318] font-semibold">Thane Cluster (Audit Caution 74/100)</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    ₹{simMath.mNgo.costPerOutcome.toLocaleString('en-IN')} / outcome · +₹{simMath.mNgo.extraMonthlyIncome.toLocaleString('en-IN')} monthly earnings lift · ₹{simMath.mNgo.sroiMultiplier.toFixed(2)} SROI / ₹1 · {simMath.mNgo.auditIntegrityScore}/100 audit score
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-[#B42318] tabular-nums">
                    ₹{(simAllocations['magic-bus'] ?? 6.0).toFixed(1)} Cr
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                    ({simMath.mGrads.toLocaleString('en-IN')} grads)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-10">₹0.0 Cr</span>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.1"
                  value={simAllocations['magic-bus'] ?? 6.0}
                  onChange={(e) => setSimAllocations(prev => ({ ...prev, 'magic-bus': Number(e.target.value) }))}
                  className="flex-1 accent-[#B42318] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-12 text-right">₹10.0 Cr</span>
              </div>
            </div>
          </div>

          {/* Strategic Takeaway / Boardroom Synthesis */}
          <div className="p-4 rounded-xl bg-[#E7F0F7] border border-[#0B4A7D]/20 text-xs text-[#181D24] space-y-1">
            <span className="font-semibold text-[#0B4A7D] block text-[11px] uppercase tracking-wider">
              Governance & Capital Efficiency Recommendation
            </span>
            <p className="text-[11px] text-[#646058] leading-relaxed">
              Every ₹1.0 Cr reallocated from lower-efficiency partners (Magic Bus at ₹20,000/outcome) to top-performing partners (Pratham at ₹14,909/outcome) generates approximately +171 additional sustained women entrepreneurs and +₹32.5 L/yr in permanent household income lift within the same statutory CSR budget.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
