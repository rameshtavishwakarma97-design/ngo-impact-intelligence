import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Lock,
  Table as TableIcon,
  Map as MapIcon,
  RotateCcw,
  Building2,
  QrCode,
  ArrowRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import {
  useImpactStore,
  type ProgramType,
  type OperationalCentre,
  type ServiceGapBlock,
  getNgoColor,
} from '../data/impactStore';
import { SpatialMap, type MapDisplayLayer } from '../components/SpatialMap';

interface GeographicComparisonProps {
  onNavigate?: (screenId: string) => void;
}

// ─── BENEFICIARY 360° DATA MODEL (CHAPTER 4) ──────────────────────────────────

export interface BeneficiaryDetail {
  id: string;
  token: string;
  maskedName: string;
  trade: string;
  centreId: string;
  centreName: string;
  district: string;
  ngoName: string;
  baselineIncome: number;
  currentIncome: number;
  liftPct: number;
  qrActive: boolean;
  kycVerified: boolean;
  percentiles: {
    withinCentre: number;
    withinDistrict: number;
    withinPortfolio: number;
  };
  milestones: { name: string; completed: boolean; date: string }[];
  auditRef: string;
}

// Deterministic Beneficiary Generator for each Centre & Ward
function getBeneficiariesForCentre(centre: OperationalCentre): BeneficiaryDetail[] {
  const cId = centre.id;
  const ngo = centre.ngoId;
  const dist = centre.district;

  if (cId === 'cnt-pratham-kothrud') {
    return [
      {
        id: 'BEN-PUN-0841',
        token: 'MH-PUN-0841',
        maskedName: 'Sunita P. (Ward 14)',
        trade: 'Apparel Tailoring & Boutique Micro-Enterprise',
        centreId: cId,
        centreName: centre.name,
        district: dist,
        ngoName: 'Pratham Foundation',
        baselineIncome: 5200,
        currentIncome: 7100,
        liftPct: 36.5,
        qrActive: true,
        kycVerified: true,
        percentiles: { withinCentre: 82, withinDistrict: 85, withinPortfolio: 83 },
        milestones: [
          { name: 'Financial Literacy & Merchant UPI Induction', completed: true, date: '04 Apr 2024' },
          { name: 'Commercial Stitching & Pattern Grading', completed: true, date: '22 May 2024' },
          { name: 'Seed Capital & Merchant QR Disbursal', completed: true, date: '15 Jun 2024' },
          { name: 'Sustained Revenue > ₹7,000/mo (60-day proof)', completed: true, date: '18 Aug 2024' },
        ],
        auditRef: 'KPMG-AUD-2024-Q3-0841',
      },
      {
        id: 'BEN-PUN-0849',
        token: 'MH-PUN-0849',
        maskedName: 'Rekha K. (Ward 14)',
        trade: 'Micro-Culinary & Packaged Snacks',
        centreId: cId,
        centreName: centre.name,
        district: dist,
        ngoName: 'Pratham Foundation',
        baselineIncome: 4800,
        currentIncome: 6900,
        liftPct: 43.8,
        qrActive: true,
        kycVerified: true,
        percentiles: { withinCentre: 79, withinDistrict: 81, withinPortfolio: 80 },
        milestones: [
          { name: 'FSSAI Hygiene Standards & Labeling', completed: true, date: '12 Apr 2024' },
          { name: 'Batch Production & Packaging Induction', completed: true, date: '28 May 2024' },
          { name: 'Local Retail Counter Placement', completed: true, date: '20 Jun 2024' },
          { name: 'Digital Ledger (Khatabook) Reconciliation', completed: true, date: '25 Aug 2024' },
        ],
        auditRef: 'KPMG-AUD-2024-Q3-0849',
      },
      {
        id: 'BEN-PUN-0862',
        token: 'MH-PUN-0862',
        maskedName: 'Asha M. (Ward 14)',
        trade: 'Handicrafts & Merchant QR Retail',
        centreId: cId,
        centreName: centre.name,
        district: dist,
        ngoName: 'Pratham Foundation',
        baselineIncome: 5500,
        currentIncome: 7400,
        liftPct: 34.5,
        qrActive: true,
        kycVerified: true,
        percentiles: { withinCentre: 86, withinDistrict: 88, withinPortfolio: 86 },
        milestones: [
          { name: 'Eco-Friendly Jute Bag Manufacturing', completed: true, date: '10 Apr 2024' },
          { name: 'Exhibition Stall & Corporate Bulk Order', completed: true, date: '30 May 2024' },
          { name: 'Merchant QR Standee Live at Shop', completed: true, date: '18 Jun 2024' },
          { name: 'Bank Working Capital Credit Linked', completed: true, date: '14 Aug 2024' },
        ],
        auditRef: 'KPMG-AUD-2024-Q3-0862',
      },
    ];
  }

  if (cId === 'cnt-pratham-hadapsar') {
    return [
      {
        id: 'BEN-PUN-1102',
        token: 'MH-PUN-1102',
        maskedName: 'Amina S. (Ward 18)',
        trade: 'Apparel Tailoring & School Uniforms',
        centreId: cId,
        centreName: centre.name,
        district: dist,
        ngoName: 'Pratham Foundation',
        baselineIncome: 4900,
        currentIncome: 6850,
        liftPct: 39.8,
        qrActive: true,
        kycVerified: true,
        percentiles: { withinCentre: 80, withinDistrict: 83, withinPortfolio: 81 },
        milestones: [
          { name: 'Industrial Sewing Machine Operations', completed: true, date: '08 Apr 2024' },
          { name: 'Contract Bulk Cutting Certification', completed: true, date: '24 May 2024' },
          { name: 'Merchant UPI Integration', completed: true, date: '12 Jun 2024' },
          { name: 'Institutional School Supply Order', completed: true, date: '20 Aug 2024' },
        ],
        auditRef: 'KPMG-AUD-2024-Q3-1102',
      },
      {
        id: 'BEN-PUN-1115',
        token: 'MH-PUN-1115',
        maskedName: 'Meena B. (Ward 18)',
        trade: 'Commercial Food Processing & Spices',
        centreId: cId,
        centreName: centre.name,
        district: dist,
        ngoName: 'Pratham Foundation',
        baselineIncome: 5100,
        currentIncome: 6950,
        liftPct: 36.3,
        qrActive: true,
        kycVerified: true,
        percentiles: { withinCentre: 77, withinDistrict: 80, withinPortfolio: 78 },
        milestones: [
          { name: 'Spice Grinding & Sealed Packaging', completed: true, date: '14 Apr 2024' },
          { name: 'Weights & Measures Compliance', completed: true, date: '02 Jun 2024' },
          { name: 'Kiosk Disbursal & QR Setup', completed: true, date: '22 Jun 2024' },
          { name: 'Monthly Income Milestone > ₹6,800', completed: true, date: '16 Aug 2024' },
        ],
        auditRef: 'KPMG-AUD-2024-Q3-1115',
      },
    ];
  }

  if (cId === 'cnt-magicbus-kalwa') {
    return [
      {
        id: 'BEN-THA-0402',
        token: 'MH-THA-0402',
        maskedName: 'Parvati G. (Kalwa Cluster)',
        trade: 'Urban Garment Stitching (Audit Escrow Review)',
        centreId: cId,
        centreName: centre.name,
        district: dist,
        ngoName: 'Magic Bus',
        baselineIncome: 4600,
        currentIncome: 5480,
        liftPct: 19.1,
        qrActive: false,
        kycVerified: false,
        percentiles: { withinCentre: 64, withinDistrict: 58, withinPortfolio: 54 },
        milestones: [
          { name: 'Intake Registration (Cyber Cafe Logged)', completed: true, date: '10 May 2024' },
          { name: 'Sewing Module Level 1', completed: true, date: '15 Jun 2024' },
          { name: 'GPS Geofence Biometric Verification', completed: false, date: 'FLAGGED' },
          { name: 'Tranche Disbursal', completed: false, date: 'HELD IN ESCROW' },
        ],
        auditRef: 'ESCROW-HOLD-142-KALWA',
      },
    ];
  }

  // Generative Tailored Roster for any other centre
  const prefix = dist.slice(0, 3).toUpperCase();
  const baseNum = Math.abs(cId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100));

  let tradeCategory = 'Vocational Skilling & Enterprise';
  if (ngo === 'smile' && dist === 'Coimbatore') tradeCategory = 'Powerloom & Textile Weaving Micro-Hub';
  else if (ngo === 'smile') tradeCategory = 'Rural Agro-Enterprise & Cold Chain';
  else if (ngo === 'goonj') tradeCategory = 'Tribal Forest Produce & Honey Processing';
  else if (ngo === 'educate-girls') tradeCategory = 'Community Foundational Literacy Champion';
  else if (ngo === 'room-to-read') tradeCategory = 'Primary School Library Facilitator';

  return [
    {
      id: `BEN-${prefix}-${baseNum}`,
      token: `${dist.slice(0, 2).toUpperCase()}-${prefix}-${baseNum}`,
      maskedName: `Cohort Representative 01`,
      trade: tradeCategory,
      centreId: cId,
      centreName: centre.name,
      district: dist,
      ngoName: centre.ngoId,
      baselineIncome: 4800,
      currentIncome: 6500,
      liftPct: 35.4,
      qrActive: true,
      kycVerified: true,
      percentiles: { withinCentre: 80, withinDistrict: 78, withinPortfolio: 79 },
      milestones: [
        { name: 'Baseline Intake & Assessment', completed: true, date: '12 Apr 2024' },
        { name: 'Vocational Core Training Completion', completed: true, date: '25 May 2024' },
        { name: 'Biometric Attendance & Geofence Validated', completed: true, date: '18 Jun 2024' },
        { name: 'Endline Milestone Verified by Auditor', completed: true, date: '15 Aug 2024' },
      ],
      auditRef: `CONC-AUD-2024-${prefix}-${baseNum}`,
    },
    {
      id: `BEN-${prefix}-${baseNum + 1}`,
      token: `${dist.slice(0, 2).toUpperCase()}-${prefix}-${baseNum + 1}`,
      maskedName: `Cohort Representative 02`,
      trade: tradeCategory,
      centreId: cId,
      centreName: centre.name,
      district: dist,
      ngoName: centre.ngoId,
      baselineIncome: 4500,
      currentIncome: 6200,
      liftPct: 37.8,
      qrActive: true,
      kycVerified: true,
      percentiles: { withinCentre: 76, withinDistrict: 74, withinPortfolio: 75 },
      milestones: [
        { name: 'Baseline Intake & Assessment', completed: true, date: '15 Apr 2024' },
        { name: 'Vocational Core Training Completion', completed: true, date: '28 May 2024' },
        { name: 'Biometric Attendance & Geofence Validated', completed: true, date: '20 Jun 2024' },
        { name: 'Endline Milestone Verified by Auditor', completed: true, date: '18 Aug 2024' },
      ],
      auditRef: `CONC-AUD-2024-${prefix}-${baseNum + 1}`,
    },
  ];
}

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
    decisions,
    approveTranche,
    holdTranche,
    fieldErpPulse,
  } = useImpactStore();

  // Navigation & Drilldown State
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<OperationalCentre | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryDetail | null>(null);

  // Inspector Panel State & Chapter Sub-Tabs
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState<boolean>(false);
  const [districtSubTab, setDistrictSubTab] = useState<'ngos' | 'centres' | 'gaps'>('ngos');
  const [dpdpExplanationExpanded, setDpdpExplanationExpanded] = useState<boolean>(false);
  const [inspectorMode, setInspectorMode] = useState<'today' | 'explore'>('today');
  const [mobileTab, setMobileTab] = useState<'today' | 'map'>('today');
  const [approvingPratham, setApprovingPratham] = useState<boolean>(false);

  // View Mode: Map Workbench vs Table Matrix
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  // Map Controls & Filters
  const [activeLayer, setActiveLayer] = useState<MapDisplayLayer>('outcomes');
  const [is3D, setIs3D] = useState<boolean>(false);
  const [programFilter, setProgramFilter] = useState<'all' | ProgramType>('all');
  const [formulaOpen, setFormulaOpen] = useState<boolean>(false);
  const [reserveToast, setReserveToast] = useState<string | null>(null);

  // Auto-switch district subtab when clicking Service Gaps on dock
  const handleLayerChange = (layer: MapDisplayLayer) => {
    setActiveLayer(layer);
    if (layer === 'service_gaps' && selectedDistrictId) {
      setDistrictSubTab('gaps');
    } else if (layer !== 'service_gaps' && districtSubTab === 'gaps') {
      setDistrictSubTab('ngos');
    }
  };

  // Keyboard shortcut: Escape closes beneficiary or formula
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBeneficiary) setSelectedBeneficiary(null);
        else if (formulaOpen) setFormulaOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBeneficiary, formulaOpen]);

  // Exactly 6 Canonical Grouped Districts
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
        totalWomen: 13100,
        totalDisbursedCr: 11.4,
        weightedImpact: 82.0,
        auditStatus: 'verified',
        auditScore: 94,
        costPerOutcome: 6475,
        sroiMultiplier: 3.23,
        programFocus: 'Micro-Skilling & Rural Enterprise',
        serviceGapsCount: 2,
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
        serviceGapsCount: 1,
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
        serviceGapsCount: 1,
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

  // Filtered Grouped Districts
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

  // Current district details
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

  // Operational centres for current district
  const activeCentres = useMemo(() => {
    if (!selectedDistrictId) return [];
    return operationalCentres.filter((c) => {
      const matchDist = c.district.toLowerCase() === selectedDistrictId.toLowerCase();
      const matchNgo = !selectedNgoId || c.ngoId === selectedNgoId;
      return matchDist && matchNgo;
    });
  }, [operationalCentres, selectedDistrictId, selectedNgoId]);

  // Beneficiaries for selected centre (Chapter 3 & 4)
  const centreBeneficiaries = useMemo(() => {
    if (!selectedCentre) return [];
    return getBeneficiariesForCentre(selectedCentre);
  }, [selectedCentre]);

  // Active Chapter determination
  const activeChapter: 1 | 2 | 3 | 4 = useMemo(() => {
    if (selectedBeneficiary) return 4;
    if (selectedCentre) return 3;
    if (selectedDistrictId) return 2;
    return 1;
  }, [selectedBeneficiary, selectedCentre, selectedDistrictId]);

  // Handle reserve earmarking
  const handleEarmark = (block: ServiceGapBlock) => {
    earmarkReserveForGap(block.id, block.recommendedAllocationCr);
    setReserveToast(`Committed ₹${block.recommendedAllocationCr.toFixed(2)} Cr from Bajaj Corpus Reserve to ${block.name}`);
    setTimeout(() => setReserveToast(null), 4000);
  };

  // District Selection Callback
  const handleSelectDistrict = useCallback((dist: string | null) => {
    setSelectedDistrictId(dist);
    setSelectedCentre(null);
    setSelectedBeneficiary(null);
    setSelectedNgoId(null);
    if (dist) {
      const target = canonicalGroupedDistricts.find((d) => d.id === dist);
      if (target) setSelectedState(target.state);
      setIsInspectorCollapsed(false);
      setInspectorMode('explore');
      setMobileTab('map');
    }
  }, [canonicalGroupedDistricts]);

  // Centre Selection Callback (Auto-pitch into 3D Buildings)
  const handleSelectCentre = useCallback((centre: OperationalCentre | null) => {
    setSelectedCentre(centre);
    setSelectedBeneficiary(null);
    if (centre) {
      setIs3D(true); // Auto-pitch into 3D buildings!
      setSelectedNgoId(centre.ngoId);
      const target = canonicalGroupedDistricts.find(
        (d) => d.name.toLowerCase() === centre.district.toLowerCase()
      );
      if (target) {
        setSelectedDistrictId(target.id);
        setSelectedState(target.state);
      }
      setIsInspectorCollapsed(false);
      setInspectorMode('explore');
      setMobileTab('map');
    }
  }, [canonicalGroupedDistricts]);

  // Reset to All India Overview
  const handleResetCamera = useCallback(() => {
    setSelectedState(null);
    setSelectedDistrictId(null);
    setSelectedNgoId(null);
    setSelectedCentre(null);
    setSelectedBeneficiary(null);
    setIs3D(false);
  }, []);

  const renderTodayDecisions = () => {
    const prathamDec = decisions.find(d => d.id === 'dec-pratham');
    const magicBusDec = decisions.find(d => d.id === 'dec-magic-bus');
    const prathamApproved = prathamDec?.status === 'approved';
    const magicBusHeld = magicBusDec?.status === 'held';

    return (
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 select-none">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-1 border-b border-[#E3DDD0]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B4A7D] block">
              Executive Queue
            </span>
            <h3 className="font-serif text-sm font-bold text-[#181D24]">
              Pending CSR Decisions (3)
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#FDF4E3] border border-[#A86414]/30 text-[#A86414] text-[10px] font-bold">
            Action Required
          </span>
        </div>

        {/* Card 1: Pratham Pune Tranche */}
        <div
          onMouseEnter={() => {
            setSelectedDistrictId('pune');
            setSelectedState('Maharashtra');
          }}
          className="p-3 rounded-xl bg-[#FCFBF8] border border-[#E3DDD0] hover:border-[#0B4A7D] transition-all duration-150 space-y-2 shadow-2xs group"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0B4A7D]" />
                <span className="text-xs font-bold text-[#181D24]">Pratham Foundation</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E8F3EC] text-[#2E6B4E] font-bold">
                  Pune
                </span>
              </div>
              <p className="text-[11px] text-[#646058] mt-1 leading-relaxed">
                96/100 audit score · 99.4% GPS match; +₹1,600/mo verified income lift.
              </p>
            </div>
            <span className="text-xs font-bold text-[#0B4A7D] font-mono whitespace-nowrap">
              ₹40 L Tranche 2
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#E3DDD0]/50 text-xs">
            <span className="text-[10px] text-[#8C8479]">Milestone M6 Cleared</span>
            {prathamApproved ? (
              <span className="px-2 py-0.5 rounded-lg bg-[#E8F3EC] text-[#2E6B4E] font-bold text-xs flex items-center gap-1">
                <Check size={13} strokeWidth={2.5} /> Approved ✓
              </span>
            ) : (
              <button
                type="button"
                disabled={approvingPratham}
                onClick={(e) => {
                  e.stopPropagation();
                  setApprovingPratham(true);
                  setTimeout(() => {
                    approveTranche('dec-pratham');
                    setApprovingPratham(false);
                    setReserveToast('₹40 L Tranche released to Pratham Foundation HDFC Escrow account.');
                    setTimeout(() => setReserveToast(null), 3000);
                  }, 350);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0B4A7D] text-white font-semibold text-xs hover:bg-[#083A63] transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                {approvingPratham ? 'Releasing...' : 'Release ₹40 L'}
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Magic Bus Thane Audit Hold */}
        <div
          onClick={() => {
            setSelectedDistrictId('thane');
            setSelectedState('Maharashtra');
          }}
          className="p-3 rounded-xl bg-[#FCFBF8] border border-[#B42318]/30 hover:border-[#B42318] transition-all duration-150 space-y-2 shadow-2xs cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B42318]" />
                <span className="text-xs font-bold text-[#181D24]">Magic Bus (Thane)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FCECEB] text-[#B42318] font-bold">
                  Audit Hold
                </span>
              </div>
              <p className="text-[11px] text-[#646058] mt-1 leading-relaxed">
                Audit flagged 74/100 · 142 GPS coordinate anomalies in Kalwa.
              </p>
            </div>
            <span className="text-xs font-bold text-[#B42318] font-mono whitespace-nowrap">
              ₹35 L at Risk
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#E3DDD0]/50 text-xs">
            <span className="text-[10px] text-[#B42318]">Click to inspect Thane flags</span>
            {magicBusHeld ? (
              <span className="px-2 py-0.5 rounded-lg bg-[#FCECEB] text-[#B42318] font-bold text-xs flex items-center gap-1">
                <Check size={13} strokeWidth={2.5} /> On Hold ✓
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  holdTranche('dec-magic-bus');
                  setSelectedDistrictId('thane');
                  setSelectedState('Maharashtra');
                  setReserveToast('Magic Bus Thane escrow placed on formal audit hold.');
                  setTimeout(() => setReserveToast(null), 3000);
                }}
                className="px-2.5 py-1 rounded-lg border border-[#B42318] bg-[#FCECEB] text-[#B42318] font-semibold text-xs hover:bg-[#B42318] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                Review &amp; Hold
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Unspent Corpus Reserve */}
        <div
          onClick={() => {
            handleLayerChange('service_gaps');
          }}
          className="p-3 rounded-xl bg-[#FCFBF8] border border-[#E3DDD0] hover:border-[#A86414] transition-all duration-150 space-y-2 shadow-2xs cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A86414]" />
                <span className="text-xs font-bold text-[#181D24]">FY25 Statutory Reserve</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FDF4E3] text-[#A86414] font-bold">
                  128 Days Left
                </span>
              </div>
              <p className="text-[11px] text-[#646058] mt-1 leading-relaxed">
                ₹3.6 Cr unallocated. 3 high-need rural blocks in Chhindwara, Pune Rural &amp; Coimbatore ready for deployment.
              </p>
            </div>
            <span className="text-xs font-bold text-[#A86414] font-mono whitespace-nowrap">
              ₹3.6 Cr Ready
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#E3DDD0]/50 text-xs">
            <span className="text-[10px] text-[#646058]">Statutory March 31 Deadline</span>
            <span className="text-xs font-semibold text-[#0B4A7D] group-hover:underline flex items-center gap-0.5">
              View Service Gaps →
            </span>
          </div>
        </div>

        {/* Live Field Activity Stream */}
        <div className="p-3 rounded-xl bg-[#F6F3EC] border border-[#E3DDD0] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2E6B4E] animate-pulse" />
              <span className="text-xs font-bold text-[#181D24]">Live Field Activity</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#E8F3EC] text-[#2E6B4E]">
              Pratham Pune Node Live
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E3DDD0] text-center">
            <div className="p-1.5 rounded-lg bg-[#FCFBF8] border border-[#E3DDD0]/60">
              <span className="text-[8px] text-[#8C8479] uppercase font-bold block">SYNCED M6</span>
              <span className="text-xs font-bold text-[#2E6B4E] tabular-nums font-mono">
                {fieldErpPulse.syncedSurveysCount}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#FCFBF8] border border-[#E3DDD0]/60">
              <span className="text-[8px] text-[#8C8479] uppercase font-bold block">ATTENDANCE</span>
              <span className="text-xs font-bold text-[#181D24] tabular-nums">
                {fieldErpPulse.weeklyAttendancePct}%
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#FCFBF8] border border-[#E3DDD0]/60">
              <span className="text-[8px] text-[#8C8479] uppercase font-bold block">PENDING QA</span>
              <span className="text-xs font-bold text-[#A86414] tabular-nums font-mono">
                {fieldErpPulse.pendingQACount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-[calc(100dvh-56px)] lg:h-[calc(100dvh-56px)] flex flex-col bg-[#F3EFE6] select-none">
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

      {/* ── DESKTOP 56px SLIM EXECUTIVE STRIP (Desktop lg:) ── */}
      <div className="hidden lg:flex h-14 bg-[#FCFBF8] border-b border-[#E3DDD0] px-5 items-center justify-between z-20 relative flex-shrink-0 select-none">
        {/* Stat 1: Disbursement & Sparkline */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E8F3EC] flex items-center justify-center text-[#2E6B4E] font-bold text-xs flex-shrink-0">
            ₹
          </div>
          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs font-bold text-[#181D24] flex items-center gap-1.5">
                <span>₹38.4 of ₹42.0 Cr used</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E8F3EC] text-[#2E6B4E]">91.4%</span>
              </div>
              <span className="text-[10px] text-[#646058] block">Disbursed on milestone delivery</span>
            </div>
            {/* Inline Tufte SVG Sparkline */}
            <svg width="44" height="18" viewBox="0 0 44 18" className="stroke-[#2E6B4E] fill-none stroke-[1.8] flex-shrink-0">
              <polyline points="2,14 14,11 26,7 40,2" />
              <circle cx="40" cy="2" r="2.5" className="fill-[#2E6B4E]" />
            </svg>
          </div>
        </div>

        <div className="h-6 w-px bg-[#E3DDD0]" />

        {/* Stat 2: Total Reach */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0B4A7D]/10 flex items-center justify-center text-[#0B4A7D] font-bold text-xs flex-shrink-0">
            👥
          </div>
          <div>
            <div className="text-xs font-bold text-[#181D24]">42,850 women reached</div>
            <span className="text-[10px] text-[#646058] block">28.4k Business · 14.4k Reading</span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#E3DDD0]" />

        {/* Stat 3: Partner Health */}
        <div
          onClick={() => {
            setSelectedDistrictId('thane');
            setSelectedState('Maharashtra');
            setInspectorMode('explore');
          }}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
          title="Click to inspect Thane Audit Hold"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FCECEB] flex items-center justify-center text-[#B42318] font-bold text-xs flex-shrink-0">
            ⚠️
          </div>
          <div>
            <div className="text-xs font-bold text-[#181D24] flex items-center gap-1">
              <span>5 of 6 partners on track</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FCECEB] text-[#B42318]">1 Hold</span>
            </div>
            <span className="text-[10px] text-[#B42318] block hover:underline">Magic Bus Thane on audit hold →</span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#E3DDD0]" />

        {/* Stat 4: Unplaced Corpus Urgency */}
        <div
          onClick={() => {
            handleLayerChange('service_gaps');
            setInspectorMode('explore');
          }}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
          title="Click to view Service Gaps"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FDF4E3] flex items-center justify-center text-[#A86414] font-bold text-xs flex-shrink-0">
            ⏳
          </div>
          <div>
            <div className="text-xs font-bold text-[#181D24] flex items-center gap-1">
              <span>₹3.6 Cr unplaced</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FDF4E3] text-[#A86414]">128 days left</span>
            </div>
            <span className="text-[10px] text-[#646058] block hover:underline">Unserved rural blocks ready →</span>
          </div>
        </div>
      </div>

      {/* ── MOBILE 2×2 COMPACT KPI STRIP (< lg) ── */}
      <div className="lg:hidden grid grid-cols-2 gap-2 p-2.5 bg-[#FCFBF8] border-b border-[#E3DDD0]">
        <div className="p-2 rounded-xl bg-[#EFECE4]/60 border border-[#E3DDD0]">
          <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">DISBURSEMENT</span>
          <div className="text-xs font-bold text-[#181D24]">₹38.4 / 42.0 Cr (91.4%)</div>
          <span className="text-[9px] text-[#2E6B4E]">On track Q4</span>
        </div>
        <div className="p-2 rounded-xl bg-[#EFECE4]/60 border border-[#E3DDD0]">
          <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">TOTAL REACH</span>
          <div className="text-xs font-bold text-[#181D24]">42,850 women</div>
          <span className="text-[9px] text-[#646058]">28.4k Biz · 14.4k Lit</span>
        </div>
        <div
          onClick={() => {
            setSelectedDistrictId('thane');
            setSelectedState('Maharashtra');
            setMobileTab('map');
            setInspectorMode('explore');
          }}
          className="p-2 rounded-xl bg-[#FCECEB]/80 border border-[#B42318]/30 cursor-pointer"
        >
          <span className="text-[9px] uppercase font-bold text-[#B42318] tracking-wider block">HEALTH</span>
          <div className="text-xs font-bold text-[#181D24]">5 of 6 on track</div>
          <span className="text-[9px] text-[#B42318] font-bold">1 Audit Hold (Thane)</span>
        </div>
        <div
          onClick={() => {
            handleLayerChange('service_gaps');
            setMobileTab('map');
            setInspectorMode('explore');
          }}
          className="p-2 rounded-xl bg-[#FDF4E3]/80 border border-[#A86414]/30 cursor-pointer"
        >
          <span className="text-[9px] uppercase font-bold text-[#A86414] tracking-wider block">UNPLACED CORPUS</span>
          <div className="text-xs font-bold text-[#181D24]">₹3.6 Cr unplaced</div>
          <span className="text-[9px] text-[#A86414] font-bold">128 days remaining</span>
        </div>
      </div>

      {/* ── MOBILE SINGLE SEGMENTED TOGGLE (< lg) ── */}
      <div className="lg:hidden px-3 py-2 bg-[#FCFBF8] border-b border-[#E3DDD0] flex items-center">
        <div className="w-full bg-[#EFECE4] p-0.5 rounded-xl flex items-center text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMobileTab('today')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              mobileTab === 'today'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#646058] hover:text-[#181D24]'
            }`}
          >
            Today (3)
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab('map');
              setInspectorMode('explore');
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#646058] hover:text-[#181D24]'
            }`}
          >
            Spatial Map
          </button>
        </div>
      </div>

      {/* ── MOBILE TODAY DECISIONS VIEW (Only on mobile when mobileTab === 'today') ── */}
      {mobileTab === 'today' && (
        <div className="lg:hidden flex-1 overflow-y-auto">
          {renderTodayDecisions()}
        </div>
      )}

      {/* ── SPATIAL MAP WORKBENCH & INSPECTOR WRAPPER ── */}
      <div className={`relative w-full flex-1 min-h-0 overflow-hidden ${mobileTab === 'today' ? 'hidden lg:block' : 'flex'} flex-col lg:block`}>

      {/* ── TABLE VIEW (Full Overlay Matrix) ── */}
      {viewMode === 'table' && (
        <div className="absolute inset-0 z-40 bg-[#F6F3EC] overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3DDD0] pb-3">
              <div>
                <h1 className="font-narrative text-xl font-bold text-[#181D24]">
                  District Comparative Summary Matrix
                </h1>
                <p className="text-xs text-[#646058] mt-0.5">
                  6 Canonical Operating Districts across Maharashtra, MP, and Tamil Nadu
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('map')}
                className="px-3.5 py-1.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MapIcon size={13} />
                <span>← Back to Spatial Map</span>
              </button>
            </div>

            <div className="rounded-2xl bg-[#FCFBF8] border border-[#E3DDD0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EFECE4] border-b border-[#E3DDD0] text-[#646058] text-[10px] uppercase font-bold tracking-wider">
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
                  <tbody className="divide-y divide-[#E3DDD0]/70">
                    {canonicalGroupedDistricts.map((dist) => (
                      <tr key={dist.id} className="hover:bg-[#EFECE4]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#181D24] flex items-center gap-1.5">
                            <span>{dist.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EEEAE0] text-[#646058] font-normal">
                              {dist.tier}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#646058]">{dist.state}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#181D24] block">{dist.leadNgo}</span>
                          <span className="text-[10px] text-[#646058]">{dist.ngosCount} Active NGO{dist.ngosCount > 1 ? 's' : ''}</span>
                        </td>

                        <td className="py-3 px-3 text-[#646058]">
                          {dist.programFocus}
                        </td>

                        <td className="py-3 px-3 text-right font-medium text-[#181D24] tabular-nums">
                          {dist.totalWomen.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-3 text-right font-medium text-[#181D24] tabular-nums">
                          ₹{dist.totalDisbursedCr.toFixed(1)} Cr
                        </td>

                        <td className="py-3 px-3 text-right font-medium text-[#181D24] tabular-nums">
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
                            className="px-2.5 py-1 rounded-lg border border-[#E3DDD0] text-[#0B4A7D] hover:bg-[#0B4A7D] hover:text-white transition-all text-xs font-semibold cursor-pointer"
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
          </div>
        </div>
      )}

      {/* ── TOP NAVIGATION (Normal Flow on Mobile < lg, Floating Pill on Desktop lg:) ── */}
      <nav
        aria-label="Spatial Breadcrumb Navigation"
        className="relative w-full z-20 flex items-center justify-between gap-2 bg-[#FCFBF8] border-b border-[#E3DDD0] px-3 py-2 text-xs text-[#181D24] overflow-x-auto no-scrollbar lg:absolute lg:top-4 lg:left-4 lg:z-30 lg:w-auto lg:rounded-2xl lg:shadow-md lg:border lg:py-1.5 lg:bg-[#FCFBF8]/95 lg:backdrop-blur-md"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={handleResetCamera}
            className={`hover:text-[#0B4A7D] cursor-pointer whitespace-nowrap ${
              !selectedState && !selectedDistrictId ? 'font-bold text-[#0B4A7D]' : 'text-[#646058]'
            }`}
          >
            All India
          </button>

          {selectedState && (
            <>
              <ChevronRight size={12} className="text-[#A8A29E] flex-shrink-0" />
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrictId(null);
                  setSelectedCentre(null);
                  setSelectedBeneficiary(null);
                }}
                className={`hover:text-[#0B4A7D] cursor-pointer whitespace-nowrap ${
                  !selectedDistrictId ? 'font-bold text-[#0B4A7D]' : 'text-[#646058]'
                }`}
              >
                {selectedState}
              </button>
            </>
          )}

          {selectedDistrictId && activeDistrictSummary && (
            <>
              <ChevronRight size={12} className="text-[#A8A29E] flex-shrink-0" />
              <button
                type="button"
                onClick={() => {
                  setSelectedCentre(null);
                  setSelectedBeneficiary(null);
                }}
                className={`hover:text-[#0B4A7D] cursor-pointer whitespace-nowrap ${
                  !selectedCentre ? 'font-bold text-[#0B4A7D]' : 'text-[#646058]'
                }`}
              >
                {activeDistrictSummary.name}
              </button>
            </>
          )}

          {selectedCentre && (
            <>
              <ChevronRight size={12} className="text-[#A8A29E] flex-shrink-0" />
              <button
                type="button"
                onClick={() => setSelectedBeneficiary(null)}
                className={`hover:text-[#0B4A7D] cursor-pointer whitespace-nowrap truncate max-w-[120px] sm:max-w-[180px] ${
                  !selectedBeneficiary ? 'font-bold text-[#0B4A7D]' : 'text-[#646058]'
                }`}
              >
                {selectedCentre.name}
              </button>
            </>
          )}

          {selectedBeneficiary && (
            <>
              <ChevronRight size={12} className="text-[#A8A29E] flex-shrink-0" />
              <span className="font-bold text-[#0B4A7D] whitespace-nowrap truncate max-w-[140px]">
                #{selectedBeneficiary.token}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-px h-3.5 bg-[#E3DDD0] flex-shrink-0 mx-0.5" />

          {/* Compact Programme Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value as any)}
              className="appearance-none bg-transparent pr-4 text-xs font-medium text-[#181D24] hover:text-[#0B4A7D] focus:outline-none cursor-pointer"
            >
              <option value="all">All Programmes</option>
              <option value="micro-skilling">Micro-Skilling</option>
              <option value="literacy">Women's Literacy</option>
            </select>
            <ChevronDown size={11} className="absolute right-0 top-1 text-[#A8A29E] pointer-events-none" />
          </div>
        </div>
      </nav>

      {/* ── MAP CANVAS (44dvh Stacked on Mobile < lg, Full-Bleed Inset on Desktop lg:) ── */}
      <div className="relative w-full h-[44dvh] min-h-[280px] flex-shrink-0 lg:absolute lg:inset-0 lg:w-full lg:h-full lg:z-0">
        <SpatialMap
          selectedDistrictId={selectedDistrictId}
          selectedState={selectedState}
          selectedNgoId={selectedNgoId}
          selectedCentre={selectedCentre}
          activeLayer={activeLayer}
          is3D={is3D}
          isInspectorCollapsed={isInspectorCollapsed}
          onToggle3D={() => setIs3D(!is3D)}
          showInternalControls={false}
          onSelectDistrict={handleSelectDistrict}
          onSelectState={setSelectedState}
          onSelectNgo={setSelectedNgoId}
          onSelectCentre={handleSelectCentre}
          onNavigateToAudit={() => onNavigate?.('operations')}
        />
      </div>

      {/* ── LENS DOCK (Stacked Scrollable on Mobile < lg, Floating Center on Desktop lg:) ── */}
      <div
        className={`relative w-full z-20 flex items-center justify-between sm:justify-center gap-1.5 bg-[#FCFBF8] border-y border-[#E3DDD0] px-3 py-1.5 text-xs whitespace-nowrap overflow-x-auto no-scrollbar lg:absolute lg:bottom-4 lg:z-30 lg:w-auto lg:border lg:rounded-2xl lg:shadow-lg lg:p-1.5 lg:bg-[#FCFBF8]/95 lg:backdrop-blur-md lg:transition-[left] lg:duration-300 lg:-translate-x-1/2 ${
          isInspectorCollapsed
            ? 'lg:left-1/2'
            : 'lg:left-[calc((100%-392px)/2)]'
        }`}
      >
        {/* 3 Lens Pills with Glide Indicator */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleLayerChange('outcomes')}
            className={`relative px-2.5 py-1 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeLayer === 'outcomes' ? 'text-white' : 'text-[#646058] hover:text-[#181D24]'
            }`}
          >
            {activeLayer === 'outcomes' && (
              <motion.div
                layoutId="lens-dock-pill-active"
                className="absolute inset-0 bg-[#2E6B4E] rounded-xl shadow-2xs z-0"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <TrendingUp size={12} className="relative z-10" />
            <span className="relative z-10">Outcomes</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayerChange('cost_efficiency')}
            className={`relative px-2.5 py-1 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeLayer === 'cost_efficiency' ? 'text-white' : 'text-[#646058] hover:text-[#181D24]'
            }`}
          >
            {activeLayer === 'cost_efficiency' && (
              <motion.div
                layoutId="lens-dock-pill-active"
                className="absolute inset-0 bg-[#0B4A7D] rounded-xl shadow-2xs z-0"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 font-bold">₹</span>
            <span className="relative z-10">Cost / SROI</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayerChange('service_gaps')}
            className={`relative px-2.5 py-1 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeLayer === 'service_gaps' ? 'text-white' : 'text-[#646058] hover:text-[#181D24]'
            }`}
          >
            {activeLayer === 'service_gaps' && (
              <motion.div
                layoutId="lens-dock-pill-active"
                className="absolute inset-0 bg-[#B5532A] rounded-xl shadow-2xs z-0"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <AlertTriangle size={12} className="relative z-10" />
            <span className="relative z-10">Service Gaps</span>
          </button>
        </div>

        {/* Formula Popover Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFormulaOpen(!formulaOpen)}
            className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              formulaOpen
                ? 'bg-[#0B4A7D] text-white border-[#0B4A7D]'
                : 'bg-[#EFECE4] text-[#646058] border-[#E3DDD0] hover:text-[#181D24]'
            }`}
            title="Composite Impact Index Formula"
          >
            <Info size={12} />
          </button>

          {formulaOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-10 z-40 w-72 p-3.5 rounded-xl bg-[#FCFBF8] border border-[#E3DDD0] shadow-2xl text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#E3DDD0] pb-1.5">
                <span className="font-bold text-[#181D24]">Composite Impact Formula</span>
                <button
                  type="button"
                  onClick={() => setFormulaOpen(false)}
                  className="text-[#8C8479] hover:text-[#181D24] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-2 rounded-lg bg-[#EFECE4] font-mono text-[10px] text-[#181D24] space-y-0.5">
                <div>0.40 × Completion Rate (%)</div>
                <div>+ 0.30 × SROI Multiplier</div>
                <div>+ 0.20 × Audit Integrity Score</div>
                <div>+ 0.10 × GPS Verification Rate</div>
              </div>
              <p className="text-[10px] text-[#646058]">
                Pune District Mean: <strong className="text-[#181D24]">82.0</strong> · Portfolio Benchmark: <strong className="text-[#181D24]">76.8</strong>.
              </p>
            </div>
          )}
        </div>

        <span className="w-px h-4 bg-[#E3DDD0]" />

        {/* 2D / 3D Buildings Toggle */}
        <button
          type="button"
          onClick={() => setIs3D(!is3D)}
          className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
            is3D
              ? 'bg-[#0B4A7D] text-white border-[#0B4A7D] shadow-2xs'
              : 'bg-[#EFECE4] text-[#181D24] border-[#E3DDD0] hover:border-[#0B4A7D]'
          }`}
          title="Toggle 2D Map vs 3D Architectural Buildings"
        >
          <Building2 size={12} />
          <span>{is3D ? '3D' : '2D'}</span>
        </button>

        {/* Reset Camera Button */}
        <button
          type="button"
          onClick={handleResetCamera}
          className="p-1.5 rounded-xl bg-[#EFECE4] border border-[#E3DDD0] text-[#646058] hover:text-[#181D24] hover:border-[#0B4A7D] transition-all cursor-pointer"
          title="Reset to All India View"
        >
          <RotateCcw size={12} />
        </button>

        <span className="w-px h-4 bg-[#E3DDD0]" />

        {/* Table View Toggle */}
        <button
          type="button"
          onClick={() => setViewMode('table')}
          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#EFECE4] border border-[#E3DDD0] text-[#181D24] hover:border-[#0B4A7D] transition-all cursor-pointer flex items-center gap-1"
          title="Open District Comparative Table"
        >
          <TableIcon size={12} />
          <span>Table</span>
        </button>
      </div>

      {/* ── COLLAPSED FLOATING TRIGGER BUTTON (Desktop Only) ── */}
      {isInspectorCollapsed && (
        <button
          type="button"
          onClick={() => setIsInspectorCollapsed(false)}
          className="hidden lg:flex absolute top-4 right-4 z-20 px-3 py-2 rounded-2xl bg-[#FCFBF8]/95 backdrop-blur-md border border-[#E3DDD0] text-xs font-semibold text-[#181D24] shadow-md hover:border-[#0B4A7D] items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
        >
          <span>Inspect Panel</span>
          <ChevronLeft size={14} className="text-[#0B4A7D]" />
        </button>
      )}

      {/* ── ACTIVE CHAPTER INSPECTOR (Normal Flow on Mobile < lg, Floating Right on Desktop lg:) ── */}
      <aside
        className={`relative w-full bg-[#FCFBF8] flex-1 flex flex-col border-t border-[#E3DDD0] lg:border-t-0 lg:absolute lg:top-4 lg:right-4 lg:bottom-4 lg:w-[376px] lg:z-30 lg:bg-[#FCFBF8]/95 lg:backdrop-blur-md lg:border lg:border-[#E3DDD0] lg:rounded-2xl lg:shadow-xl lg:max-h-[calc(100%-32px)] lg:overflow-hidden ${
          isInspectorCollapsed ? 'lg:hidden' : 'lg:flex'
        }`}
      >
        {/* Desktop Top Inspector Mode Toggle (Hidden on mobile < lg so there is strictly ONE toggle!) */}
        <div className="hidden lg:flex p-2.5 border-b border-[#E3DDD0] bg-[#FCFBF8] items-center justify-between flex-shrink-0">
          <div className="bg-[#EFECE4] p-0.5 rounded-xl flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInspectorMode('today')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                inspectorMode === 'today'
                  ? 'bg-[#0B4A7D] text-white shadow-2xs'
                  : 'text-[#646058] hover:text-[#181D24]'
              }`}
            >
              Today (3)
            </button>
            <button
              type="button"
              onClick={() => setInspectorMode('explore')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                inspectorMode === 'explore'
                  ? 'bg-[#0B4A7D] text-white shadow-2xs'
                  : 'text-[#646058] hover:text-[#181D24]'
              }`}
            >
              Explore Map
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsInspectorCollapsed(true)}
            className="p-1 rounded-md text-[#8C8479] hover:text-[#181D24] hover:bg-[#EFECE4] transition-colors cursor-pointer"
            title="Hide Inspector"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {inspectorMode === 'today' ? (
          renderTodayDecisions()
        ) : (
          <>
            {/* ── CHAPTER 1: TERRITORY OVERVIEW ── */}
            {activeChapter === 1 && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="p-3.5 border-b border-[#E3DDD0] flex items-center justify-between bg-[#EFECE4]/50 flex-shrink-0">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C8479] tracking-wider block">
                      Territory Overview
                    </span>
                    <h2 className="font-serif text-sm font-bold text-[#181D24]">
                      Operating Footprint ({filteredDistricts.length} Districts)
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsInspectorCollapsed(true)}
                    className="hidden lg:flex px-2 py-1 rounded-lg text-xs font-medium text-[#646058] hover:text-[#181D24] hover:bg-[#EFECE4] transition-colors cursor-pointer items-center gap-0.5"
                    title="Hide Inspector"
                  >
                    <span>Hide</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                  {/* 3-State Filter Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479] block">
                      Filter by State Territory
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setSelectedState(selectedState === 'Maharashtra' ? null : 'Maharashtra')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          selectedState === 'Maharashtra'
                            ? 'bg-[#0B4A7D] text-white shadow-2xs'
                            : 'bg-[#EFECE4] text-[#181D24] border border-[#E3DDD0] hover:border-[#0B4A7D]'
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
                            : 'bg-[#EFECE4] text-[#181D24] border border-[#E3DDD0] hover:border-[#2E6B4E]'
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
                            : 'bg-[#EFECE4] text-[#181D24] border border-[#E3DDD0] hover:border-[#B5532A]'
                        }`}
                      >
                        TN · 7.6k
                      </button>
                    </div>
                  </div>

                  {/* 6 District Cards */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479] block">
                      Canonical Operating Districts
                    </span>

                    <div className="space-y-1.5">
                      {filteredDistricts.map((dist) => (
                        <div
                          key={dist.id}
                          data-testid={`district-card-${dist.id}`}
                          onClick={() => {
                            setSelectedDistrictId(dist.id);
                            setSelectedState(dist.state);
                          }}
                          className="p-3 rounded-xl bg-[#EFECE4]/60 border border-[#E3DDD0] hover:border-[#0B4A7D] hover:bg-[#FCFBF8] transition-all duration-100 active:scale-[0.99] cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#181D24] group-hover:text-[#0B4A7D] transition-colors">
                                {dist.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E3DDD0] text-[#646058]">
                                {dist.tier}
                              </span>
                              {dist.auditStatus === 'flagged' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FCECEB] text-[#B42318] font-bold">
                                  Audit Hold
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#646058] truncate block">
                              {dist.leadNgo} · {dist.totalWomen.toLocaleString('en-IN')} women
                            </span>
                          </div>

                          <div className="text-right flex-shrink-0 flex items-center gap-2">
                            <div>
                              <span className="text-[9px] text-[#8C8479] block font-mono">IMPACT</span>
                              <span className="font-bold text-xs text-[#0B4A7D] tabular-nums font-mono">
                                {dist.weightedImpact}
                              </span>
                            </div>
                            <ChevronRight size={14} className="text-[#8C8479] group-hover:text-[#0B4A7D] transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CHAPTER 2: DISTRICT STORY (When a district is selected) ── */}
            {activeChapter === 2 && activeDistrictSummary && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="p-3.5 border-b border-[#E3DDD0] flex items-start justify-between bg-[#EFECE4]/50 flex-shrink-0">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-[#0B4A7D]" />
                      <h2 data-testid="district-story-heading" className="font-serif text-base font-bold text-[#181D24]">
                        {activeDistrictSummary.name} District
                      </h2>
                      <span className="text-[9px] font-semibold text-[#646058] bg-[#E3DDD0] px-1.5 py-0.2 rounded">
                        {activeDistrictSummary.tier}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#646058] mt-0.5">
                      {activeDistrictSummary.state} · {activeDistrictSummary.leadNgo}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDistrictId(null);
                        setSelectedCentre(null);
                      }}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-[#646058] hover:text-[#181D24] hover:bg-[#EFECE4] transition-colors cursor-pointer"
                      title="Return to Territory Overview"
                    >
                      ← Territory
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInspectorCollapsed(true)}
                      className="hidden lg:flex p-1 text-[#8C8479] hover:text-[#181D24] cursor-pointer"
                      title="Hide Inspector"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {/* 4-Metric Strip */}
                <div className="p-3 border-b border-[#E3DDD0] grid grid-cols-4 gap-1.5 text-center bg-[#FCFBF8] flex-shrink-0">
                  <div className="p-1.5 rounded-lg bg-[#EFECE4]/60">
                    <span className="text-[8px] text-[#8C8479] uppercase block font-semibold">PARTNERS</span>
                    <span className="text-[11px] font-bold text-[#181D24]">{activeDistrictSummary.ngosCount} NGOs</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFECE4]/60">
                    <span className="text-[8px] text-[#8C8479] uppercase block font-semibold">WOMEN</span>
                    <span className="text-[11px] font-bold text-[#181D24] tabular-nums">
                      {activeDistrictSummary.totalWomen.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFECE4]/60">
                    <span className="text-[8px] text-[#8C8479] uppercase block font-semibold">DISTRICT</span>
                    <span className="text-[11px] font-bold text-[#0B4A7D] tabular-nums">
                      {activeDistrictSummary.weightedImpact}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFECE4]/60">
                    <span className="text-[8px] text-[#8C8479] uppercase block font-semibold">BENCHMARK</span>
                    <span className="text-[11px] font-bold text-[#2E6B4E] tabular-nums">
                      {portfolioBenchmarks.portfolioWeightedMean}
                    </span>
                  </div>
                </div>

                {/* 3 Focused Sub-Tabs */}
                <div className="px-3 pt-2 pb-1 border-b border-[#E3DDD0] flex items-center gap-1 bg-[#FCFBF8] flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setDistrictSubTab('ngos')}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      districtSubTab === 'ngos'
                        ? 'bg-[#0B4A7D] text-white shadow-2xs'
                        : 'text-[#646058] hover:bg-[#EFECE4]'
                    }`}
                  >
                    NGOs ({activeDistrictAllocations.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setDistrictSubTab('centres')}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      districtSubTab === 'centres'
                        ? 'bg-[#0B4A7D] text-white shadow-2xs'
                        : 'text-[#646058] hover:bg-[#EFECE4]'
                    }`}
                  >
                    Centres ({activeCentres.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setDistrictSubTab('gaps')}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      districtSubTab === 'gaps'
                        ? 'bg-[#B5532A] text-white shadow-2xs'
                        : 'text-[#646058] hover:bg-[#EFECE4]'
                    }`}
                  >
                    Gaps ({districtServiceGaps.length})
                  </button>
                </div>

                {/* Sub-Tab Body */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                  {/* Sub-tab 1: NGOs Peer Benchmark Bars */}
                  {districtSubTab === 'ngos' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#646058]">
                        <span className="font-semibold text-[#181D24]">{activeDistrictSummary.name} Peer Comparison</span>
                        <span className="text-[10px]">Benchmark: {portfolioBenchmarks.portfolioWeightedMean}</span>
                      </div>

                      <div className="space-y-2.5">
                        {activeDistrictAllocations.map((alloc) => {
                          const isLeader = alloc.impactIndex >= activeDistrictSummary.weightedImpact;
                          const isSpotlighted = selectedNgoId === alloc.ngoId;
                          const ngoColor = getNgoColor(alloc.ngoId, activeDistrictSummary.id);
                          return (
                            <div
                              key={alloc.id}
                              onClick={() => {
                                // Toggle 1-Click NGO Spotlight Filter
                                setSelectedNgoId(isSpotlighted ? null : alloc.ngoId);
                              }}
                              className={`p-2.5 rounded-xl transition-all cursor-pointer space-y-1.5 ${
                                isSpotlighted
                                  ? 'bg-[#FCFBF8] border-2 shadow-sm'
                                  : 'bg-[#EFECE4]/50 border border-[#E3DDD0] hover:border-[#0B4A7D] hover:bg-[#FCFBF8]'
                              }`}
                              style={{
                                borderColor: isSpotlighted ? ngoColor : undefined,
                              }}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#181D24] flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ngoColor }} />
                                  <span>{alloc.ngoName}</span>
                                  {isSpotlighted && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold text-white shadow-2xs" style={{ backgroundColor: ngoColor }}>
                                      Spotlight Active
                                    </span>
                                  )}
                                  {isLeader && !isSpotlighted && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#E8F3EC] text-[#2E6B4E] font-semibold">
                                      Leader
                                    </span>
                                  )}
                                </span>
                                <span className="font-bold font-mono" style={{ color: ngoColor }}>
                                  {alloc.impactIndex}/100
                                </span>
                              </div>

                              {/* Benchmark bar */}
                              <div className="w-full h-2 bg-[#E3DDD0] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${alloc.impactIndex}%`,
                                    backgroundColor: ngoColor,
                                  }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-[#646058] pt-1 border-t border-[#E3DDD0]/50">
                                <span>{alloc.women.toLocaleString('en-IN')} women</span>
                                <span>SROI: ₹{alloc.sroiMultiplier}</span>
                                <span className={alloc.auditScore < 85 ? 'text-[#B42318] font-bold' : 'text-[#2E6B4E] font-medium'}>
                                  Audit: {alloc.auditScore}/100
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[10px] text-[#646058] leading-relaxed pt-1">
                        {activeDistrictSummary.name === 'Pune' && (
                          <span>
                            Pratham leads Pune district (+2.2 pts above district mean, +7.4 pts above portfolio benchmark) with ₹3.42 SROI.
                          </span>
                        )}
                        {activeDistrictSummary.name === 'Thane' && (
                          <span className="text-[#B42318]">
                            Thane Urban cluster is on audit escrow hold pending spot re-audit of 142 GPS anomaly flags.
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Sub-tab 2: Centres List */}
                  {districtSubTab === 'centres' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#646058]">
                        <span className="font-semibold text-[#181D24]">Active Operational Hubs</span>
                        <span className="text-[10px]">Click to inspect</span>
                      </div>

                      <div className="space-y-1.5">
                        {activeCentres.map((centre) => (
                          <div
                            key={centre.id}
                            data-testid={`centre-card-${centre.id}`}
                            onClick={() => handleSelectCentre(centre)}
                            className="p-2.5 rounded-xl bg-[#EFECE4]/60 border border-[#E3DDD0] hover:border-[#0B4A7D] hover:bg-[#FCFBF8] transition-all cursor-pointer space-y-1 group"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#181D24] group-hover:text-[#0B4A7D] transition-colors truncate">
                                {centre.name}
                              </span>
                              <span
                                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                  centre.status === 'flagged' ? 'bg-[#FCECEB] text-[#B42318]' : 'bg-[#E8F3EC] text-[#2E6B4E]'
                                }`}
                              >
                                {centre.status === 'flagged' ? 'Flagged' : 'Active'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#646058]">
                              <span>{centre.beneficiaries.toLocaleString('en-IN')} women · {centre.completionPct}% completion</span>
                              <span className="font-semibold text-[#2E6B4E]">{centre.outcomeLift}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 3: Gaps & Unserved Blocks */}
                  {districtSubTab === 'gaps' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#181D24] flex items-center gap-1">
                          <AlertTriangle size={13} className="text-[#B5532A]" />
                          <span>Unserved Territory Gaps</span>
                        </span>
                        <span className="text-[10px] text-[#8C8479]">Corpus Reserve: ₹{portfolio.reserveCr.toFixed(2)} Cr</span>
                      </div>

                      {districtServiceGaps.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#EFECE4]/40 text-center text-xs text-[#646058]">
                          No unserved block gaps identified in {activeDistrictSummary.name}.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {districtServiceGaps.map((block) => (
                            <div
                              key={block.id}
                              className="p-3 rounded-xl bg-[#FDF8F5] border border-[#B5532A]/20 space-y-2"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-bold text-xs text-[#181D24] block">{block.name}</span>
                                  <span className="text-[10px] text-[#646058]">
                                    {block.unservedWomen.toLocaleString('en-IN')} unserved women · ₹{block.recommendedAllocationCr} Cr gap
                                  </span>
                                </div>
                              </div>

                              <div className="pt-1 flex items-center justify-between">
                                <span className="text-[10px] text-[#B5532A] font-medium">Recommended: ₹{block.recommendedAllocationCr} Cr</span>
                                {block.status === 'unallocated' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleEarmark(block)}
                                    className="px-2.5 py-1 rounded-lg bg-[#B5532A] text-white text-[10px] font-semibold hover:bg-[#96401E] transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
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
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── CHAPTER 3: SYNCHRONIZED CENTRE VIEW (When a Centre is Selected) ── */}
            {activeChapter === 3 && selectedCentre && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="p-3.5 border-b border-[#E3DDD0] flex items-start justify-between bg-[#EFECE4]/50 flex-shrink-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h2 data-testid="centre-story-heading" className="font-serif text-base font-bold text-[#181D24] truncate max-w-[200px]">
                        {selectedCentre.name}
                      </h2>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                          selectedCentre.status === 'flagged' ? 'bg-[#FCECEB] text-[#B42318]' : 'bg-[#E8F3EC] text-[#2E6B4E]'
                        }`}
                      >
                        {selectedCentre.status === 'flagged' ? '142 Flags' : 'Verified'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#646058]">
                      {selectedCentre.district} · {selectedCentre.state}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCentre(null)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-[#646058] hover:text-[#181D24] hover:bg-[#EFECE4] transition-colors cursor-pointer"
                      title="Back to District View"
                    >
                      ← District
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInspectorCollapsed(true)}
                      className="hidden lg:flex p-1 text-[#8C8479] hover:text-[#181D24] cursor-pointer"
                      title="Hide Inspector"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {/* Field Officer & Ward Card */}
                <div className="p-3 bg-[#FCFBF8] border-b border-[#E3DDD0] text-xs space-y-1 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8C8479] font-medium">FIELD SUPERVISOR</span>
                    <span className="font-semibold text-[#181D24]">Meera Deshmukh (Sr. Lead)</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#646058]">
                    <span>Location: Paud Road Hub</span>
                    <span className="text-[#2E6B4E] font-medium">GPS Geofence Verified ✓</span>
                  </div>
                </div>

                {/* 3 Centre Metrics */}
                <div className="p-3 border-b border-[#E3DDD0] grid grid-cols-3 gap-2 text-center bg-[#FCFBF8] flex-shrink-0">
                  <div className="p-1.5 rounded-lg bg-[#EFECE4]/60">
                    <span className="text-[8px] text-[#8C8479] uppercase block font-semibold">WOMEN</span>
                    <span className="text-xs font-bold text-[#181D24] tabular-nums">
                      {selectedCentre.beneficiaries.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFECE4]/60">
                    <span className="text-[8px] text-[#8C8479] uppercase block font-semibold">COMPLETION</span>
                    <span className="text-xs font-bold text-[#0B4A7D] tabular-nums">
                      {selectedCentre.completionPct}%
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#EFECE4]/60">
                    <span className="text-[8px] text-[#8C8479] uppercase block font-semibold">VERIFIED LIFT</span>
                    <span className="text-xs font-bold text-[#2E6B4E] tabular-nums">
                      {selectedCentre.outcomeLift}
                    </span>
                  </div>
                </div>

                {/* Sampled Beneficiary Roster (Strictly tailored to this Centre/Ward) */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#646058]">
                    <span className="font-bold text-[#181D24]">Sampled Beneficiary Roster</span>
                    <span className="text-[10px] text-[#0B4A7D] font-medium">DPDP Redacted</span>
                  </div>

                  <div className="space-y-2">
                    {centreBeneficiaries.map((ben) => (
                      <div
                        key={ben.id}
                        data-testid={`beneficiary-card-${ben.id}`}
                        onClick={() => setSelectedBeneficiary(ben)}
                        className="p-3 rounded-xl bg-[#EFECE4]/60 border border-[#E3DDD0] hover:border-[#0B4A7D] hover:bg-[#FCFBF8] transition-all cursor-pointer space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#181D24] group-hover:text-[#0B4A7D] transition-colors">
                            #{ben.token}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E8F3EC] text-[#2E6B4E] font-semibold">
                            KYC Verified ✓
                          </span>
                        </div>

                        <p className="text-[11px] text-[#646058] line-clamp-1">
                          {ben.trade}
                        </p>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#E3DDD0]/50">
                          <span className="text-[#646058]">
                            ₹{ben.baselineIncome.toLocaleString('en-IN')} → ₹{ben.currentIncome.toLocaleString('en-IN')}/mo
                          </span>
                          <span className="font-bold text-[#2E6B4E] flex items-center gap-0.5">
                            <span>+{ben.liftPct}%</span>
                            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CHAPTER 4: INDIVIDUAL IMPACT STORY (Inside Inspector Card) ── */}
            {activeChapter === 4 && selectedBeneficiary && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="p-3.5 border-b border-[#E3DDD0] flex items-start justify-between bg-[#EFECE4]/50 flex-shrink-0">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#0B4A7D] tracking-wider block">
                      Individual Impact 360°
                    </span>
                    <h2 data-testid="beneficiary-story-heading" className="font-serif text-base font-bold text-[#181D24]">
                      Beneficiary #{selectedBeneficiary.token}
                    </h2>
                    <p className="text-[10px] text-[#646058]">
                      {selectedBeneficiary.centreName} · {selectedBeneficiary.district}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedBeneficiary(null)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-[#646058] hover:text-[#181D24] hover:bg-[#EFECE4] transition-colors cursor-pointer"
                      title="Back to Centre View"
                    >
                      ← Centre
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInspectorCollapsed(true)}
                      className="hidden lg:flex p-1 text-[#8C8479] hover:text-[#181D24] cursor-pointer"
                      title="Hide Inspector"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Story Body */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                  {/* Expandable DPDP Badge (No Partial Aadhaar Digits!) */}
                  <div className="p-2.5 rounded-xl bg-[#EFECE4]/60 border border-[#E3DDD0] space-y-1">
                    <button
                      type="button"
                      onClick={() => setDpdpExplanationExpanded(!dpdpExplanationExpanded)}
                      className="w-full flex items-center justify-between text-[11px] font-semibold text-[#181D24] cursor-pointer"
                    >
                      <span className="flex items-center gap-1 text-[#0B4A7D]">
                        <Lock size={12} />
                        <span>Privacy-Protected (DPDP Act)</span>
                      </span>
                      <span className="text-[10px] text-[#8C8479]">
                        {dpdpExplanationExpanded ? '▲ Hide' : '▼ Details'}
                      </span>
                    </button>

                    {dpdpExplanationExpanded && (
                      <p className="text-[10px] text-[#646058] pt-1 leading-relaxed border-t border-[#E3DDD0]/60">
                        Under Section 8(5) of the Digital Personal Data Protection Act, 2023, direct personally identifiable information (PII) including Aadhaar numbers is tokenized with reasonable security safeguards. All records shown are verified through concurrent cryptographic hash and consent log #{selectedBeneficiary.auditRef}.
                      </p>
                    )}
                  </div>

                  {/* Before → After Impact Card */}
                  <div className="p-3.5 rounded-xl bg-[#FCFBF8] border border-[#E3DDD0] shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479] block">
                      Income Lift Verified Trajectory
                    </span>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#8C8479] block">BASELINE (M0)</span>
                        <span className="text-sm font-bold text-[#181D24] tabular-nums">
                          ₹{selectedBeneficiary.baselineIncome.toLocaleString('en-IN')}/mo
                        </span>
                      </div>

                      <ArrowRight size={16} className="text-[#A8A29E]" />

                      <div className="space-y-0.5 text-right">
                        <span className="text-[10px] text-[#8C8479] block">ENDLINE (M6)</span>
                        <span className="text-sm font-bold text-[#2E6B4E] tabular-nums">
                          ₹{selectedBeneficiary.currentIncome.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E3DDD0] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#2E6B4E]">
                        +₹{(selectedBeneficiary.currentIncome - selectedBeneficiary.baselineIncome).toLocaleString('en-IN')}/mo (+{selectedBeneficiary.liftPct}%)
                      </span>
                      <span className="text-[10px] text-[#0B4A7D] flex items-center gap-1 font-medium">
                        <QrCode size={12} />
                        <span>UPI Merchant QR Active</span>
                      </span>
                    </div>
                  </div>

                  {/* 3-Row Percentile Comparison */}
                  <div className="p-3 rounded-xl bg-[#EFECE4]/60 border border-[#E3DDD0] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479] block">
                      Comparative Percentiles
                    </span>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-[#646058]">Within Centre Cohort:</span>
                          <span className="font-bold text-[#0B4A7D] font-mono">{selectedBeneficiary.percentiles.withinCentre}th</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E3DDD0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0B4A7D] rounded-full" style={{ width: `${selectedBeneficiary.percentiles.withinCentre}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-[#646058]">Within District ({selectedBeneficiary.district}):</span>
                          <span className="font-bold text-[#2E6B4E] font-mono">{selectedBeneficiary.percentiles.withinDistrict}th</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E3DDD0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#2E6B4E] rounded-full" style={{ width: `${selectedBeneficiary.percentiles.withinDistrict}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-[#646058]">Bajaj Portfolio (42,850 Total):</span>
                          <span className="font-bold text-[#181D24] font-mono">{selectedBeneficiary.percentiles.withinPortfolio}th</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E3DDD0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#181D24] rounded-full" style={{ width: `${selectedBeneficiary.percentiles.withinPortfolio}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Verified Milestones */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479] block">
                      Verified Milestones
                    </span>
                    <div className="space-y-1">
                      {selectedBeneficiary.milestones.map((m, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-[#FCFBF8] border border-[#E3DDD0] text-xs flex items-center justify-between"
                        >
                          <span className="text-[#181D24] flex items-center gap-1.5 text-[11px] font-medium">
                            <CheckCircle2 size={12} className={m.completed ? 'text-[#2E6B4E]' : 'text-[#B42318]'} />
                            <span>{m.name}</span>
                          </span>
                          <span className="text-[10px] text-[#8C8479] font-mono">{m.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Back Button */}
                <div className="p-3 border-t border-[#E3DDD0] bg-[#FCFBF8] flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedBeneficiary(null)}
                    className="w-full py-2 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                  >
                    ← Back to {selectedBeneficiary.centreName}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  </div>
);
};
