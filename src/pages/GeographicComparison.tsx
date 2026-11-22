import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
  Shield,
  ChevronRight,
  Lock,
  DollarSign,
} from 'lucide-react';
import {
  useImpactStore,
  type ProgramType,
  type OperationalCentre,
  type ServiceGapBlock,
} from '../data/impactStore';
import { SpatialMap, type MapDisplayLayer } from '../components/SpatialMap';

interface GeographicComparisonProps {
  onNavigate?: (screenId: string) => void;
}

// Representative individual beneficiary record for Level 5 DPDP 360° Drawer
interface Beneficiary360Record {
  id: string;
  maskedToken: string;
  nameMasked: string;
  district: string;
  centreName: string;
  ngoName: string;
  program: string;
  age: number;
  familySize: number;
  enrolledDate: string;
  attendancePct: number;
  gpsGeofencePassPct: number;
  baselineIncome: number;
  currentIncome: number;
  liftPct: number;
  milestones: { name: string; completed: boolean; date?: string }[];
  percentiles: {
    withinCentre: number;
    withinDistrict: number;
    withinPortfolio: number;
  };
  auditRecord: {
    auditSampleId: string;
    verifiedBy: string;
    verifiedDate: string;
    consentRef: string;
  };
}

const SAMPLE_BENEFICIARIES: Record<string, Beneficiary360Record[]> = {
  pune: [
    {
      id: 'BEN-PUN-01',
      maskedToken: 'XXXX-XXXX-8412',
      nameMasked: 'Sunita P**** [Token: MH-PUN-08412]',
      district: 'Pune',
      centreName: 'Hadapsar Ward 18 Micro-Hub',
      ngoName: 'Pratham Foundation',
      program: 'Micro-Skilling & Enterprise',
      age: 32,
      familySize: 4,
      enrolledDate: '15 Mar 2024',
      attendancePct: 96.4,
      gpsGeofencePassPct: 98.4,
      baselineIncome: 4200,
      currentIncome: 7650,
      liftPct: 82.1,
      milestones: [
        { name: 'Financial Literacy & UPI Induction', completed: true, date: '02 Apr 2024' },
        { name: 'Micro-Culinary & Packaging Certification', completed: true, date: '28 May 2024' },
        { name: 'Seed Capital & Merchant QR Disbursal', completed: true, date: '14 Jun 2024' },
        { name: 'Sustained Revenue > ₹6,000/mo (30-day proof)', completed: true, date: '10 Aug 2024' },
      ],
      percentiles: {
        withinCentre: 78,
        withinDistrict: 82,
        withinPortfolio: 80,
      },
      auditRecord: {
        auditSampleId: 'AUD-2024-Q3-094',
        verifiedBy: 'KPMG Concurrent Audit Cell',
        verifiedDate: '18 Aug 2024',
        consentRef: 'DPDP-MH-2024-9912',
      },
    },
    {
      id: 'BEN-PUN-02',
      maskedToken: 'XXXX-XXXX-9143',
      nameMasked: 'Amina S**** [Token: MH-PUN-09143]',
      district: 'Pune',
      centreName: 'Hadapsar Ward 18 Micro-Hub',
      ngoName: 'Pratham Foundation',
      program: 'Micro-Skilling & Enterprise',
      age: 28,
      familySize: 5,
      enrolledDate: '15 Mar 2024',
      attendancePct: 94.0,
      gpsGeofencePassPct: 97.2,
      baselineIncome: 3800,
      currentIncome: 7200,
      liftPct: 89.5,
      milestones: [
        { name: 'Financial Literacy & UPI Induction', completed: true, date: '02 Apr 2024' },
        { name: 'Apparel Tailoring & Quality Stitching', completed: true, date: '25 May 2024' },
        { name: 'Seed Capital & Sewing Machine Grant', completed: true, date: '16 Jun 2024' },
        { name: 'Commercial Vendor Linkage (Pune Market)', completed: true, date: '22 Aug 2024' },
      ],
      percentiles: {
        withinCentre: 74,
        withinDistrict: 79,
        withinPortfolio: 77,
      },
      auditRecord: {
        auditSampleId: 'AUD-2024-Q3-097',
        verifiedBy: 'KPMG Concurrent Audit Cell',
        verifiedDate: '18 Aug 2024',
        consentRef: 'DPDP-MH-2024-9925',
      },
    },
    {
      id: 'BEN-PUN-03',
      maskedToken: 'XXXX-XXXX-3301',
      nameMasked: 'Kavita D**** [Token: MH-PUN-03301]',
      district: 'Pune',
      centreName: 'Baramati Cluster Hub',
      ngoName: 'Smile Foundation (Pune Rural)',
      program: 'Rural Skilling & Micro-Agri',
      age: 35,
      familySize: 4,
      enrolledDate: '01 Apr 2024',
      attendancePct: 91.8,
      gpsGeofencePassPct: 94.5,
      baselineIncome: 4500,
      currentIncome: 7400,
      liftPct: 64.4,
      milestones: [
        { name: 'Organic Poultry & Dairy Feed Modules', completed: true, date: '20 Apr 2024' },
        { name: 'Self-Help Group Bookkeeping Audit', completed: true, date: '10 Jun 2024' },
        { name: 'Cold-Chain Co-operative Linkage', completed: true, date: '05 Jul 2024' },
        { name: 'First Formal Producer Payment Received', completed: true, date: '12 Aug 2024' },
      ],
      percentiles: {
        withinCentre: 69,
        withinDistrict: 72,
        withinPortfolio: 73,
      },
      auditRecord: {
        auditSampleId: 'AUD-2024-Q3-112',
        verifiedBy: 'PwC Independent Verifier',
        verifiedDate: '24 Aug 2024',
        consentRef: 'DPDP-MH-2024-1048',
      },
    },
  ],
  default: [
    {
      id: 'BEN-DEF-01',
      maskedToken: 'XXXX-XXXX-5521',
      nameMasked: 'Radha M**** [Token: ID-DEF-05521]',
      district: 'Regional Cohort',
      centreName: 'Core District Operational Centre',
      ngoName: 'Bajaj CSR Partner Network',
      program: 'Women Empowerment & Skilling',
      age: 30,
      familySize: 4,
      enrolledDate: '10 Feb 2024',
      attendancePct: 93.5,
      gpsGeofencePassPct: 96.8,
      baselineIncome: 4100,
      currentIncome: 7150,
      liftPct: 74.4,
      milestones: [
        { name: 'Baseline Skills Assessment', completed: true, date: '20 Feb 2024' },
        { name: 'Core Vocational Mastery Module', completed: true, date: '15 Apr 2024' },
        { name: 'Market-Ready Certification', completed: true, date: '30 May 2024' },
        { name: 'Post-Training Revenue Milestone', completed: true, date: '15 Jul 2024' },
      ],
      percentiles: {
        withinCentre: 72,
        withinDistrict: 75,
        withinPortfolio: 76,
      },
      auditRecord: {
        auditSampleId: 'AUD-2024-Q3-008',
        verifiedBy: 'Concurrent Audit Team',
        verifiedDate: '01 Aug 2024',
        consentRef: 'DPDP-ACT-2024-7741',
      },
    },
  ],
};

export const GeographicComparison: React.FC<GeographicComparisonProps> = ({ onNavigate }) => {
  const {
    districtAllocations,
    operationalCentres,
    serviceGapBlocks,
    stateRollups,
    portfolioBenchmarks,
    earmarkReserveForGap,
    portfolio,
  } = useImpactStore();

  // Navigation & Drilldown State (5 Levels)
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<OperationalCentre | null>(null);
  const [inspectingBeneficiary, setInspectingBeneficiary] = useState<Beneficiary360Record | null>(null);

  // Filters & Map Display Layer
  const [activeLayer, setActiveLayer] = useState<MapDisplayLayer>('outcomes');
  const [programFilter, setProgramFilter] = useState<'all' | ProgramType>('all');
  const [formulaOpen, setFormulaOpen] = useState<boolean>(false);
  const [reserveToast, setReserveToast] = useState<string | null>(null);

  // Escape key listener for dismissing Level 5 Beneficiary Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectingBeneficiary) setInspectingBeneficiary(null);
        else if (formulaOpen) setFormulaOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingBeneficiary, formulaOpen]);

  // Active district allocations matching current filter
  const filteredAllocations = useMemo(() => {
    return districtAllocations.filter((alloc) => {
      const matchProgram = programFilter === 'all' || alloc.program === programFilter;
      const matchState = !selectedState || alloc.state === selectedState;
      const matchDistrict = !selectedDistrictId || alloc.districtKey === selectedDistrictId;
      return matchProgram && matchState && matchDistrict;
    });
  }, [districtAllocations, programFilter, selectedState, selectedDistrictId]);

  // Current district details when selected
  const activeDistrictAllocations = useMemo(() => {
    if (!selectedDistrictId) return [];
    return districtAllocations.filter((a) => a.districtKey === selectedDistrictId);
  }, [districtAllocations, selectedDistrictId]);

  const activeDistrictSummary = useMemo(() => {
    if (!selectedDistrictId || activeDistrictAllocations.length === 0) return null;
    const first = activeDistrictAllocations[0];
    const totalWomen = activeDistrictAllocations.reduce((sum, a) => sum + a.women, 0);
    const totalDisbursedCr = activeDistrictAllocations.reduce((sum, a) => sum + a.grantDisbursed, 0) / 10000000;
    const weightedImpact = totalWomen > 0
      ? activeDistrictAllocations.reduce((sum, a) => sum + a.impactIndex * a.women, 0) / totalWomen
      : 0;

    return {
      name: first.district,
      districtKey: first.districtKey,
      state: first.state,
      tier: first.tier,
      totalWomen,
      totalDisbursedCr,
      weightedImpact: Math.round(weightedImpact * 10) / 10,
      ngos: activeDistrictAllocations,
    };
  }, [selectedDistrictId, activeDistrictAllocations]);

  // Service gap blocks for current district
  const districtServiceGaps = useMemo(() => {
    if (!selectedDistrictId) return [];
    return serviceGapBlocks.filter((b) => b.districtKey === selectedDistrictId);
  }, [serviceGapBlocks, selectedDistrictId]);

  // Operational centres for current district or NGO
  const activeCentres = useMemo(() => {
    if (!selectedDistrictId) return [];
    return operationalCentres.filter((c) => {
      const matchDist = c.district.toLowerCase() === selectedDistrictId.toLowerCase();
      const matchNgo = !selectedNgoId || c.ngoId === selectedNgoId;
      return matchDist && matchNgo;
    });
  }, [operationalCentres, selectedDistrictId, selectedNgoId]);

  // Handle reserve earmarking with notification toast
  const handleEarmark = (block: ServiceGapBlock) => {
    earmarkReserveForGap(block.id, block.recommendedAllocationCr);
    setReserveToast(`Committed ₹${block.recommendedAllocationCr.toFixed(2)} Cr from Bajaj Corpus Reserve to ${block.name}`);
    setTimeout(() => setReserveToast(null), 4000);
  };

  // Breadcrumb segment handler
  const handleBreadcrumbClick = (level: number) => {
    if (level === 1) {
      setSelectedState(null);
      setSelectedDistrictId(null);
      setSelectedNgoId(null);
      setSelectedCentre(null);
      setInspectingBeneficiary(null);
    } else if (level === 2) {
      setSelectedDistrictId(null);
      setSelectedNgoId(null);
      setSelectedCentre(null);
      setInspectingBeneficiary(null);
    } else if (level === 3) {
      setSelectedNgoId(null);
      setSelectedCentre(null);
      setInspectingBeneficiary(null);
    } else if (level === 4) {
      setSelectedCentre(null);
      setInspectingBeneficiary(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {reserveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-[#2E6B4E] text-white shadow-xl flex items-center gap-3 text-xs max-w-md border border-white/20"
          >
            <CheckCircle2 size={18} className="flex-shrink-0 text-[#B4E3C6]" />
            <div className="space-y-0.5">
              <span className="font-bold block">Corpus Reserve Earmarked</span>
              <p className="text-white/90 text-[11px]">{reserveToast}</p>
            </div>
            <button
              type="button"
              onClick={() => setReserveToast(null)}
              className="ml-auto p-1 text-white/80 hover:text-white"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER & BREADCRUMBS ── */}
      <div className="space-y-3">
        {/* Dynamic 5-Level Breadcrumb Bar */}
        <nav
          aria-label="Spatial Drilldown Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-[#6B655C] bg-[#FCFBF8] border border-[#E5DFD3] px-3.5 py-2 rounded-xl shadow-2xs"
        >
          <button
            type="button"
            onClick={() => handleBreadcrumbClick(1)}
            className={`font-semibold transition-colors hover:text-[#0B4A7D] cursor-pointer ${
              !selectedState && !selectedDistrictId ? 'text-[#0B4A7D]' : 'text-[#6B655C]'
            }`}
          >
            All States (3)
          </button>

          {selectedState && (
            <>
              <ChevronRight size={13} className="text-[#8C8479]" />
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(2)}
                className={`transition-colors hover:text-[#0B4A7D] cursor-pointer ${
                  !selectedDistrictId ? 'font-semibold text-[#0B4A7D]' : 'text-[#6B655C]'
                }`}
              >
                {selectedState}
              </button>
            </>
          )}

          {selectedDistrictId && (
            <>
              <ChevronRight size={13} className="text-[#8C8479]" />
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(3)}
                className={`capitalize transition-colors hover:text-[#0B4A7D] cursor-pointer ${
                  !selectedNgoId ? 'font-semibold text-[#0B4A7D]' : 'text-[#6B655C]'
                }`}
              >
                {selectedDistrictId} District
              </button>
            </>
          )}

          {selectedNgoId && (
            <>
              <ChevronRight size={13} className="text-[#8C8479]" />
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(4)}
                className={`transition-colors hover:text-[#0B4A7D] cursor-pointer ${
                  !selectedCentre ? 'font-semibold text-[#0B4A7D]' : 'text-[#6B655C]'
                }`}
              >
                {districtAllocations.find((a) => a.ngoId === selectedNgoId)?.ngoName || selectedNgoId}
              </button>
            </>
          )}

          {selectedCentre && (
            <>
              <ChevronRight size={13} className="text-[#8C8479]" />
              <span className="font-semibold text-[#0B4A7D] truncate max-w-[200px]">
                {selectedCentre.name}
              </span>
            </>
          )}
        </nav>

        {/* Title, Subtitle & Interactive Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-narrative text-2xl font-bold text-[#1C1917] tracking-tight">
                Geographic Footprint &amp; Spatial Impact
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7F0F7] text-[#0B4A7D] border border-[#0B4A7D]/20">
                5-Level Spatial Explorer
              </span>
            </div>
            <p className="text-xs text-[#6B655C] mt-0.5">
              Explore localized performance across 3 operating states, 6 canonical districts, 20 operational centres, and 42,850 enrolled women.
            </p>
          </div>

          {/* Controls: Program Filter, Layer Switcher, Formula Popover */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Program Filter Pills */}
            <div className="flex items-center bg-[#FCFBF8] border border-[#E5DFD3] rounded-xl p-0.5 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setProgramFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  programFilter === 'all'
                    ? 'bg-[#0B4A7D] text-white shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1C1917]'
                }`}
              >
                All Programs
              </button>
              <button
                type="button"
                onClick={() => setProgramFilter('micro-skilling')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  programFilter === 'micro-skilling'
                    ? 'bg-[#0B4A7D] text-white shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1C1917]'
                }`}
              >
                Micro-Skilling
              </button>
              <button
                type="button"
                onClick={() => setProgramFilter('literacy')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  programFilter === 'literacy'
                    ? 'bg-[#0B4A7D] text-white shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1C1917]'
                }`}
              >
                Women's Literacy
              </button>
            </div>

            {/* Layer Switcher Pills */}
            <div className="flex items-center bg-[#FCFBF8] border border-[#E5DFD3] rounded-xl p-0.5 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveLayer('outcomes')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  activeLayer === 'outcomes'
                    ? 'bg-[#2E6B4E] text-white shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1C1917]'
                }`}
                title="Outcome Index Layer (Composite Quality)"
              >
                <TrendingUp size={12} />
                <span>Outcomes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayer('cost_efficiency')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  activeLayer === 'cost_efficiency'
                    ? 'bg-[#0B4A7D] text-white shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1C1917]'
                }`}
                title="Cost per Outcome & SROI Multiplier"
              >
                <DollarSign size={12} />
                <span>Cost / SROI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLayer('service_gaps')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  activeLayer === 'service_gaps'
                    ? 'bg-[#B5532A] text-white shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1C1917]'
                }`}
                title="Service Gaps & Unallocated Blocks"
              >
                <AlertTriangle size={12} />
                <span>Service Gaps</span>
              </button>
            </div>

            {/* Formula Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFormulaOpen(!formulaOpen)}
                className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                  formulaOpen
                    ? 'bg-[#0B4A7D] text-white border-[#0B4A7D]'
                    : 'bg-[#FCFBF8] text-[#6B655C] border-[#E5DFD3] hover:text-[#1C1917]'
                }`}
                title="Impact Index Formula"
              >
                <Info size={14} />
                <span className="hidden sm:inline">Formula</span>
              </button>

              {formulaOpen && (
                <div className="absolute right-0 top-9 z-30 w-80 p-4 rounded-xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xl text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                    <span className="font-bold text-[#1C1917]">Composite Impact Index (0–100)</span>
                    <button
                      type="button"
                      onClick={() => setFormulaOpen(false)}
                      className="text-[#8C8479] hover:text-[#1C1917]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-[#6B655C] leading-relaxed">
                    Weighted algorithmic score normalizing quantitative gains and governance rigor:
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] font-mono text-[11px] text-[#1C1917] space-y-1">
                    <div>0.40 × Completion Rate (%)</div>
                    <div>+ 0.30 × SROI Multiplier (Norm)</div>
                    <div>+ 0.20 × Audit Integrity Score</div>
                    <div>+ 0.10 × GPS Verification Rate</div>
                  </div>
                  <p className="text-[10px] text-[#8C8479]">
                    Pune District Peer Mean: <strong className="text-[#1C1917]">82.0</strong> · Bajaj Portfolio Benchmark: <strong className="text-[#1C1917]">76.8</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN WORKSPACE: LEFT 58% MAP / RIGHT 42% CONTEXTUAL BENCHMARKING PANEL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: SPATIAL MAP (7 COLUMNS / ~58%) */}
        <div className="lg:col-span-7">
          <div className="sticky top-20">
            <SpatialMap
              selectedDistrictId={selectedDistrictId}
              selectedState={selectedState}
              selectedNgoId={selectedNgoId}
              activeLayer={activeLayer}
              onSelectDistrict={(dist) => {
                setSelectedDistrictId(dist);
                if (dist) {
                  const alloc = districtAllocations.find((a) => a.districtKey === dist);
                  if (alloc) setSelectedState(alloc.state);
                }
                setSelectedNgoId(null);
                setSelectedCentre(null);
              }}
              onSelectState={(st) => {
                setSelectedState(st);
                setSelectedDistrictId(null);
                setSelectedNgoId(null);
                setSelectedCentre(null);
              }}
              onSelectNgo={(ngo) => {
                setSelectedNgoId(ngo);
                setSelectedCentre(null);
              }}
              onSelectCentre={(centre) => {
                setSelectedCentre(centre);
                const alloc = districtAllocations.find((a) => a.district.toLowerCase() === centre.district.toLowerCase());
                if (alloc) {
                  setSelectedDistrictId(alloc.districtKey);
                  setSelectedState(alloc.state);
                }
              }}
              onNavigateToAudit={() => onNavigate?.('operations')}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: CONTEXTUAL BENCHMARKING PANEL (5 COLUMNS / ~42%) */}
        <div className="lg:col-span-5 space-y-4">
          <AnimatePresence mode="wait">
            {/* ── LEVEL 1: ALL INDIA / STATE LEVEL OVERVIEW ── */}
            {!selectedDistrictId && (
              <motion.div
                key="level-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* State Rollups Header Card */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                        Operational Territories
                      </span>
                      <h3 className="font-narrative text-base font-bold text-[#1C1917]">
                        State Portfolio Distribution
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-[#0B4A7D] bg-[#E7F0F7] px-2 py-0.5 rounded-full border border-[#0B4A7D]/20">
                      3 States · 6 Districts
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stateRollups.map((rollup) => {
                      const isSelected = selectedState === rollup.state;
                      return (
                        <div
                          key={rollup.state}
                          onClick={() => setSelectedState(isSelected ? null : rollup.state)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#E7F0F7] border-[#0B4A7D] shadow-xs'
                              : 'bg-[#F7F4ED] border-[#E5DFD3] hover:border-[#0B4A7D]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#1C1917] flex items-center gap-1.5">
                              <MapPin size={13} className={isSelected ? 'text-[#0B4A7D]' : 'text-[#8C8479]'} />
                              <span>{rollup.state}</span>
                            </span>
                            <span className="text-[11px] font-semibold text-[#0B4A7D] tabular-nums">
                              {rollup.women.toLocaleString('en-IN')} women ({rollup.pct}%)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] mt-2 pt-2 border-t border-[#E5DFD3]/60">
                            <div>
                              <span className="text-[#8C8479] block text-[10px]">CORPUS DISBURSED</span>
                              <span className="font-semibold text-[#1C1917]">₹{rollup.grantDisbursedCr.toFixed(1)} Cr</span>
                            </div>
                            <div>
                              <span className="text-[#8C8479] block text-[10px]">ACTIVE DISTRICTS</span>
                              <span className="font-semibold text-[#1C1917] truncate">{rollup.districts.join(', ')}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#6B655C] mt-1.5 line-clamp-1">{rollup.liftDescription}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* District Drill-down List (Click to enter Level 2) */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C1917]">
                      {selectedState ? `${selectedState} Districts` : 'All 6 Operating Districts'}
                    </span>
                    <span className="text-[11px] text-[#8C8479]">Click to view peer comparison</span>
                  </div>

                  <div className="space-y-2">
                    {filteredAllocations.map((alloc) => (
                      <div
                        key={alloc.id}
                        onClick={() => {
                          setSelectedDistrictId(alloc.districtKey);
                          setSelectedState(alloc.state);
                        }}
                        className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] hover:border-[#0B4A7D] hover:bg-[#FCFBF8] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#1C1917] group-hover:text-[#0B4A7D] transition-colors">
                              {alloc.district}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAE6DD] text-[#6B655C]">
                              {alloc.tier}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6B655C] block">
                            {alloc.ngoName} · {alloc.women.toLocaleString('en-IN')} women
                          </span>
                        </div>

                        <div className="text-right flex-shrink-0 flex items-center gap-3">
                          <div>
                            <span className="text-[10px] text-[#8C8479] block">IMPACT INDEX</span>
                            <span className="font-bold text-xs text-[#0B4A7D] tabular-nums">
                              {alloc.impactIndex} / 100
                            </span>
                          </div>
                          <ChevronRight size={14} className="text-[#8C8479] group-hover:text-[#0B4A7D] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── LEVEL 2: DISTRICT LEVEL DRILL-DOWN (e.g. PUNE / THANE) ── */}
            {selectedDistrictId && activeDistrictSummary && (
              <motion.div
                key={`level-2-${selectedDistrictId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* District Overview Card */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs space-y-3">
                  <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#0B4A7D]" />
                        <h2 className="font-narrative text-lg font-bold text-[#1C1917]">
                          {activeDistrictSummary.name} District
                        </h2>
                        <span className="text-[10px] font-semibold text-[#8C8479] bg-[#EAE6DD] px-2 py-0.5 rounded">
                          {activeDistrictSummary.tier}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B655C] mt-0.5">
                        {activeDistrictSummary.state} · {activeDistrictSummary.ngos.length} Partner Organization{activeDistrictSummary.ngos.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDistrictId(null);
                        setSelectedNgoId(null);
                        setSelectedCentre(null);
                      }}
                      className="p-1 rounded-lg text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                      title="Return to All Districts"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* 4 District Stat Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                      <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Total Beneficiaries</span>
                      <span className="text-sm font-bold text-[#1C1917] tabular-nums">
                        {activeDistrictSummary.totalWomen.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                      <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Corpus Disbursed</span>
                      <span className="text-sm font-bold text-[#1C1917] tabular-nums">
                        ₹{activeDistrictSummary.totalDisbursedCr.toFixed(1)} Cr
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                      <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">District Mean Index</span>
                      <span className="text-sm font-bold text-[#0B4A7D] tabular-nums">
                        {activeDistrictSummary.weightedImpact} / 100
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                      <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Portfolio Benchmark</span>
                      <span className="text-sm font-bold text-[#2E6B4E] tabular-nums">
                        {portfolioBenchmarks.portfolioWeightedMean} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── SIDE-BY-SIDE PEER COMPARISON BARS (PUNE PEERS) ── */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                        Controlled Cohort Benchmark
                      </span>
                      <h3 className="font-narrative text-sm font-bold text-[#1C1917]">
                        NGO Peer Performance in {activeDistrictSummary.name}
                      </h3>
                    </div>
                    <span className="text-[10px] text-[#6B655C]">
                      Click NGO to inspect centres
                    </span>
                  </div>

                  {/* Horizontal Bar Chart with Benchmark Lines */}
                  <div className="space-y-4 pt-1">
                    {/* Benchmark Guide Legend */}
                    <div className="flex items-center justify-between text-[10px] px-1 text-[#6B655C] border-b border-[#E5DFD3]/40 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-0.5 bg-[#0B4A7D] inline-block border-t border-dashed border-[#0B4A7D]" />
                        <span>District Cohort Mean ({activeDistrictSummary.weightedImpact})</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-0.5 bg-[#1C1917] inline-block border-t border-dotted border-[#1C1917]" />
                        <span>Portfolio Benchmark ({portfolioBenchmarks.portfolioWeightedMean})</span>
                      </span>
                    </div>

                    {/* NGO Horizontal Bars */}
                    <div className="space-y-3">
                      {activeDistrictAllocations.map((alloc) => {
                        const isSelected = selectedNgoId === alloc.ngoId;
                        const isLeader = alloc.impactIndex >= activeDistrictSummary.weightedImpact;

                        return (
                          <div
                            key={alloc.id}
                            onClick={() => setSelectedNgoId(isSelected ? null : alloc.ngoId)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#E7F0F7] border-[#0B4A7D] shadow-xs'
                                : 'bg-[#F7F4ED] border-[#E5DFD3] hover:border-[#0B4A7D]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                                <span>{alloc.ngoName}</span>
                                {isLeader && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E8F3EC] text-[#2E6B4E] font-semibold">
                                    Cohort Leader
                                  </span>
                                )}
                              </span>
                              <span className="font-bold text-[#0B4A7D] tabular-nums">
                                {alloc.impactIndex} / 100
                              </span>
                            </div>

                            {/* Bar with Marker for Portfolio Benchmark */}
                            <div className="relative w-full h-3 bg-[#E5DFD3] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  alloc.auditStatus === 'flagged'
                                    ? 'bg-[#B42318]'
                                    : alloc.impactIndex >= 80
                                    ? 'bg-[#2E6B4E]'
                                    : 'bg-[#0B4A7D]'
                                }`}
                                style={{ width: `${alloc.impactIndex}%` }}
                              />
                            </div>

                            {/* Sub-metrics */}
                            <div className="grid grid-cols-3 gap-2 text-[10px] text-[#6B655C] mt-2 pt-1 border-t border-[#E5DFD3]/60">
                              <div>
                                <span className="text-[#8C8479] block">BENEFICIARIES</span>
                                <span className="font-semibold text-[#1C1917]">{alloc.women.toLocaleString('en-IN')}</span>
                              </div>
                              <div>
                                <span className="text-[#8C8479] block">SROI RATIO</span>
                                <span className="font-semibold text-[#1C1917]">₹{alloc.sroiMultiplier} : ₹1</span>
                              </div>
                              <div>
                                <span className="text-[#8C8479] block">AUDIT SCORE</span>
                                <span className={`font-semibold ${alloc.auditScore < 85 ? 'text-[#B42318]' : 'text-[#2E6B4E]'}`}>
                                  {alloc.auditScore}/100
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Attribution & Methodology Note */}
                    <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-[11px] text-[#6B655C] leading-relaxed">
                      <p>
                        Calculated across {activeDistrictSummary.totalWomen.toLocaleString('en-IN')} verified beneficiaries in {activeDistrictSummary.name}.
                        {activeDistrictSummary.name === 'Pune' && (
                          <span className="text-[#1C1917] font-medium block mt-0.5">
                            Pratham leads the Pune cohort (+2.2 pts above district mean, +7.4 pts above portfolio benchmark) with ₹3.42 SROI.
                          </span>
                        )}
                        {activeDistrictSummary.name === 'Thane' && (
                          <span className="text-[#B42318] font-medium block mt-0.5">
                            Thane Urban cluster is on audit escrow hold pending verification of 142 GPS anomaly flags in Kalwa Ward.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── SERVICE GAP BLOCKS (INTERACTIVE RESERVE EARMARKING) ── */}
                {districtServiceGaps.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={15} className="text-[#B5532A]" />
                        <h3 className="font-narrative text-sm font-bold text-[#1C1917]">
                          Service Gap Blocks ({districtServiceGaps.length})
                        </h3>
                      </div>
                      <span className="text-[10px] text-[#8C8479]">
                        Reserve: ₹{portfolio.reserveCr.toFixed(2)} Cr
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {districtServiceGaps.map((block) => (
                        <div
                          key={block.id}
                          className="p-3 rounded-xl bg-[#FDF8F5] border border-[#B5532A]/20 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-bold text-xs text-[#1C1917] block">
                                {block.name}
                              </span>
                              <span className="text-[10px] text-[#6B655C]">
                                {block.unservedWomen.toLocaleString('en-IN')} unserved women · 0 Active Centres
                              </span>
                            </div>

                            <span className="text-xs font-bold text-[#B5532A] tabular-nums">
                              ₹{block.recommendedAllocationCr.toFixed(2)} Cr req.
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-[#B5532A]/15">
                            <span className="text-[10px] text-[#8C8479]">
                              {block.status === 'earmarked' ? (
                                <span className="text-[#2E6B4E] font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={12} />
                                  <span>Earmarked on {block.earmarkedDate || 'Today'}</span>
                                </span>
                              ) : (
                                'Awaiting Funder Allocation'
                              )}
                            </span>

                            {block.status === 'unallocated' ? (
                              <button
                                type="button"
                                onClick={() => handleEarmark(block)}
                                className="px-2.5 py-1 rounded-lg bg-[#B5532A] text-white text-[11px] font-semibold hover:bg-[#96401E] transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                              >
                                Earmark from Reserve
                              </button>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-[#E8F3EC] text-[#2E6B4E] text-[10px] font-bold border border-[#2E6B4E]/20">
                                ✓ Committed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── OPERATIONAL CENTRES LIST (LEVEL 3 & 4) ── */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2">
                    <span className="text-xs font-bold text-[#1C1917]">
                      Operational Centres in {activeDistrictSummary.name} ({activeCentres.length})
                    </span>
                    <span className="text-[10px] text-[#8C8479]">
                      Click centre to inspect DPDP records
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeCentres.map((centre) => {
                      const isSelected = selectedCentre?.id === centre.id;
                      return (
                        <div
                          key={centre.id}
                          onClick={() => setSelectedCentre(isSelected ? null : centre)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#E7F0F7] border-[#0B4A7D] shadow-xs'
                              : 'bg-[#F7F4ED] border-[#E5DFD3] hover:border-[#0B4A7D]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                              <MapPin size={13} className={isSelected ? 'text-[#0B4A7D]' : 'text-[#8C8479]'} />
                              <span>{centre.name}</span>
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                centre.status === 'flagged'
                                  ? 'bg-[#FCECEB] text-[#B42318]'
                                  : 'bg-[#E8F3EC] text-[#2E6B4E]'
                              }`}
                            >
                              {centre.status === 'flagged' ? 'Audit Flagged' : 'Active'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[10px] text-[#6B655C] mt-2 pt-1 border-t border-[#E5DFD3]/60">
                            <div>
                              <span className="text-[#8C8479] block">BENEFICIARIES</span>
                              <span className="font-semibold text-[#1C1917]">{centre.beneficiaries} women</span>
                            </div>
                            <div>
                              <span className="text-[#8C8479] block">COMPLETION</span>
                              <span className="font-semibold text-[#1C1917]">{centre.completionPct}%</span>
                            </div>
                            <div>
                              <span className="text-[#8C8479] block">OUTCOME LIFT</span>
                              <span className="font-semibold text-[#2E6B4E]">{centre.outcomeLift}</span>
                            </div>
                          </div>

                          {/* Level 5 Trigger Button if centre is selected */}
                          {isSelected && (
                            <div className="mt-3 pt-2 border-t border-[#0B4A7D]/20 flex items-center justify-between">
                              <span className="text-[10px] text-[#0B4A7D] font-medium flex items-center gap-1">
                                <Lock size={11} />
                                <span>DPDP Privacy Mode</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const pool = SAMPLE_BENEFICIARIES[selectedDistrictId || 'default'] || SAMPLE_BENEFICIARIES.default;
                                  setInspectingBeneficiary(pool[0]);
                                }}
                                className="px-3 py-1 rounded-lg bg-[#0B4A7D] text-white text-[11px] font-semibold hover:bg-[#083A63] transition-transform active:scale-[0.98] flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <span>Inspect Authorized Beneficiaries →</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── BOTTOM SECTION: FULL-WIDTH DISTRICT SUMMARY MATRIX ── */}
      <section className="space-y-3 pt-4 border-t border-[#E5DFD3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-narrative text-lg font-bold text-[#1C1917]">
              District Comparative Summary Matrix
            </h2>
            <p className="text-xs text-[#6B655C]">
              Unified cross-district scorecard reconciling 42,850 women and ₹38.4 Cr deployed corpus.
            </p>
          </div>
          <span className="text-[11px] text-[#8C8479] self-start sm:self-auto">
            Showing 6 of 6 Canonical Districts
          </span>
        </div>

        {/* Desktop High-Density Table */}
        <div className="hidden md:block rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F4ED] border-b border-[#E5DFD3] text-[#8C8479] text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">District &amp; State</th>
                  <th className="py-3 px-3">Operating Partner</th>
                  <th className="py-3 px-3">Program Focus</th>
                  <th className="py-3 px-3 text-right">Beneficiaries</th>
                  <th className="py-3 px-3 text-right">Disbursed (Cr)</th>
                  <th className="py-3 px-3 text-right">Cost / Outcome</th>
                  <th className="py-3 px-3 text-right">SROI Ratio</th>
                  <th className="py-3 px-3 text-center">Audit Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD3]/70">
                {districtAllocations.map((alloc) => {
                  const isSelected = selectedDistrictId === alloc.districtKey;
                  return (
                    <tr
                      key={alloc.id}
                      className={`hover:bg-[#F7F4ED]/60 transition-colors ${
                        isSelected ? 'bg-[#E7F0F7]/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                          <span>{alloc.district}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EAE6DD] text-[#6B655C] font-normal">
                            {alloc.tier}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8C8479]">{alloc.state}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#1C1917] block">{alloc.ngoName}</span>
                        <span className="text-[10px] text-[#6B655C]">{alloc.centresCount} Active Centres</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[#6B655C] capitalize">
                          {alloc.program.replace('-', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-[#1C1917] tabular-nums">
                        {alloc.women.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-[#1C1917] tabular-nums">
                        ₹{(alloc.grantDisbursed / 10000000).toFixed(2)} Cr
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-[#1C1917] tabular-nums">
                        ₹{alloc.costPerOutcome.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-[#0B4A7D] tabular-nums">
                        ₹{alloc.sroiMultiplier} : ₹1
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            alloc.auditStatus === 'flagged'
                              ? 'bg-[#FCECEB] text-[#B42318]'
                              : 'bg-[#E8F3EC] text-[#2E6B4E]'
                          }`}
                        >
                          {alloc.auditStatus === 'flagged' ? '142 Flags' : `${alloc.auditScore}/100`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDistrictId(alloc.districtKey);
                            setSelectedState(alloc.state);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[#E5DFD3] text-[#0B4A7D] hover:bg-[#0B4A7D] hover:text-white transition-all text-xs font-semibold cursor-pointer"
                        >
                          Explore Spatial →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="md:hidden space-y-3">
          {districtAllocations.map((alloc) => (
            <div
              key={alloc.id}
              className="p-4 rounded-xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#1C1917]">{alloc.district}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAE6DD] text-[#6B655C]">
                      {alloc.tier}
                    </span>
                  </div>
                  <span className="text-xs text-[#6B655C]">{alloc.state} · {alloc.ngoName}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    alloc.auditStatus === 'flagged' ? 'bg-[#FCECEB] text-[#B42318]' : 'bg-[#E8F3EC] text-[#2E6B4E]'
                  }`}
                >
                  {alloc.auditScore}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E5DFD3]/60">
                <div>
                  <span className="text-[#8C8479] text-[10px] block">BENEFICIARIES</span>
                  <span className="font-semibold text-[#1C1917]">{alloc.women.toLocaleString('en-IN')} women</span>
                </div>
                <div>
                  <span className="text-[#8C8479] text-[10px] block">DISBURSED</span>
                  <span className="font-semibold text-[#1C1917]">₹{(alloc.grantDisbursed / 10000000).toFixed(2)} Cr</span>
                </div>
                <div>
                  <span className="text-[#8C8479] text-[10px] block">SROI MULTIPLIER</span>
                  <span className="font-bold text-[#0B4A7D]">₹{alloc.sroiMultiplier} : ₹1</span>
                </div>
                <div>
                  <span className="text-[#8C8479] text-[10px] block">IMPACT INDEX</span>
                  <span className="font-bold text-[#2E6B4E]">{alloc.impactIndex} / 100</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedDistrictId(alloc.districtKey);
                  setSelectedState(alloc.state);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="w-full py-2 rounded-lg bg-[#0B4A7D] text-white text-xs font-semibold text-center cursor-pointer"
              >
                Inspect District Spatial →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEVEL 5: DPDP PRIVACY-FIRST BENEFICIARY 360° DRAWER ── */}
      <AnimatePresence>
        {inspectingBeneficiary && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingBeneficiary(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-out Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.24 }}
              className="relative z-10 w-full sm:max-w-[460px] max-h-[92dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-5 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Handle for Mobile */}
              <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />

              <div className="space-y-5">
                {/* Drawer Header with DPDP Compliance Badge */}
                <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4A7D]">
                      <Shield size={14} />
                      <span>Level 5 Individual Impact 360°</span>
                    </div>
                    <h2 className="font-narrative text-lg font-bold text-[#1C1917]">
                      {inspectingBeneficiary.nameMasked}
                    </h2>
                    <p className="text-[11px] text-[#6B655C]">
                      {inspectingBeneficiary.centreName} · {inspectingBeneficiary.district}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectingBeneficiary(null)}
                    className="p-1 rounded-lg text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Statutory DPDP Privacy Notice */}
                <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-[11px] text-[#6B655C] flex items-start gap-2">
                  <Lock size={14} className="text-[#0B4A7D] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C1917] block">DPDP Act 2023 Compliant Inspection</span>
                    <p className="text-[10px] text-[#8C8479]">
                      Section 8(1) Redaction Applied. Aadhaar Virtual ID Tokenized. Electronic consent record logged under ref #{inspectingBeneficiary.auditRecord.consentRef}.
                    </p>
                  </div>
                </div>

                {/* Attendance & Milestone Tracking */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                    <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Attendance Record</span>
                    <span className="text-sm font-bold text-[#2E6B4E] tabular-nums">
                      {inspectingBeneficiary.attendancePct}%
                    </span>
                    <span className="text-[10px] text-[#6B655C] block">GPS Geofenced</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                    <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Monthly Income Lift</span>
                    <span className="text-sm font-bold text-[#2E6B4E] tabular-nums">
                      +{inspectingBeneficiary.liftPct}%
                    </span>
                    <span className="text-[10px] text-[#6B655C] block">
                      ₹{inspectingBeneficiary.baselineIncome.toLocaleString('en-IN')} → ₹{inspectingBeneficiary.currentIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* ── 3-ROW PERCENTILE BENCHMARK CARD ── */}
                <div className="p-4 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                      Comparative Percentile Performance
                    </span>
                    <span className="text-[10px] text-[#0B4A7D] font-semibold">Validated Lift</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Row 1: Centre Cohort */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#6B655C]">Within Centre Cohort ({inspectingBeneficiary.centreName}):</span>
                        <span className="font-bold text-[#0B4A7D] tabular-nums">
                          {inspectingBeneficiary.percentiles.withinCentre}th Percentile
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5DFD3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B4A7D] rounded-full"
                          style={{ width: `${inspectingBeneficiary.percentiles.withinCentre}%` }}
                        />
                      </div>
                    </div>

                    {/* Row 2: District Peer Cohort */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#6B655C]">District Peer Cohort ({inspectingBeneficiary.district}):</span>
                        <span className="font-bold text-[#2E6B4E] tabular-nums">
                          {inspectingBeneficiary.percentiles.withinDistrict}th Percentile
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5DFD3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2E6B4E] rounded-full"
                          style={{ width: `${inspectingBeneficiary.percentiles.withinDistrict}%` }}
                        />
                      </div>
                    </div>

                    {/* Row 3: Bajaj Portfolio Cohort */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#6B655C]">Bajaj CSR Portfolio (42,850 Total):</span>
                        <span className="font-bold text-[#1C1917] tabular-nums">
                          {inspectingBeneficiary.percentiles.withinPortfolio}th Percentile
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5DFD3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1C1917] rounded-full"
                          style={{ width: `${inspectingBeneficiary.percentiles.withinPortfolio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone Progression Steps */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                    Verified Milestone Checkpoints
                  </span>
                  <div className="space-y-1.5">
                    {inspectingBeneficiary.milestones.map((m, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-[#FCFBF8] border border-[#E5DFD3] text-xs flex items-center justify-between"
                      >
                        <span className="text-[#1C1917] flex items-center gap-1.5 font-medium">
                          <CheckCircle2 size={13} className="text-[#2E6B4E]" />
                          <span>{m.name}</span>
                        </span>
                        {m.date && <span className="text-[10px] text-[#8C8479] tabular-nums">{m.date}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Integrity Stamp */}
                <div className="p-3 rounded-xl border border-[#E5DFD3] bg-[#FCFBF8] text-[10px] text-[#8C8479] space-y-1">
                  <div className="flex items-center justify-between text-[#1C1917] font-semibold">
                    <span>Audit Sample: {inspectingBeneficiary.auditRecord.auditSampleId}</span>
                    <span className="text-[#2E6B4E]">Verified</span>
                  </div>
                  <div>Auditor: {inspectingBeneficiary.auditRecord.verifiedBy}</div>
                  <div>Timestamp: {inspectingBeneficiary.auditRecord.verifiedDate}</div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => setInspectingBeneficiary(null)}
                  className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  Close Beneficiary 360°
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
