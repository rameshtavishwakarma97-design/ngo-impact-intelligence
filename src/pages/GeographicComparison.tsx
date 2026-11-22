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
  ChevronDown,
  Lock,
  Table as TableIcon,
  Map as MapIcon,
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

interface GroupedDistrictSummary {
  id: string; // 'pune', 'coimbatore', 'jabalpur', 'nashik', 'chhindwara', 'thane'
  name: string;
  state: 'Maharashtra' | 'Madhya Pradesh' | 'Tamil Nadu';
  tier: 'Metro' | 'Tier-2' | 'Rural';
  ngosCount: number;
  leadNgo: string;
  ngosList: string[];
  totalWomen: number;
  totalDisbursedCr: number;
  weightedImpact: number;
  auditStatus: 'verified' | 'caution' | 'flagged';
  auditScore: number;
  costPerOutcome: number;
  sroiMultiplier: number;
  programFocus: string;
  serviceGapsCount: number;
}

export const GeographicComparison: React.FC<GeographicComparisonProps> = ({ onNavigate }) => {
  const {
    districtAllocations,
    operationalCentres,
    serviceGapBlocks,
    portfolioBenchmarks,
    earmarkReserveForGap,
    portfolio,
  } = useImpactStore();

  // Navigation & Drilldown State
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<OperationalCentre | null>(null);
  const [inspectingBeneficiary, setInspectingBeneficiary] = useState<Beneficiary360Record | null>(null);

  // View Mode: Map Workbench vs Table Matrix
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  // Filters & Map Display Layer
  const [activeLayer, setActiveLayer] = useState<MapDisplayLayer>('outcomes');
  const [programFilter, setProgramFilter] = useState<'all' | ProgramType>('all');
  const [formulaOpen, setFormulaOpen] = useState<boolean>(false);
  const [reserveToast, setReserveToast] = useState<string | null>(null);

  // Escape key listener for dismissing Level 5 Beneficiary Drawer & Formula
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

  // Exactly 6 Canonical Grouped Districts (Never list Pune 3 separate times!)
  const canonicalGroupedDistricts = useMemo<GroupedDistrictSummary[]>(() => {
    return [
      {
        id: 'pune',
        name: 'Pune',
        state: 'Maharashtra',
        tier: 'Metro',
        ngosCount: 3,
        leadNgo: 'Pratham · Smile · Magic Bus',
        ngosList: ['Pratham Foundation', 'Smile Foundation', 'Magic Bus'],
        totalWomen: 13100, // 9,200 + 2,500 + 1,400
        totalDisbursedCr: 11.4, // 7.8 + 2.1 + 1.5
        weightedImpact: 82.0, // (9200×84.2 + 2500×79.6 + 1400×71.8) / 13100
        auditStatus: 'verified',
        auditScore: 94,
        costPerOutcome: 6475,
        sroiMultiplier: 3.23,
        programFocus: 'Micro-Skilling & Rural Enterprise',
        serviceGapsCount: 2, // Velhe & Junnar
      },
      {
        id: 'coimbatore',
        name: 'Coimbatore',
        state: 'Tamil Nadu',
        tier: 'Tier-2',
        ngosCount: 1,
        leadNgo: 'Smile Foundation',
        ngosList: ['Smile Foundation (Coimbatore Cluster)'],
        totalWomen: 7600,
        totalDisbursedCr: 6.5,
        weightedImpact: 75.8,
        auditStatus: 'verified',
        auditScore: 90,
        costPerOutcome: 7100,
        sroiMultiplier: 2.89,
        programFocus: 'Textile Micro-Enterprise & Skilling',
        serviceGapsCount: 1, // Valparai
      },
      {
        id: 'jabalpur',
        name: 'Jabalpur',
        state: 'Madhya Pradesh',
        tier: 'Rural',
        ngosCount: 1,
        leadNgo: 'Educate Girls',
        ngosList: ['Educate Girls'],
        totalWomen: 8100,
        totalDisbursedCr: 6.5,
        weightedImpact: 81.4,
        auditStatus: 'verified',
        auditScore: 95,
        costPerOutcome: 4800,
        sroiMultiplier: 3.55,
        programFocus: "Foundational Literacy (FLN 3)",
        serviceGapsCount: 0,
      },
      {
        id: 'nashik',
        name: 'Nashik',
        state: 'Maharashtra',
        tier: 'Tier-2',
        ngosCount: 1,
        leadNgo: 'Room to Read',
        ngosList: ['Room to Read'],
        totalWomen: 6350,
        totalDisbursedCr: 5.5,
        weightedImpact: 78.9,
        auditStatus: 'verified',
        auditScore: 93,
        costPerOutcome: 5200,
        sroiMultiplier: 3.30,
        programFocus: "Foundational Literacy & Libraries",
        serviceGapsCount: 0,
      },
      {
        id: 'chhindwara',
        name: 'Chhindwara',
        state: 'Madhya Pradesh',
        tier: 'Rural',
        ngosCount: 1,
        leadNgo: 'Goonj',
        ngosList: ['Goonj'],
        totalWomen: 3900,
        totalDisbursedCr: 4.5,
        weightedImpact: 82.5,
        auditStatus: 'verified',
        auditScore: 94,
        costPerOutcome: 6400,
        sroiMultiplier: 3.15,
        programFocus: 'Tribal Handicrafts & Agro-Processing',
        serviceGapsCount: 1, // Harrai
      },
      {
        id: 'thane',
        name: 'Thane',
        state: 'Maharashtra',
        tier: 'Metro',
        ngosCount: 1,
        leadNgo: 'Magic Bus',
        ngosList: ['Magic Bus (Kalwa Hub)'],
        totalWomen: 3800,
        totalDisbursedCr: 4.0,
        weightedImpact: 56.4,
        auditStatus: 'flagged',
        auditScore: 70,
        costPerOutcome: 9450,
        sroiMultiplier: 1.22,
        programFocus: 'Urban Micro-Skilling (Audit Hold)',
        serviceGapsCount: 0,
      },
    ];
  }, []);

  // Filtered Grouped Districts based on State & Program Filters
  const filteredDistricts = useMemo(() => {
    return canonicalGroupedDistricts.filter((dist) => {
      const matchState = !selectedState || dist.state === selectedState;
      const matchProgram =
        programFilter === 'all'
          ? true
          : programFilter === 'micro-skilling'
          ? dist.programFocus.toLowerCase().includes('skilling') || dist.programFocus.toLowerCase().includes('enterprise')
          : dist.programFocus.toLowerCase().includes('literacy');
      return matchState && matchProgram;
    });
  }, [canonicalGroupedDistricts, selectedState, programFilter]);

  // Current district details when selected
  const activeDistrictSummary = useMemo(() => {
    if (!selectedDistrictId) return null;
    return canonicalGroupedDistricts.find((d) => d.id === selectedDistrictId) || null;
  }, [selectedDistrictId, canonicalGroupedDistricts]);

  // Raw NGO allocations inside currently selected district
  const activeDistrictAllocations = useMemo(() => {
    if (!selectedDistrictId) return [];
    return districtAllocations.filter((a) => a.districtKey === selectedDistrictId);
  }, [districtAllocations, selectedDistrictId]);

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

  // Breadcrumb segment click handlers
  const handleBreadcrumbLevel = (level: number) => {
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
    <div className="space-y-4 pb-6">
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

      {/* ── COMPACT SINGLE-STRIP HEADER (DECLUTTERED TOP CHROME) ── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#FCFBF8] border border-[#E5DFD3] px-4 py-2.5 rounded-2xl shadow-2xs">
        {/* Left: Breadcrumbs & Newsreader Serif Title */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <nav aria-label="Spatial Drilldown" className="flex items-center gap-1.5 text-xs text-[#6B655C]">
            <button
              type="button"
              onClick={() => handleBreadcrumbLevel(1)}
              className={`hover:text-[#0B4A7D] cursor-pointer ${
                !selectedState && !selectedDistrictId ? 'font-semibold text-[#0B4A7D]' : 'text-[#6B655C]'
              }`}
            >
              All States
            </button>

            {selectedState && (
              <>
                <ChevronRight size={12} className="text-[#8C8479]" />
                <button
                  type="button"
                  onClick={() => handleBreadcrumbLevel(2)}
                  className={`hover:text-[#0B4A7D] cursor-pointer ${
                    !selectedDistrictId ? 'font-semibold text-[#0B4A7D]' : 'text-[#6B655C]'
                  }`}
                >
                  {selectedState}
                </button>
              </>
            )}

            {selectedDistrictId && (
              <>
                <ChevronRight size={12} className="text-[#8C8479]" />
                <button
                  type="button"
                  onClick={() => handleBreadcrumbLevel(3)}
                  className={`capitalize hover:text-[#0B4A7D] cursor-pointer ${
                    !selectedNgoId ? 'font-semibold text-[#0B4A7D]' : 'text-[#6B655C]'
                  }`}
                >
                  {activeDistrictSummary?.name || selectedDistrictId}
                </button>
              </>
            )}

            {selectedNgoId && (
              <>
                <ChevronRight size={12} className="text-[#8C8479]" />
                <span className="font-semibold text-[#0B4A7D] truncate max-w-[140px]">
                  {districtAllocations.find((a) => a.ngoId === selectedNgoId)?.ngoName || selectedNgoId}
                </span>
              </>
            )}
          </nav>

          <span className="text-[#D5CEC0] hidden sm:inline">|</span>

          <h1 className="font-narrative font-normal text-lg sm:text-xl text-[#1C1917] tracking-tight truncate">
            Geographic Footprint &amp; Spatial Impact
          </h1>
        </div>

        {/* Right: Clean Single-Row Controls (Dropdown + 3-Pill Layers + View Mode) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Programme Dropdown */}
          <div className="relative">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value as any)}
              className="appearance-none bg-[#F7F4ED] border border-[#E5DFD3] rounded-xl px-2.5 py-1.5 pr-7 text-xs font-medium text-[#1C1917] hover:border-[#0B4A7D] focus:outline-none cursor-pointer"
            >
              <option value="all">All Programmes</option>
              <option value="micro-skilling">Micro-Skilling</option>
              <option value="literacy">Women's Literacy</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 text-[#8C8479] pointer-events-none" />
          </div>

          {/* 3-Pill Layer Switcher with Indian Rupee (₹) */}
          <div className="flex items-center bg-[#F7F4ED] border border-[#E5DFD3] rounded-xl p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveLayer('outcomes')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                activeLayer === 'outcomes'
                  ? 'bg-[#2E6B4E] text-white shadow-2xs'
                  : 'text-[#6B655C] hover:text-[#1C1917]'
              }`}
            >
              <TrendingUp size={12} />
              <span>Outcomes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer('cost_efficiency')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                activeLayer === 'cost_efficiency'
                  ? 'bg-[#0B4A7D] text-white shadow-2xs'
                  : 'text-[#6B655C] hover:text-[#1C1917]'
              }`}
            >
              <span className="font-bold">₹</span>
              <span>Cost / SROI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer('service_gaps')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                activeLayer === 'service_gaps'
                  ? 'bg-[#B5532A] text-white shadow-2xs'
                  : 'text-[#6B655C] hover:text-[#1C1917]'
              }`}
            >
              <AlertTriangle size={12} />
              <span>Service Gaps</span>
            </button>
          </div>

          {/* Formula Info Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFormulaOpen(!formulaOpen)}
              className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                formulaOpen
                  ? 'bg-[#0B4A7D] text-white border-[#0B4A7D]'
                  : 'bg-[#F7F4ED] text-[#6B655C] border-[#E5DFD3] hover:text-[#1C1917]'
              }`}
              title="Impact Index Formula"
            >
              <Info size={13} />
            </button>

            {formulaOpen && (
              <div className="absolute right-0 top-9 z-30 w-72 p-3.5 rounded-xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-1.5">
                  <span className="font-bold text-[#1C1917]">Composite Impact Index</span>
                  <button type="button" onClick={() => setFormulaOpen(false)} className="text-[#8C8479] hover:text-[#1C1917]">
                    <X size={14} />
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] font-mono text-[10px] text-[#1C1917] space-y-0.5">
                  <div>0.40 × Completion Rate (%)</div>
                  <div>+ 0.30 × SROI Multiplier</div>
                  <div>+ 0.20 × Audit Integrity Score</div>
                  <div>+ 0.10 × GPS Verification Rate</div>
                </div>
                <p className="text-[10px] text-[#8C8479]">
                  Pune District Mean: <strong className="text-[#1C1917]">82.0</strong> · Bajaj Benchmark: <strong className="text-[#1C1917]">76.8</strong>.
                </p>
              </div>
            )}
          </div>

          {/* View Mode Toggle: [ Map | Table ] */}
          <div className="flex items-center bg-[#F7F4ED] border border-[#E5DFD3] rounded-xl p-0.5 text-xs shadow-2xs">
            <button
              type="button"
              data-testid="toggle-view-map"
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'map'
                  ? 'bg-[#0B4A7D] text-white shadow-2xs'
                  : 'text-[#6B655C] hover:text-[#1C1917]'
              }`}
            >
              <MapIcon size={12} />
              <span>Map</span>
            </button>

            <button
              type="button"
              data-testid="toggle-view-table"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-[#0B4A7D] text-white shadow-2xs'
                  : 'text-[#6B655C] hover:text-[#1C1917]'
              }`}
            >
              <TableIcon size={12} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── VIEW MODE: MAP WORKBENCH (DEFAULT) ── */}
      {viewMode === 'map' && (
        <div className="lg:h-[calc(100dvh-128px)] lg:min-h-[560px] grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Full-Height MapLibre Canvas (7 cols / ~58%) */}
          <div className="lg:col-span-7 h-[360px] sm:h-[460px] lg:h-full">
            <SpatialMap
              selectedDistrictId={selectedDistrictId}
              selectedState={selectedState}
              selectedNgoId={selectedNgoId}
              activeLayer={activeLayer}
              onSelectDistrict={(dist) => {
                setSelectedDistrictId(dist);
                if (dist) {
                  const target = canonicalGroupedDistricts.find((d) => d.id === dist);
                  if (target) setSelectedState(target.state);
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
                const target = canonicalGroupedDistricts.find(
                  (d) => d.name.toLowerCase() === centre.district.toLowerCase()
                );
                if (target) {
                  setSelectedDistrictId(target.id);
                  setSelectedState(target.state);
                }
              }}
              onNavigateToAudit={() => onNavigate?.('operations')}
            />
          </div>

          {/* Right Column: Contextual Inspector Panel (5 cols / ~42%) */}
          <div className="lg:col-span-5 lg:h-full lg:overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs space-y-4">
              <AnimatePresence mode="wait">
                {/* ── LEVEL 1: ALL STATES / GROUPED DISTRICTS ── */}
                {!selectedDistrictId && (
                  <motion.div
                    key="level-1"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="space-y-4"
                  >
                    {/* Compact 3-State Filter Pills */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#8C8479]">
                        <span className="font-bold uppercase tracking-wider">State Territories</span>
                        <span>{filteredDistricts.length} Districts</span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        <button
                          type="button"
                          onClick={() => setSelectedState(selectedState === 'Maharashtra' ? null : 'Maharashtra')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            selectedState === 'Maharashtra'
                              ? 'bg-[#0B4A7D] text-white shadow-2xs'
                              : 'bg-[#F7F4ED] text-[#1C1917] border border-[#E5DFD3] hover:border-[#0B4A7D]'
                          }`}
                        >
                          Maharashtra · 23.2k
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedState(selectedState === 'Madhya Pradesh' ? null : 'Madhya Pradesh')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            selectedState === 'Madhya Pradesh'
                              ? 'bg-[#2E6B4E] text-white shadow-2xs'
                              : 'bg-[#F7F4ED] text-[#1C1917] border border-[#E5DFD3] hover:border-[#2E6B4E]'
                          }`}
                        >
                          MP · 12.0k
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedState(selectedState === 'Tamil Nadu' ? null : 'Tamil Nadu')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            selectedState === 'Tamil Nadu'
                              ? 'bg-[#B5532A] text-white shadow-2xs'
                              : 'bg-[#F7F4ED] text-[#1C1917] border border-[#E5DFD3] hover:border-[#B5532A]'
                          }`}
                        >
                          TN · 7.6k
                        </button>
                      </div>
                    </div>

                    {/* Exactly 6 Canonical Grouped District Rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1C1917]">
                        <span>Canonical Operating Districts</span>
                        <span className="text-[10px] text-[#8C8479] font-normal">Click to drill down</span>
                      </div>

                      <div className="space-y-1.5">
                        {filteredDistricts.map((dist) => (
                          <div
                            key={dist.id}
                            data-district-id={dist.id}
                            data-testid={`district-card-${dist.id}`}
                            onClick={() => {
                              setSelectedDistrictId(dist.id);
                              setSelectedState(dist.state);
                            }}
                            className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] hover:border-[#0B4A7D] hover:bg-[#FCFBF8] transition-all duration-100 active:scale-[0.99] cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#1C1917] group-hover:text-[#0B4A7D] transition-colors">
                                  {dist.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAE6DD] text-[#6B655C]">
                                  {dist.tier}
                                </span>
                                {dist.auditStatus === 'flagged' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FCECEB] text-[#B42318] font-bold">
                                    Audit Hold
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#6B655C] truncate block">
                                {dist.leadNgo} · {dist.totalWomen.toLocaleString('en-IN')} women
                              </span>
                            </div>

                            <div className="text-right flex-shrink-0 flex items-center gap-2.5">
                              <div>
                                <span className="text-[10px] text-[#8C8479] block">IMPACT</span>
                                <span className="font-bold text-xs text-[#0B4A7D] tabular-nums">
                                  {dist.weightedImpact} / 100
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

                {/* ── LEVEL 2: DISTRICT DRILL-DOWN (e.g. PUNE / THANE) ── */}
                {selectedDistrictId && activeDistrictSummary && (
                  <motion.div
                    key={`level-2-${selectedDistrictId}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="space-y-4"
                  >
                    {/* District Header & Return Button */}
                    <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-[#0B4A7D]" />
                          <h2 className="font-narrative text-base font-bold text-[#1C1917]">
                            {activeDistrictSummary.name} District
                          </h2>
                          <span className="text-[10px] font-semibold text-[#8C8479] bg-[#EAE6DD] px-1.5 py-0.2 rounded">
                            {activeDistrictSummary.tier}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B655C] mt-0.5">
                          {activeDistrictSummary.state} · {activeDistrictSummary.ngosCount} Partner Organization{activeDistrictSummary.ngosCount > 1 ? 's' : ''}
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

                    {/* 4 Compact Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                        <span className="text-[9px] text-[#8C8479] uppercase block font-semibold">PARTNERS</span>
                        <span className="text-xs font-bold text-[#1C1917]">{activeDistrictSummary.ngosCount} NGOs</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                        <span className="text-[9px] text-[#8C8479] uppercase block font-semibold">WOMEN</span>
                        <span className="text-xs font-bold text-[#1C1917] tabular-nums">
                          {activeDistrictSummary.totalWomen.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                        <span className="text-[9px] text-[#8C8479] uppercase block font-semibold">DISTRICT MEAN</span>
                        <span className="text-xs font-bold text-[#0B4A7D] tabular-nums">
                          {activeDistrictSummary.weightedImpact}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                        <span className="text-[9px] text-[#8C8479] uppercase block font-semibold">BENCHMARK</span>
                        <span className="text-xs font-bold text-[#2E6B4E] tabular-nums">
                          {portfolioBenchmarks.portfolioWeightedMean}
                        </span>
                      </div>
                    </div>

                    {/* ── SIDE-BY-SIDE PEER BENCHMARK BARS ── */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1C1917]">Cohort Peer Benchmark Bars</span>
                        <span className="text-[10px] text-[#8C8479]">Click NGO to inspect</span>
                      </div>

                      {/* Reference Line Legend */}
                      <div className="flex items-center justify-between text-[10px] text-[#6B655C] border-b border-[#E5DFD3]/60 pb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-0.5 bg-[#0B4A7D] inline-block border-t border-dashed border-[#0B4A7D]" />
                          <span>District Mean ({activeDistrictSummary.weightedImpact})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-0.5 bg-[#1C1917] inline-block border-t border-dotted border-[#1C1917]" />
                          <span>Bajaj Benchmark ({portfolioBenchmarks.portfolioWeightedMean})</span>
                        </span>
                      </div>

                      {/* NGO Bars */}
                      <div className="space-y-2.5">
                        {activeDistrictAllocations.map((alloc) => {
                          const isSelected = selectedNgoId === alloc.ngoId;
                          const isLeader = alloc.impactIndex >= activeDistrictSummary.weightedImpact;

                          return (
                            <div
                              key={alloc.id}
                              onClick={() => setSelectedNgoId(isSelected ? null : alloc.ngoId)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#E7F0F7] border-[#0B4A7D] shadow-2xs'
                                  : 'bg-[#F7F4ED] border-[#E5DFD3] hover:border-[#0B4A7D]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-bold text-[#1C1917] flex items-center gap-1">
                                  <span>{alloc.ngoName}</span>
                                  {isLeader && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#E8F3EC] text-[#2E6B4E] font-semibold">
                                      Leader
                                    </span>
                                  )}
                                </span>
                                <span className="font-bold text-[#0B4A7D] tabular-nums">
                                  {alloc.impactIndex} / 100
                                </span>
                              </div>

                              {/* Horizontal Bar */}
                              <div className="relative w-full h-2.5 bg-[#E5DFD3] rounded-full overflow-hidden">
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

                              <div className="grid grid-cols-3 gap-2 text-[10px] text-[#6B655C] mt-1.5 pt-1 border-t border-[#E5DFD3]/60">
                                <div>
                                  <span className="text-[#8C8479]">Women: </span>
                                  <span className="font-semibold text-[#1C1917]">{alloc.women.toLocaleString('en-IN')}</span>
                                </div>
                                <div>
                                  <span className="text-[#8C8479]">SROI: </span>
                                  <span className="font-semibold text-[#1C1917]">₹{alloc.sroiMultiplier}</span>
                                </div>
                                <div>
                                  <span className="text-[#8C8479]">Audit: </span>
                                  <span className={`font-semibold ${alloc.auditScore < 85 ? 'text-[#B42318]' : 'text-[#2E6B4E]'}`}>
                                    {alloc.auditScore}/100
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Scoping Note */}
                      <p className="text-[10px] text-[#6B655C] leading-relaxed pt-1">
                        Calculated across {activeDistrictSummary.totalWomen.toLocaleString('en-IN')} verified beneficiaries in {activeDistrictSummary.name}.
                        {activeDistrictSummary.name === 'Pune' && (
                          <span className="text-[#1C1917] font-medium block mt-0.5">
                            Pratham leads Pune (+2.2 pts above district mean, +7.4 pts above portfolio benchmark) with ₹3.42 SROI.
                          </span>
                        )}
                        {activeDistrictSummary.name === 'Thane' && (
                          <span className="text-[#B42318] font-medium block mt-0.5">
                            Thane Urban cluster is on audit escrow hold pending verification of 142 GPS anomaly flags.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* ── SERVICE GAP BLOCKS (INTERACTIVE EARMARKING) ── */}
                    {districtServiceGaps.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#E5DFD3]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1C1917] flex items-center gap-1">
                            <AlertTriangle size={13} className="text-[#B5532A]" />
                            <span>Unserved Blocks ({districtServiceGaps.length})</span>
                          </span>
                          <span className="text-[10px] text-[#8C8479]">Reserve: ₹{portfolio.reserveCr.toFixed(2)} Cr</span>
                        </div>

                        <div className="space-y-2">
                          {districtServiceGaps.map((block) => (
                            <div
                              key={block.id}
                              className="p-2.5 rounded-xl bg-[#FDF8F5] border border-[#B5532A]/20 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-[#1C1917] block truncate">{block.name}</span>
                                <span className="text-[10px] text-[#6B655C]">
                                  {block.unservedWomen} women · ₹{block.recommendedAllocationCr} Cr gap
                                </span>
                              </div>

                              {block.status === 'unallocated' ? (
                                <button
                                  type="button"
                                  onClick={() => handleEarmark(block)}
                                  className="px-2.5 py-1 rounded-lg bg-[#B5532A] text-white text-[10px] font-semibold hover:bg-[#96401E] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
                                >
                                  Earmark from Reserve
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-[#E8F3EC] text-[#2E6B4E] text-[10px] font-bold border border-[#2E6B4E]/20 whitespace-nowrap">
                                  ✓ Committed
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── OPERATIONAL CENTRES LIST (LEVEL 3 & 4) ── */}
                    <div className="space-y-2 pt-2 border-t border-[#E5DFD3]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1C1917]">
                          Centres in {activeDistrictSummary.name} ({activeCentres.length})
                        </span>
                        <span className="text-[10px] text-[#8C8479]">Inspect DPDP records</span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                        {activeCentres.map((centre) => {
                          const isSelected = selectedCentre?.id === centre.id;
                          return (
                            <div
                              key={centre.id}
                              onClick={() => setSelectedCentre(isSelected ? null : centre)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#E7F0F7] border-[#0B4A7D] shadow-2xs'
                                  : 'bg-[#F7F4ED] border-[#E5DFD3] hover:border-[#0B4A7D]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#1C1917] truncate">{centre.name}</span>
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                    centre.status === 'flagged' ? 'bg-[#FCECEB] text-[#B42318]' : 'bg-[#E8F3EC] text-[#2E6B4E]'
                                  }`}
                                >
                                  {centre.status === 'flagged' ? 'Flagged' : 'Active'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-[#6B655C] mt-1 pt-1 border-t border-[#E5DFD3]/60">
                                <span>{centre.beneficiaries} women · {centre.completionPct}% completion</span>
                                <span className="font-semibold text-[#2E6B4E]">{centre.outcomeLift}</span>
                              </div>

                              {/* Level 5 Trigger Button if centre selected */}
                              {isSelected && (
                                <div className="mt-2 pt-1.5 border-t border-[#0B4A7D]/20 flex items-center justify-between">
                                  <span className="text-[10px] text-[#0B4A7D] font-medium flex items-center gap-1">
                                    <Lock size={10} />
                                    <span>DPDP Mode</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const pool = SAMPLE_BENEFICIARIES[selectedDistrictId || 'default'] || SAMPLE_BENEFICIARIES.default;
                                      setInspectingBeneficiary(pool[0]);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#0B4A7D] text-white text-[10px] font-semibold hover:bg-[#083A63] transition-transform active:scale-[0.98] cursor-pointer"
                                  >
                                    Inspect Authorized Beneficiaries →
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
        </div>
      )}

      {/* ── VIEW MODE: TABLE MATRIX (TOGGLED FROM HEADER) ── */}
      {viewMode === 'table' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-narrative text-base font-bold text-[#1C1917]">
              District Comparative Summary Matrix
            </h2>
            <span className="text-xs text-[#8C8479]">6 Canonical Operating Districts</span>
          </div>

          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F4ED] border-b border-[#E5DFD3] text-[#8C8479] text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">District &amp; State</th>
                    <th className="py-3 px-3">Operating Partners</th>
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
                  {canonicalGroupedDistricts.map((dist) => (
                    <tr key={dist.id} className="hover:bg-[#F7F4ED]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                          <span>{dist.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EAE6DD] text-[#6B655C] font-normal">
                            {dist.tier}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8C8479]">{dist.state}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#1C1917] block">{dist.leadNgo}</span>
                        <span className="text-[10px] text-[#6B655C]">{dist.ngosCount} Active NGO{dist.ngosCount > 1 ? 's' : ''}</span>
                      </td>

                      <td className="py-3 px-3 text-[#6B655C]">
                        {dist.programFocus}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-[#1C1917] tabular-nums">
                        {dist.totalWomen.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-[#1C1917] tabular-nums">
                        ₹{dist.totalDisbursedCr.toFixed(1)} Cr
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-[#1C1917] tabular-nums">
                        ₹{dist.costPerOutcome.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-[#0B4A7D] tabular-nums">
                        ₹{dist.sroiMultiplier} : ₹1
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            dist.auditStatus === 'flagged' ? 'bg-[#FCECEB] text-[#B42318]' : 'bg-[#E8F3EC] text-[#2E6B4E]'
                          }`}
                        >
                          {dist.auditStatus === 'flagged' ? '142 Flags' : `${dist.auditScore}/100`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDistrictId(dist.id);
                            setSelectedState(dist.state);
                            setViewMode('map');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[#E5DFD3] text-[#0B4A7D] hover:bg-[#0B4A7D] hover:text-white transition-all text-xs font-semibold cursor-pointer"
                        >
                          Explore Spatial →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── LEVEL 5: DPDP PRIVACY-FIRST BENEFICIARY 360° DRAWER ── */}
      <AnimatePresence>
        {inspectingBeneficiary && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingBeneficiary(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.24 }}
              className="relative z-10 w-full sm:max-w-[440px] max-h-[92dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 pb-safe overflow-y-auto overscroll-contain space-y-4 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B4A7D]">
                      <Shield size={13} />
                      <span>Individual Impact 360°</span>
                    </div>
                    <h2 className="font-narrative text-base font-bold text-[#1C1917]">
                      {inspectingBeneficiary.nameMasked}
                    </h2>
                    <p className="text-[10px] text-[#6B655C]">
                      {inspectingBeneficiary.centreName} · {inspectingBeneficiary.district}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectingBeneficiary(null)}
                    className="p-1 rounded-lg text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-[10px] text-[#6B655C] flex items-start gap-2">
                  <Lock size={13} className="text-[#0B4A7D] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1C1917] block">DPDP Act 2023 Section 8(1) Redacted</span>
                    <p className="text-[#8C8479]">
                      Aadhaar Tokenized ({inspectingBeneficiary.maskedToken}). Consent Ref #{inspectingBeneficiary.auditRecord.consentRef}.
                    </p>
                  </div>
                </div>

                {/* 3-Row Percentile Benchmark Card */}
                <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479] block">
                    Comparative Percentile Performance
                  </span>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-[#6B655C]">Within Centre Cohort:</span>
                        <span className="font-bold text-[#0B4A7D]">{inspectingBeneficiary.percentiles.withinCentre}th Percentile</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5DFD3] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0B4A7D] rounded-full" style={{ width: `${inspectingBeneficiary.percentiles.withinCentre}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-[#6B655C]">District Peer Cohort ({inspectingBeneficiary.district}):</span>
                        <span className="font-bold text-[#2E6B4E]">{inspectingBeneficiary.percentiles.withinDistrict}th Percentile</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5DFD3] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2E6B4E] rounded-full" style={{ width: `${inspectingBeneficiary.percentiles.withinDistrict}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-[#6B655C]">Bajaj CSR Portfolio (42,850 Total):</span>
                        <span className="font-bold text-[#1C1917]">{inspectingBeneficiary.percentiles.withinPortfolio}th Percentile</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5DFD3] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1C1917] rounded-full" style={{ width: `${inspectingBeneficiary.percentiles.withinPortfolio}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479] block">
                    Verified Milestone Checkpoints
                  </span>
                  <div className="space-y-1">
                    {inspectingBeneficiary.milestones.map((m, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[#FCFBF8] border border-[#E5DFD3] text-xs flex items-center justify-between">
                        <span className="text-[#1C1917] flex items-center gap-1.5 font-medium text-[11px]">
                          <CheckCircle2 size={12} className="text-[#2E6B4E]" />
                          <span>{m.name}</span>
                        </span>
                        {m.date && <span className="text-[10px] text-[#8C8479] tabular-nums">{m.date}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => setInspectingBeneficiary(null)}
                  className="w-full py-2 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
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
