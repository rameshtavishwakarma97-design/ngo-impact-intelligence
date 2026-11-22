import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// ─── TYPES & INTERFACES ────────────────────────────────────────────────────────

export type ProgramType = 'micro-skilling' | 'literacy';
export type RegionalTier = 'Metro' | 'Tier-2' | 'Rural';
export type AuditStatus = 'verified' | 'caution' | 'flagged';

export interface LongitudinalPoint {
  wave: 'M0' | 'M3' | 'M6' | 'M12';
  value: number;
  ciLow: number;
  ciHigh: number;
  pctLift: number;
}

export interface FunnelStages {
  joined: number;      // 100
  finished: number;    // e.g. 94
  opened: number;      // e.g. 78
  earning1Yr: number;  // e.g. 64
  dropoffFinishedToOpenedReason?: string;
  dropoffOpenedTo1YrReason?: string;
}

export interface NGOStoreRecord {
  ngoId: string;
  ngoName: string;
  tenderId: string;
  state: string;
  district: string;
  tier: RegionalTier;
  program: ProgramType;

  // Financials
  grantAllocated: number; // in INR
  grantDisbursed: number; // in INR (updates dynamically on tranche approval)
  utilizationRate: number; // %
  costPerOutcome: number; // Cost per verified graduate
  sroiMultiplier: number; // ₹ return per ₹1 grant
  pendingTranche: number; // in INR
  pendingTrancheAction: string;
  trancheApproved?: boolean;
  trancheHeld?: boolean;

  // Scale & Verification
  enrolled: number;
  retained: number; // Verified at M6
  dropoutRate: number;
  topDropoutReason: string;

  // Impact & Econometrics
  baselineVal: number;
  endlineVal: number;
  m12Val: number;
  extraMonthlyIncome: number; // Extra monthly INR for micro-skilling, or pts for literacy
  rawLiftPct: number;
  baselineNormalizedLiftPct: number;
  controlM0: number;
  controlM6: number;
  didNetAttributableLiftPct: number;
  pValue: number;
  isStatisticallySignificant: boolean;

  // Audit Integrity
  auditIntegrityScore: number; // 0-100
  auditStatus: AuditStatus;
  auditFlags: {
    gpsGeofencePassPct: number;
    completionTimeAnomalyPct: number;
    ivrCallbackMatchPct: number;
    notes: string;
    anomaliesCount?: number;
  };
  auditVerificationChecks: {
    gpsGeofence: number;
    ivrCallback: number;
    upiProof: number;
    status: 'Verified' | 'Needs Review';
  };

  // Funnel (per 100 women)
  conversionFunnel: FunnelStages;

  // Trajectory Curves (M0, M3, M6, M12)
  longitudinal: LongitudinalPoint[];

  // 5-Axis Radar Metrics (0-100)
  radarMetrics: {
    impactDepth: number;
    costEfficiency: number;
    retentionAttendance: number;
    sustainabilityM12: number;
    dataIntegrity: number;
  };

  // Anatomy of spend
  grantAnatomy: {
    directTraining: number;
    fieldMentorship: number;
    adminOverhead: number;
    dropoutLeakage: number;
  };

  quarterlyReliability: {
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    liftPct: number;
    completionPct: number;
  }[];

  divergingMetrics: {
    metric: string;
    value: number;
    unit: string;
    benchmark: number;
  }[];
}

export interface ScorecardMetric {
  id: string;
  name: string;
  category: string;
  baseline: string;
  endline: string;
  rawChange: string;
  controlAvg: string;
  trueLift: string;
  target: string;
  status: 'Met' | 'Near Target (Watch)' | 'Needs Follow-up';
  pValueNote?: string;
}

export interface ExecutiveDecision {
  id: string;
  ngoId: string;
  ngoName: string;
  district: string;
  amountINR: number;
  amountFormatted: string;
  actionType: 'approve' | 'hold' | 'reallocate';
  title: string;
  description: string;
  evidence: string;
  status: 'pending' | 'approved' | 'held';
}

// ─── SPATIAL GEOGRAPHIES & MULTI-DISTRICT ALLOCATIONS ─────────────────────────

export interface OperationalCentre {
  id: string;
  name: string;
  ngoId: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  beneficiaries: number;
  completionPct: number;
  outcomeLift: string;
  status: 'active' | 'flagged';
  flagNote?: string;
}

export interface DistrictAllocation {
  id: string;
  district: string;
  districtKey: 'pune' | 'thane' | 'nashik' | 'chhindwara' | 'jabalpur' | 'coimbatore';
  state: 'Maharashtra' | 'Madhya Pradesh' | 'Tamil Nadu';
  tier: RegionalTier;
  program: ProgramType;
  ngoId: string;
  ngoName: string;
  allocationName: string;
  women: number;
  grantAllocated: number; // in INR
  grantDisbursed: number; // in INR
  sroiMultiplier: number;
  auditScore: number;
  auditStatus: AuditStatus;
  auditNote?: string;
  impactIndex: number; // 0-100 Composite Impact Index
  costPerOutcome: number;
  rawLiftPct: number;
  extraMonthlyIncome: number;
  centresCount: number;
  centres: OperationalCentre[];
}

export interface ServiceGapBlock {
  id: string;
  name: string;
  district: string;
  districtKey: 'pune' | 'chhindwara' | 'coimbatore';
  state: string;
  lat: number;
  lng: number;
  activeCentres: number; // 0
  unservedWomen: number;
  recommendedAllocationCr: number;
  status: 'unallocated' | 'earmarked';
  earmarkedDate?: string;
}

export interface StateRollup {
  state: 'Maharashtra' | 'Madhya Pradesh' | 'Tamil Nadu';
  women: number;
  pct: number;
  grantDisbursedCr: number;
  ngos: string[];
  districts: string[];
  liftDescription: string;
  regionalSubtext: string;
}

// ─── OPERATIONAL ERP & FIELD MOBILE ENTITIES ─────────────────────────────────

export interface BatchRecord {
  id: string; // e.g. 'BATCH-PN-01'
  name: string; // 'Pune Ward 14 · Kothrud Entrepreneurs'
  ward: string; // 'Kothrud, Pune'
  programme: string; // 'Micro-Skilling: Women Entrepreneurs'
  ngoId: string; // 'pratham'
  fieldOfficer: string; // 'Mithun K.'
  schedule: string; // 'Mon/Wed/Fri 10:00 - 12:30'
  nextSession: string; // 'Tomorrow, 10:00 AM · Module 8: UPI QR & Daily Bookkeeping'
  currentModule: string; // 'Module 8: UPI QR & Daily Bookkeeping'
  lecturesCompleted: number; // 14
  totalLectures: number; // 20
  enrolledCount: number; // 24
  attendancePct: number; // 91.2
  atRiskCount: number; // 1
}

export interface BeneficiaryRecord {
  id: string; // 'BEN-001'
  name: string; // 'Sunita Patil'
  age: number; // 34
  villageWard: string; // 'Kothrud Ward 14, Pune'
  batchId: string; // 'BATCH-PN-01'
  batchName: string; // 'Pune Ward 14 · Kothrud Entrepreneurs'
  primaryTrade: 'Tailoring' | 'Veg Vending' | 'Mobile Repair' | 'Dairy/Livestock' | 'Grocery/Kirana';
  cattleAssets: string; // '1 Commercial Juki Sewing Machine'
  kycStatus: {
    aadhaarMasked: boolean;
    bankLinked: boolean;
    accountNumberMasked: string; // '•••• 4812'
  };
  attendancePct: number; // 92
  missedConsecutiveClasses: number; // 0
  homeVisitScheduled?: boolean;
  homeVisitNotes?: string;
  practicalAssessmentScore: number; // 88 (out of 100)
  m0BaselineIncome: number; // 5200 (₹/mo)
  m6SurveyStatus: 'Pending' | 'In QA' | 'Published to Bajaj';
  m6CalculatedProfit: number; // 7100 (₹/mo)
  upiAdoption: 'Active QR' | 'Cash Only';
  gpsLocation: string; // '18.5204° N, 73.8567° E'
  gpsMatchStatus: 'Inside Geofence ✓' | 'Cluster Anomaly ⚠️';
}

export interface SurveyQARecord {
  id: string; // 'SRV-QA-01'
  beneficiaryId: string; // 'BEN-001'
  beneficiaryName: string; // 'Sunita Patil'
  batchId: string; // 'BATCH-PN-01'
  fieldOfficer: string; // 'Mithun K.'
  submissionTime: string; // '14 mins ago'
  timestamp: number;
  m0BaselineIncome: number; // 5200
  m6CalculatedProfit: number; // 7100
  profitJumpPct: number; // 36.5
  daysWorkedWeekly: number; // 6
  goodDayRevenue: number; // 550
  slowDayRevenue: number; // 250
  weeklyInputCost: number; // 600
  upiReceiptsCount: '0' | '1–5' | '6–20' | '20+';
  resilienceSource: string; // 'Personal savings'
  surveyDuration: string; // '4m 12s'
  durationSeconds: number; // 252
  gpsCoordinates: string; // '18.5204° N, 73.8567° E'
  gpsMatchRate: number; // 99.4
  gpsStatus: 'Inside Geofence ✓' | 'Geofence Anomaly ⚠️';
  hasAnomaly: boolean;
  anomalyType?: 'high_jump' | 'speedrun' | 'gps_mismatch' | 'none';
  anomalyNote?: string;
  qaStatus: 'pending_qa' | 'approved_synced' | 'returned_for_revision';
  revisionReason?: string;
  approvedAt?: string;
}

export interface LiveAuditEvent {
  id: string;
  timestamp: string;
  type: 'survey_synced' | 'attendance_logged' | 'home_visit_assigned' | 'tranche_approved' | 'audit_hold_cleared' | 're_audit_ordered' | 'allocation_saved';
  title: string;
  detail: string;
  actor: string;
  batchOrBeneficiary: string;
}

export interface CaseMessage {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
  isFunder?: boolean;
}

export interface AuditCaseRecord {
  id: string; // e.g. 'AUD-2025-04'
  ngoId: string; // 'magic-bus'
  ngoName: string; // 'Magic Bus India Foundation'
  location: string; // 'Thane Urban & Peri-Urban Slums'
  auditScore: number; // 74
  trancheHeldAmount: number; // 3500000 (₹35 L)
  status: 'under_investigation' | 're_audit_ordered' | 'resolved';
  flags: {
    gpsAnomaliesCount: number; // 142
    dropoutPct: number; // 8.2%
    shortSurveysCount: number; // 89 (duration < 45s)
  };
  thread: CaseMessage[];
}

export const INITIAL_AUDIT_CASES: AuditCaseRecord[] = [
  {
    id: 'AUD-2025-04',
    ngoId: 'magic-bus',
    ngoName: 'Magic Bus India Foundation',
    location: 'Thane Urban & Peri-Urban Slums',
    auditScore: 74,
    trancheHeldAmount: 3500000,
    status: 'under_investigation',
    flags: {
      gpsAnomaliesCount: 142,
      dropoutPct: 8.2,
      shortSurveysCount: 89,
    },
    thread: [
      {
        id: 'msg-1',
        author: 'Priya Swaminathan',
        role: 'KPMG Forensic Audit Lead',
        timestamp: '18 Nov, 10:30 AM',
        text: 'Automated geofence telemetry detected 142 beneficiary M6 survey coordinates clustering within 4 meters of a single commercial cyber cafe in Kalwa. Furthermore, 89 interviews recorded duration under 45 seconds, suggesting bulk synthetic completion rather than genuine in-person visits.',
        isFunder: false,
      },
      {
        id: 'msg-2',
        author: 'Suman Bajaj',
        role: 'Head of CSR, Bajaj Finserv',
        timestamp: '18 Nov, 02:15 PM',
        text: 'Formal governance notice issued. ₹35 L Q4 milestone tranche placed on freeze under Bajaj CSR Audit Norms 2021. Magic Bus must submit center GPS-verified attendance logs, field officer route logs, and direct beneficiary corroboration within 7 working days.',
        isFunder: true,
      },
      {
        id: 'msg-3',
        author: 'Aakash Nair',
        role: 'Operations Director, Magic Bus',
        timestamp: '19 Nov, 11:45 AM',
        text: 'Understood and acknowledged. Our Kalwa center coordinator was using offline manual batch sync over the center Wi-Fi hub after hours, which unintentionally tagged the hub coordinate to the staged survey records. Physical paper attendance registries with 142 beneficiary thumbprints have been couriered to Bajaj House. We invite a joint spot re-audit to verify.',
        isFunder: false,
      },
    ],
  },
];

export const DEFAULT_ALLOCATION: Record<string, number> = {
  pratham: 8.2,
  smile: 9.0,
  goonj: 4.8,
  'magic-bus': 6.0,
};

// ─── CANONICAL SEED DATA (EXACT USER SPECIFICATION) ──────────────────────────

export const CANONICAL_NGOS: NGOStoreRecord[] = [
  // ── 1. Pratham Foundation (Micro-Skilling) ──
  {
    ngoId: 'pratham',
    ngoName: 'Pratham Foundation',
    tenderId: 'BJF-2024-MS-01',
    state: 'Maharashtra',
    district: 'Pune',
    tier: 'Metro',
    program: 'micro-skilling',
    grantAllocated: 82000000, // ₹8.2 Cr committed
    grantDisbursed: 78000000, // ₹7.8 Cr disbursed
    utilizationRate: 95.1,
    costPerOutcome: 6250, // Cost/Grad ₹6,250
    sroiMultiplier: 3.42, // Return/₹1: ₹3.42
    pendingTranche: 4000000, // ₹40 L
    pendingTrancheAction: 'Release Q3 milestone tranche (96/100 audit score, 99.4% GPS match)',
    trancheApproved: false,
    enrolled: 9200,
    retained: 8648, // 8,648 verified
    dropoutRate: 6.0,
    topDropoutReason: 'Relocation to peri-urban manufacturing hubs for formal factory shifts',
    baselineVal: 5200,
    endlineVal: 6800,
    m12Val: 7100,
    extraMonthlyIncome: 1600, // +₹1,600 / mo
    rawLiftPct: 30.8,
    baselineNormalizedLiftPct: 29.5,
    controlM0: 5100,
    controlM6: 5450,
    didNetAttributableLiftPct: 23.9,
    pValue: 0.008,
    isStatisticallySignificant: true,
    auditIntegrityScore: 96,
    auditStatus: 'verified',
    auditFlags: {
      gpsGeofencePassPct: 99.4,
      completionTimeAnomalyPct: 0.8,
      ivrCallbackMatchPct: 98.2,
      notes: 'Third-party KPMG geo-fence cleared with zero synthetic records.',
      anomaliesCount: 0,
    },
    auditVerificationChecks: {
      gpsGeofence: 99.4,
      ivrCallback: 98.2,
      upiProof: 91.5,
      status: 'Verified',
    },
    conversionFunnel: {
      joined: 100,
      finished: 94,
      opened: 78,
      earning1Yr: 64,
      dropoffFinishedToOpenedReason: 'Capital gap: sewing machine cost exceeded savings',
      dropoffOpenedTo1YrReason: 'Working capital depletion during monsoon off-season',
    },
    longitudinal: [
      { wave: 'M0', value: 5200, ciLow: 5050, ciHigh: 5350, pctLift: 0 },
      { wave: 'M3', value: 5900, ciLow: 5750, ciHigh: 6050, pctLift: 13.5 },
      { wave: 'M6', value: 6800, ciLow: 6600, ciHigh: 7000, pctLift: 30.8 },
      { wave: 'M12', value: 7100, ciLow: 6850, ciHigh: 7350, pctLift: 36.5 },
    ],
    radarMetrics: {
      impactDepth: 88,
      costEfficiency: 86,
      retentionAttendance: 94,
      sustainabilityM12: 82,
      dataIntegrity: 98,
    },
    grantAnatomy: { directTraining: 52, fieldMentorship: 26, adminOverhead: 9, dropoutLeakage: 13 },
    quarterlyReliability: [
      { quarter: 'Q1', liftPct: 28.5, completionPct: 94.0 },
      { quarter: 'Q2', liftPct: 31.0, completionPct: 95.2 },
      { quarter: 'Q3', liftPct: 30.5, completionPct: 93.8 },
      { quarter: 'Q4', liftPct: 33.2, completionPct: 94.5 },
    ],
    divergingMetrics: [
      { metric: 'Cost per Graduate', value: 6250, unit: '₹', benchmark: 8500 },
      { metric: 'SROI Multiplier', value: 3.42, unit: 'x', benchmark: 2.50 },
      { metric: '6-Mo Enterprise Survival', value: 78, unit: '%', benchmark: 60 },
      { metric: 'UPI QR Merchant Active', value: 68, unit: '%', benchmark: 45 },
    ],
  },

  // ── 2. Smile Foundation (Micro-Skilling) ──
  {
    ngoId: 'smile',
    ngoName: 'Smile Foundation',
    tenderId: 'BJF-2024-MS-02',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    tier: 'Tier-2',
    program: 'micro-skilling',
    grantAllocated: 90000000, // ₹9.0 Cr committed
    grantDisbursed: 86000000, // ₹8.6 Cr disbursed
    utilizationRate: 95.6,
    costPerOutcome: 7150, // Cost/Grad ₹7,150
    sroiMultiplier: 2.95, // Return/₹1: ₹2.95
    pendingTranche: 4000000, // ₹40 L expansion to Salem
    pendingTrancheAction: 'Release ₹40 L expansion grant to Salem textile clusters',
    trancheApproved: false,
    enrolled: 10100,
    retained: 9393, // 9,393 verified
    dropoutRate: 7.0,
    topDropoutReason: 'Seasonal agricultural plantation harvest call-backs',
    baselineVal: 5400,
    endlineVal: 6950,
    m12Val: 7200,
    extraMonthlyIncome: 1550, // +₹1,550 / mo
    rawLiftPct: 28.7,
    baselineNormalizedLiftPct: 28.0,
    controlM0: 5350,
    controlM6: 5700,
    didNetAttributableLiftPct: 22.2,
    pValue: 0.012,
    isStatisticallySignificant: true,
    auditIntegrityScore: 91,
    auditStatus: 'verified',
    auditFlags: {
      gpsGeofencePassPct: 96.8,
      completionTimeAnomalyPct: 1.4,
      ivrCallbackMatchPct: 94.5,
      notes: 'Clean field pass. High mobile QR density verified.',
      anomaliesCount: 0,
    },
    auditVerificationChecks: {
      gpsGeofence: 96.8,
      ivrCallback: 94.5,
      upiProof: 88.0,
      status: 'Verified',
    },
    conversionFunnel: {
      joined: 100,
      finished: 93,
      opened: 74,
      earning1Yr: 59,
      dropoffFinishedToOpenedReason: 'Credit barrier: pending Mudra loan approvals',
      dropoffOpenedTo1YrReason: 'Competition from power-loom wholesale outlets',
    },
    longitudinal: [
      { wave: 'M0', value: 5400, ciLow: 5250, ciHigh: 5550, pctLift: 0 },
      { wave: 'M3', value: 6050, ciLow: 5900, ciHigh: 6200, pctLift: 12.0 },
      { wave: 'M6', value: 6950, ciLow: 6750, ciHigh: 7150, pctLift: 28.7 },
      { wave: 'M12', value: 7200, ciLow: 6950, ciHigh: 7450, pctLift: 33.3 },
    ],
    radarMetrics: {
      impactDepth: 84,
      costEfficiency: 79,
      retentionAttendance: 91,
      sustainabilityM12: 78,
      dataIntegrity: 92,
    },
    grantAnatomy: { directTraining: 49, fieldMentorship: 25, adminOverhead: 11, dropoutLeakage: 15 },
    quarterlyReliability: [
      { quarter: 'Q1', liftPct: 26.5, completionPct: 92.0 },
      { quarter: 'Q2', liftPct: 29.0, completionPct: 93.5 },
      { quarter: 'Q3', liftPct: 28.8, completionPct: 92.8 },
      { quarter: 'Q4', liftPct: 30.5, completionPct: 93.7 },
    ],
    divergingMetrics: [
      { metric: 'Cost per Graduate', value: 7150, unit: '₹', benchmark: 8500 },
      { metric: 'SROI Multiplier', value: 2.95, unit: 'x', benchmark: 2.50 },
      { metric: '6-Mo Enterprise Survival', value: 74, unit: '%', benchmark: 60 },
      { metric: 'UPI QR Merchant Active', value: 65, unit: '%', benchmark: 45 },
    ],
  },

  // ── 3. Goonj (Micro-Skilling) ──
  {
    ngoId: 'goonj',
    ngoName: 'Goonj',
    tenderId: 'BJF-2024-MS-03',
    state: 'Madhya Pradesh',
    district: 'Chhindwara',
    tier: 'Rural',
    program: 'micro-skilling',
    grantAllocated: 48000000, // ₹4.8 Cr committed
    grantDisbursed: 45000000, // ₹4.5 Cr disbursed
    utilizationRate: 93.8,
    costPerOutcome: 4400, // Cost/Grad ₹4,400 (most cost-efficient!)
    sroiMultiplier: 4.18, // Return/₹1: ₹4.18 (highest ROI!)
    pendingTranche: 0,
    pendingTrancheAction: 'All scheduled tranches fully disbursed; on track for bonus allocation',
    trancheApproved: true,
    enrolled: 3900,
    retained: 3627, // 3,627 verified
    dropoutRate: 7.0,
    topDropoutReason: 'Family migration to cotton collection centers',
    baselineVal: 4800,
    endlineVal: 6600,
    m12Val: 7000,
    extraMonthlyIncome: 1800, // +₹1,800 / mo
    rawLiftPct: 37.5,
    baselineNormalizedLiftPct: 39.0,
    controlM0: 4750,
    controlM6: 5100,
    didNetAttributableLiftPct: 30.1,
    pValue: 0.002,
    isStatisticallySignificant: true,
    auditIntegrityScore: 94,
    auditStatus: 'verified',
    auditFlags: {
      gpsGeofencePassPct: 98.1,
      completionTimeAnomalyPct: 0.9,
      ivrCallbackMatchPct: 96.0,
      notes: 'Exceptional rural cluster execution with zero geofence anomalies.',
      anomaliesCount: 0,
    },
    auditVerificationChecks: {
      gpsGeofence: 98.1,
      ivrCallback: 96.0,
      upiProof: 79.5,
      status: 'Verified',
    },
    conversionFunnel: {
      joined: 100,
      finished: 96,
      opened: 82,
      earning1Yr: 71,
      dropoffFinishedToOpenedReason: 'Local weekly haat booth space allocation delays',
      dropoffOpenedTo1YrReason: 'Cash flow crunch during summer sowing cycle',
    },
    longitudinal: [
      { wave: 'M0', value: 4800, ciLow: 4650, ciHigh: 4950, pctLift: 0 },
      { wave: 'M3', value: 5500, ciLow: 5350, ciHigh: 5650, pctLift: 14.6 },
      { wave: 'M6', value: 6600, ciLow: 6400, ciHigh: 6800, pctLift: 37.5 },
      { wave: 'M12', value: 7000, ciLow: 6750, ciHigh: 7250, pctLift: 45.8 },
    ],
    radarMetrics: {
      impactDepth: 94,
      costEfficiency: 96,
      retentionAttendance: 92,
      sustainabilityM12: 86,
      dataIntegrity: 95,
    },
    grantAnatomy: { directTraining: 58, fieldMentorship: 26, adminOverhead: 7, dropoutLeakage: 9 },
    quarterlyReliability: [
      { quarter: 'Q1', liftPct: 34.0, completionPct: 95.0 },
      { quarter: 'Q2', liftPct: 37.5, completionPct: 96.5 },
      { quarter: 'Q3', liftPct: 36.8, completionPct: 95.8 },
      { quarter: 'Q4', liftPct: 41.2, completionPct: 96.7 },
    ],
    divergingMetrics: [
      { metric: 'Cost per Graduate', value: 4400, unit: '₹', benchmark: 8500 },
      { metric: 'SROI Multiplier', value: 4.18, unit: 'x', benchmark: 2.50 },
      { metric: '6-Mo Enterprise Survival', value: 82, unit: '%', benchmark: 60 },
      { metric: 'UPI QR Merchant Active', value: 60, unit: '%', benchmark: 45 },
    ],
  },

  // ── 4. Magic Bus (Micro-Skilling) ──
  {
    ngoId: 'magic-bus',
    ngoName: 'Magic Bus',
    tenderId: 'BJF-2024-MS-04',
    state: 'Maharashtra',
    district: 'Thane',
    tier: 'Metro',
    program: 'micro-skilling',
    grantAllocated: 60000000, // ₹6.0 Cr committed
    grantDisbursed: 55000000, // ₹5.5 Cr disbursed
    utilizationRate: 91.7,
    costPerOutcome: 11400, // Cost/Grad ₹11,400 (underperforming!)
    sroiMultiplier: 1.48, // Return/₹1: ₹1.48 (lagging!)
    pendingTranche: 3500000, // ₹35 L tranche at risk
    pendingTrancheAction: 'Hold ₹35 L tranche pending forensic field audit on 142 GPS anomalies',
    trancheApproved: false,
    trancheHeld: true,
    enrolled: 5200,
    retained: 4574, // 4,574 verified
    dropoutRate: 12.0,
    topDropoutReason: 'Irregular attendance and unverified duplicate phone numbers',
    baselineVal: 5500,
    endlineVal: 6450,
    m12Val: 6600,
    extraMonthlyIncome: 950, // Only +₹950 / mo
    rawLiftPct: 17.3,
    baselineNormalizedLiftPct: 16.5,
    controlM0: 5400,
    controlM6: 5800,
    didNetAttributableLiftPct: 9.9,
    pValue: 0.145, // Not statistically significant!
    isStatisticallySignificant: false,
    auditIntegrityScore: 74, // Flagged!
    auditStatus: 'flagged',
    auditFlags: {
      gpsGeofencePassPct: 78.4,
      completionTimeAnomalyPct: 8.6,
      ivrCallbackMatchPct: 72.1,
      notes: 'FLAGGED: 142 GPS cluster anomalies detected in Mumbra & Kalwa centers. Tranche on hold.',
      anomaliesCount: 142,
    },
    auditVerificationChecks: {
      gpsGeofence: 78.4,
      ivrCallback: 72.1,
      upiProof: 48.0,
      status: 'Needs Review',
    },
    conversionFunnel: {
      joined: 100,
      finished: 88,
      opened: 61,
      earning1Yr: 42,
      dropoffFinishedToOpenedReason: 'Attendance gaps; low follow-up during market linkage stage',
      dropoffOpenedTo1YrReason: 'High urban rental costs and unhedged inventory loss',
    },
    longitudinal: [
      { wave: 'M0', value: 5500, ciLow: 5350, ciHigh: 5650, pctLift: 0 },
      { wave: 'M3', value: 5900, ciLow: 5700, ciHigh: 6100, pctLift: 7.3 },
      { wave: 'M6', value: 6450, ciLow: 6200, ciHigh: 6700, pctLift: 17.3 },
      { wave: 'M12', value: 6600, ciLow: 6300, ciHigh: 6900, pctLift: 20.0 },
    ],
    radarMetrics: {
      impactDepth: 58,
      costEfficiency: 42,
      retentionAttendance: 68,
      sustainabilityM12: 52,
      dataIntegrity: 64,
    },
    grantAnatomy: { directTraining: 41, fieldMentorship: 20, adminOverhead: 19, dropoutLeakage: 20 },
    quarterlyReliability: [
      { quarter: 'Q1', liftPct: 18.0, completionPct: 86.0 },
      { quarter: 'Q2', liftPct: 16.5, completionPct: 84.5 },
      { quarter: 'Q3', liftPct: 17.0, completionPct: 87.0 },
      { quarter: 'Q4', liftPct: 17.8, completionPct: 88.0 },
    ],
    divergingMetrics: [
      { metric: 'Cost per Graduate', value: 11400, unit: '₹', benchmark: 8500 },
      { metric: 'SROI Multiplier', value: 1.48, unit: 'x', benchmark: 2.50 },
      { metric: '6-Mo Enterprise Survival', value: 61, unit: '%', benchmark: 60 },
      { metric: 'UPI QR Merchant Active', value: 44, unit: '%', benchmark: 45 },
    ],
  },

  // ── 5. Educate Girls (Literacy) ──
  {
    ngoId: 'educate-girls',
    ngoName: 'Educate Girls',
    tenderId: 'BJF-2024-LIT-01',
    state: 'Madhya Pradesh',
    district: 'Jabalpur',
    tier: 'Rural',
    program: 'literacy',
    grantAllocated: 75000000, // ₹7.5 Cr committed
    grantDisbursed: 65000000, // ₹6.5 Cr disbursed
    utilizationRate: 86.7,
    costPerOutcome: 5100, // Cost/Grad ₹5,100
    sroiMultiplier: 3.80, // Return/₹1: ₹3.80
    pendingTranche: 10000000, // ₹1.0 Cr
    pendingTrancheAction: 'Release Q4 literacy milestone tranche upon ASER audit verification',
    trancheApproved: false,
    enrolled: 8100,
    retained: 7541, // 7,541 verified (93.1%)
    dropoutRate: 6.9,
    topDropoutReason: 'Seasonal farm labor commitments',
    baselineVal: 18,
    endlineVal: 84,
    m12Val: 88,
    extraMonthlyIncome: 66, // +66 pts in FLN Grade 3
    rawLiftPct: 366.7,
    baselineNormalizedLiftPct: 350.0,
    controlM0: 17,
    controlM6: 39,
    didNetAttributableLiftPct: 44.0,
    pValue: 0.001,
    isStatisticallySignificant: true,
    auditIntegrityScore: 95,
    auditStatus: 'verified',
    auditFlags: {
      gpsGeofencePassPct: 98.7,
      completionTimeAnomalyPct: 1.1,
      ivrCallbackMatchPct: 97.4,
      notes: 'Field verified via ASER standard literacy tests.',
      anomaliesCount: 0,
    },
    auditVerificationChecks: {
      gpsGeofence: 98.7,
      ivrCallback: 97.4,
      upiProof: 89.0,
      status: 'Verified',
    },
    conversionFunnel: {
      joined: 100,
      finished: 95,
      opened: 86,
      earning1Yr: 78,
      dropoffFinishedToOpenedReason: 'Household opposition to digital smartphone ownership',
      dropoffOpenedTo1YrReason: 'Lack of personal 4G SIM cards in rural hamlets',
    },
    longitudinal: [
      { wave: 'M0', value: 18, ciLow: 16, ciHigh: 20, pctLift: 0 },
      { wave: 'M3', value: 52, ciLow: 49, ciHigh: 55, pctLift: 188.9 },
      { wave: 'M6', value: 84, ciLow: 81, ciHigh: 87, pctLift: 366.7 },
      { wave: 'M12', value: 88, ciLow: 85, ciHigh: 91, pctLift: 388.9 },
    ],
    radarMetrics: {
      impactDepth: 95,
      costEfficiency: 92,
      retentionAttendance: 94,
      sustainabilityM12: 90,
      dataIntegrity: 96,
    },
    grantAnatomy: { directTraining: 55, fieldMentorship: 25, adminOverhead: 10, dropoutLeakage: 10 },
    quarterlyReliability: [
      { quarter: 'Q1', liftPct: 62.0, completionPct: 93.0 },
      { quarter: 'Q2', liftPct: 65.5, completionPct: 94.5 },
      { quarter: 'Q3', liftPct: 64.8, completionPct: 94.0 },
      { quarter: 'Q4', liftPct: 68.2, completionPct: 95.1 },
    ],
    divergingMetrics: [
      { metric: 'Cost per Graduate', value: 5100, unit: '₹', benchmark: 7000 },
      { metric: 'SROI Multiplier', value: 3.80, unit: 'x', benchmark: 2.50 },
      { metric: 'FLN Level 3 Mastery', value: 84, unit: '%', benchmark: 65 },
      { metric: 'UPI Literacy Rate', value: 76, unit: '%', benchmark: 50 },
    ],
  },

  // ── 6. Room to Read (Literacy) ──
  {
    ngoId: 'room-to-read',
    ngoName: 'Room to Read',
    tenderId: 'BJF-2024-LIT-02',
    state: 'Maharashtra',
    district: 'Nashik',
    tier: 'Tier-2',
    program: 'literacy',
    grantAllocated: 65000000, // ₹6.5 Cr committed
    grantDisbursed: 55000000, // ₹5.5 Cr disbursed
    utilizationRate: 84.6,
    costPerOutcome: 6400, // Cost/Grad ₹6,400
    sroiMultiplier: 3.15, // Return/₹1: ₹3.15
    pendingTranche: 10000000, // ₹1.0 Cr
    pendingTrancheAction: 'Release Q4 community library tranche',
    trancheApproved: false,
    enrolled: 6350,
    retained: 5912, // 5,912 verified (93.1%)
    dropoutRate: 6.9,
    topDropoutReason: 'Shift to unorganized grape processing agro-units',
    baselineVal: 19,
    endlineVal: 80,
    m12Val: 85,
    extraMonthlyIncome: 61, // +61 pts
    rawLiftPct: 321.1,
    baselineNormalizedLiftPct: 310.0,
    controlM0: 18,
    controlM6: 38,
    didNetAttributableLiftPct: 41.0,
    pValue: 0.003,
    isStatisticallySignificant: true,
    auditIntegrityScore: 93,
    auditStatus: 'verified',
    auditFlags: {
      gpsGeofencePassPct: 97.4,
      completionTimeAnomalyPct: 1.2,
      ivrCallbackMatchPct: 95.8,
      notes: 'Third-party verified reading and basic numeracy logs.',
      anomaliesCount: 0,
    },
    auditVerificationChecks: {
      gpsGeofence: 97.4,
      ivrCallback: 95.8,
      upiProof: 82.5,
      status: 'Verified',
    },
    conversionFunnel: {
      joined: 100,
      finished: 93,
      opened: 81,
      earning1Yr: 72,
      dropoffFinishedToOpenedReason: 'Limited access to shared family tablets',
      dropoffOpenedTo1YrReason: 'Relocation to tribal peri-urban boarding hostels',
    },
    longitudinal: [
      { wave: 'M0', value: 19, ciLow: 17, ciHigh: 21, pctLift: 0 },
      { wave: 'M3', value: 49, ciLow: 46, ciHigh: 52, pctLift: 157.9 },
      { wave: 'M6', value: 80, ciLow: 77, ciHigh: 83, pctLift: 321.1 },
      { wave: 'M12', value: 85, ciLow: 82, ciHigh: 88, pctLift: 347.4 },
    ],
    radarMetrics: {
      impactDepth: 90,
      costEfficiency: 86,
      retentionAttendance: 92,
      sustainabilityM12: 87,
      dataIntegrity: 94,
    },
    grantAnatomy: { directTraining: 52, fieldMentorship: 26, adminOverhead: 11, dropoutLeakage: 11 },
    quarterlyReliability: [
      { quarter: 'Q1', liftPct: 58.0, completionPct: 92.0 },
      { quarter: 'Q2', liftPct: 61.5, completionPct: 93.5 },
      { quarter: 'Q3', liftPct: 60.8, completionPct: 93.0 },
      { quarter: 'Q4', liftPct: 64.0, completionPct: 94.0 },
    ],
    divergingMetrics: [
      { metric: 'Cost per Graduate', value: 6400, unit: '₹', benchmark: 7000 },
      { metric: 'SROI Multiplier', value: 3.15, unit: 'x', benchmark: 2.50 },
      { metric: 'FLN Level 3 Mastery', value: 80, unit: '%', benchmark: 65 },
      { metric: 'UPI Literacy Rate', value: 72, unit: '%', benchmark: 50 },
    ],
  },
];

// ─── CANONICAL SCORECARDS ───────────────────────────────────────────────────

export const CANONICAL_MICRO_SCORECARD: ScorecardMetric[] = [
  {
    id: 'm-income',
    name: 'Median Monthly Income',
    category: 'EARNINGS',
    baseline: '₹5,400',
    endline: '₹6,900',
    rawChange: '+₹1,500 (+28%)',
    controlAvg: '+₹420',
    trueLift: '+₹1,080 (p < 0.001)',
    target: '₹6,500',
    status: 'Met',
    pValueNote: 'Net foundation attribution',
  },
  {
    id: 'm-enterprise',
    name: 'Active Business Ownership',
    category: 'ENTERPRISE',
    baseline: '61%',
    endline: '79%',
    rawChange: '+18 pts',
    controlAvg: '+3 pts',
    trueLift: '+15 pts (p < 0.001)',
    target: '75%',
    status: 'Met',
    pValueNote: 'Net foundation attribution',
  },
  {
    id: 'm-survival',
    name: '6-Month Commercial Survival',
    category: 'ENTERPRISE',
    baseline: '—',
    endline: '78%',
    rawChange: '78% Retained',
    controlAvg: '54%',
    trueLift: '+24 pts (p < 0.001)',
    target: '70%',
    status: 'Met',
    pValueNote: 'Net foundation attribution',
  },
  {
    id: 'm-upi',
    name: 'UPI Merchant QR Adoption',
    category: 'DIGITAL',
    baseline: '31%',
    endline: '64%',
    rawChange: '+33 pts',
    controlAvg: '+11 pts',
    trueLift: '+22 pts (p < 0.001)',
    target: '60%',
    status: 'Met',
    pValueNote: 'Net foundation attribution',
  },
  {
    id: 'm-credit',
    name: 'Formal Credit / Mudra Access',
    category: 'FINANCIAL',
    baseline: '14%',
    endline: '31%',
    rawChange: '+17 pts',
    controlAvg: '+4 pts',
    trueLift: '+13 pts (p < 0.001)',
    target: '35%',
    status: 'Near Target (Watch)', // Honest executive governance indicator
    pValueNote: 'Under Target by 4 pts · Mudra approval cycle lag',
  },
  {
    id: 'm-savings',
    name: 'Emergency Savings Buffer (>₹5k)',
    category: 'RESILIENCE',
    baseline: '22%',
    endline: '49%',
    rawChange: '+27 pts',
    controlAvg: '+8 pts',
    trueLift: '+19 pts (p < 0.001)',
    target: '45%',
    status: 'Met',
    pValueNote: 'Net foundation attribution',
  },
];

export const CANONICAL_LITERACY_SCORECARD: ScorecardMetric[] = [
  {
    id: 'l-fln',
    name: 'FLN Grade 3 Reading Mastery',
    category: 'LITERACY',
    baseline: '18.2%',
    endline: '82.4%',
    rawChange: '+64.2 pts',
    controlAvg: '+22.4 pts',
    trueLift: '+41.8 pts (p < 0.001)',
    target: '80%',
    status: 'Met',
  },
  {
    id: 'l-arithmetic',
    name: 'Basic Arithmetic & Daily Calculation',
    category: 'NUMERACY',
    baseline: '14.0%',
    endline: '76.0%',
    rawChange: '+62.0 pts',
    controlAvg: '+16.2 pts',
    trueLift: '+45.8 pts (p < 0.001)',
    target: '70%',
    status: 'Met',
  },
  {
    id: 'l-passbook',
    name: 'Independent Bank Passbook Reading',
    category: 'FINANCIAL',
    baseline: '11.0%',
    endline: '71.0%',
    rawChange: '+60.0 pts',
    controlAvg: '+12.5 pts',
    trueLift: '+47.5 pts (p < 0.001)',
    target: '65%',
    status: 'Met',
  },
  {
    id: 'l-upi',
    name: 'Smartphone Text & UPI Fluency',
    category: 'DIGITAL',
    baseline: '8.0%',
    endline: '68.0%',
    rawChange: '+60.0 pts',
    controlAvg: '+14.0 pts',
    trueLift: '+46.0 pts (p < 0.001)',
    target: '60%',
    status: 'Met',
  },
  {
    id: 'l-scam',
    name: 'Fraud, Scam & OTP Protection Awareness',
    category: 'SECURITY',
    baseline: '18.0%',
    endline: '86.0%',
    rawChange: '+68.0 pts',
    controlAvg: '+20.5 pts',
    trueLift: '+47.5 pts (p < 0.001)',
    target: '80%',
    status: 'Met',
  },
  {
    id: 'l-agency',
    name: 'Household Decision-Making Agency',
    category: 'AUTONOMY',
    baseline: '22.0%',
    endline: '68.0%',
    rawChange: '+46.0 pts',
    controlAvg: '+11.0 pts',
    trueLift: '+35.0 pts (p < 0.001)',
    target: '65%',
    status: 'Met',
  },
];

// ─── INITIAL DECISION QUEUE (EXECUTIVE WATCHLIST) ──────────────────────────

export const INITIAL_DECISIONS: ExecutiveDecision[] = [
  {
    id: 'dec-pratham',
    ngoId: 'pratham',
    ngoName: 'Pratham Foundation',
    district: 'Pune',
    amountINR: 4000000,
    amountFormatted: '₹40 L',
    actionType: 'approve',
    title: 'Release Q3 Performance Tranche',
    description: 'Release ₹40 L final performance milestone for Pune cohort graduation.',
    evidence: '96/100 audit score · 99.4% GPS match · ₹3.42 return/₹1 · +₹1,600 monthly earnings lift.',
    status: 'pending',
  },
  {
    id: 'dec-smile',
    ngoId: 'smile',
    ngoName: 'Smile Foundation',
    district: 'Coimbatore',
    amountINR: 4000000,
    amountFormatted: '₹40 L',
    actionType: 'approve',
    title: 'Authorize Salem Cluster Expansion',
    description: 'Approve ₹40 L expansion grant to replicate textile skilling model in Salem district.',
    evidence: '91/100 audit score · 96.8% GPS match · 93% completion rate across 10,100 women.',
    status: 'pending',
  },
  {
    id: 'dec-magic-bus',
    ngoId: 'magic-bus',
    ngoName: 'Magic Bus',
    district: 'Thane',
    amountINR: 3500000,
    amountFormatted: '₹35 L',
    actionType: 'hold',
    title: 'Hold Tranche & Initiate Forensic Audit',
    description: 'Freeze ₹35 L Q4 disbursement and issue 14-day compliance notice for Thane operations.',
    evidence: '74/100 audit score · 142 GPS anomalies detected in Mumbra & Kalwa · High dropout (12%).',
    status: 'pending',
  },
];

// ─── SPATIAL OPERATIONAL CENTRES (20 GEO-TAGGED HUBS) ─────────────────────────

export const CANONICAL_OPERATIONAL_CENTRES: OperationalCentre[] = [
  // ── Pratham Foundation (Pune · 6 Centres · 9,200 Women) ──
  {
    id: 'cnt-pratham-kothrud',
    name: 'Kothrud Centre',
    ngoId: 'pratham',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5074,
    lng: 73.8077,
    beneficiaries: 2100,
    completionPct: 95.2,
    outcomeLift: '+₹1,650/mo',
    status: 'active',
  },
  {
    id: 'cnt-pratham-hadapsar',
    name: 'Hadapsar Centre',
    ngoId: 'pratham',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5089,
    lng: 73.9260,
    beneficiaries: 1850,
    completionPct: 94.8,
    outcomeLift: '+₹1,620/mo',
    status: 'active',
  },
  {
    id: 'cnt-pratham-sinhagad',
    name: 'Sinhagad Rd Centre',
    ngoId: 'pratham',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.4772,
    lng: 73.8253,
    beneficiaries: 1450,
    completionPct: 93.6,
    outcomeLift: '+₹1,580/mo',
    status: 'active',
  },
  {
    id: 'cnt-pratham-shivajinagar',
    name: 'Shivajinagar Centre',
    ngoId: 'pratham',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5308,
    lng: 73.8475,
    beneficiaries: 1300,
    completionPct: 95.0,
    outcomeLift: '+₹1,640/mo',
    status: 'active',
  },
  {
    id: 'cnt-pratham-pcmc',
    name: 'Pimpri-Chinchwad Centre',
    ngoId: 'pratham',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.6298,
    lng: 73.7997,
    beneficiaries: 1350,
    completionPct: 94.1,
    outcomeLift: '+₹1,590/mo',
    status: 'active',
  },
  {
    id: 'cnt-pratham-wakad',
    name: 'Wakad Centre',
    ngoId: 'pratham',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5987,
    lng: 73.7688,
    beneficiaries: 1150,
    completionPct: 93.8,
    outcomeLift: '+₹1,560/mo',
    status: 'active',
  },

  // ── Smile Foundation (Coimbatore · 2 Centres · 7,600 Women) ──
  {
    id: 'cnt-smile-peelamedu',
    name: 'Peelamedu Textile Hub',
    ngoId: 'smile',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    lat: 11.0283,
    lng: 77.0273,
    beneficiaries: 4200,
    completionPct: 91.5,
    outcomeLift: '+₹1,340/mo',
    status: 'active',
  },
  {
    id: 'cnt-smile-pollachi',
    name: 'Pollachi Agro-Enterprise Centre',
    ngoId: 'smile',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    lat: 10.6583,
    lng: 77.0085,
    beneficiaries: 3400,
    completionPct: 89.8,
    outcomeLift: '+₹1,290/mo',
    status: 'active',
  },

  // ── Smile Foundation (Pune Rural · 2 Centres · 2,500 Women) ──
  {
    id: 'cnt-smile-baramati',
    name: 'Baramati Cluster Hub',
    ngoId: 'smile',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.1517,
    lng: 74.5768,
    beneficiaries: 1400,
    completionPct: 94.0,
    outcomeLift: '+₹1,510/mo',
    status: 'active',
  },
  {
    id: 'cnt-smile-shirur',
    name: 'Shirur Rural Hub',
    ngoId: 'smile',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.8271,
    lng: 74.3752,
    beneficiaries: 1100,
    completionPct: 93.2,
    outcomeLift: '+₹1,440/mo',
    status: 'active',
  },

  // ── Magic Bus (Thane · 2 Centres · 3,800 Women · Audit Hold) ──
  {
    id: 'cnt-magicbus-kalwa',
    name: 'Kalwa Tailoring Hub',
    ngoId: 'magic-bus',
    district: 'Thane',
    state: 'Maharashtra',
    lat: 19.1981,
    lng: 72.9996,
    beneficiaries: 2200,
    completionPct: 76.5,
    outcomeLift: '+₹880/mo',
    status: 'flagged',
    flagNote: '142 GPS Cluster Flags',
  },
  {
    id: 'cnt-magicbus-mumbra',
    name: 'Mumbra Outreach Centre',
    ngoId: 'magic-bus',
    district: 'Thane',
    state: 'Maharashtra',
    lat: 19.1760,
    lng: 73.0229,
    beneficiaries: 1600,
    completionPct: 82.0,
    outcomeLift: '+₹960/mo',
    status: 'active',
  },

  // ── Magic Bus (Pune Industrial · 2 Centres · 1,400 Women · Clean) ──
  {
    id: 'cnt-magicbus-chakan',
    name: 'Chakan Industrial Belt',
    ngoId: 'magic-bus',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.7606,
    lng: 73.8636,
    beneficiaries: 800,
    completionPct: 88.5,
    outcomeLift: '+₹1,220/mo',
    status: 'active',
  },
  {
    id: 'cnt-magicbus-bhosari',
    name: 'Bhosari Cluster Centre',
    ngoId: 'magic-bus',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.6279,
    lng: 73.8482,
    beneficiaries: 600,
    completionPct: 86.0,
    outcomeLift: '+₹1,130/mo',
    status: 'active',
  },

  // ── Goonj (Chhindwara · 2 Centres · 3,900 Women) ──
  {
    id: 'cnt-goonj-tamia',
    name: 'Tamia Rural Centre',
    ngoId: 'goonj',
    district: 'Chhindwara',
    state: 'Madhya Pradesh',
    lat: 22.3456,
    lng: 78.6650,
    beneficiaries: 2100,
    completionPct: 93.8,
    outcomeLift: '+₹1,480/mo',
    status: 'active',
  },
  {
    id: 'cnt-goonj-parasia',
    name: 'Parasia Hub',
    ngoId: 'goonj',
    district: 'Chhindwara',
    state: 'Madhya Pradesh',
    lat: 22.1995,
    lng: 78.7586,
    beneficiaries: 1800,
    completionPct: 92.5,
    outcomeLift: '+₹1,410/mo',
    status: 'active',
  },

  // ── Educate Girls (Jabalpur · 2 Centres · 8,100 Women) ──
  {
    id: 'cnt-educategirls-patan',
    name: 'Patan Block Centre',
    ngoId: 'educate-girls',
    district: 'Jabalpur',
    state: 'Madhya Pradesh',
    lat: 23.2839,
    lng: 79.6606,
    beneficiaries: 4500,
    completionPct: 94.2,
    outcomeLift: '84.5% FLN 3',
    status: 'active',
  },
  {
    id: 'cnt-educategirls-sihora',
    name: 'Sihora Rural Centre',
    ngoId: 'educate-girls',
    district: 'Jabalpur',
    state: 'Madhya Pradesh',
    lat: 23.4856,
    lng: 80.1042,
    beneficiaries: 3600,
    completionPct: 93.5,
    outcomeLift: '81.2% FLN 3',
    status: 'active',
  },

  // ── Room to Read (Nashik · 2 Centres · 6,350 Women) ──
  {
    id: 'cnt-roomtoread-igatpuri',
    name: 'Igatpuri Cluster Centre',
    ngoId: 'room-to-read',
    district: 'Nashik',
    state: 'Maharashtra',
    lat: 19.6956,
    lng: 73.5626,
    beneficiaries: 3450,
    completionPct: 93.8,
    outcomeLift: '82.0% FLN 3',
    status: 'active',
  },
  {
    id: 'cnt-roomtoread-sinnar',
    name: 'Sinnar Block Centre',
    ngoId: 'room-to-read',
    district: 'Nashik',
    state: 'Maharashtra',
    lat: 19.8450,
    lng: 73.9978,
    beneficiaries: 2900,
    completionPct: 92.1,
    outcomeLift: '79.8% FLN 3',
    status: 'active',
  },
];

// ─── CANONICAL SERVICE GAP BLOCKS (UNDERSERVED CLUSTERS) ──────────────────────

export const CANONICAL_SERVICE_GAP_BLOCKS: ServiceGapBlock[] = [
  {
    id: 'gap-velhe',
    name: 'Velhe Block (Pune Rural)',
    district: 'Pune',
    districtKey: 'pune',
    state: 'Maharashtra',
    lat: 18.2974,
    lng: 73.6352,
    activeCentres: 0,
    unservedWomen: 1850,
    recommendedAllocationCr: 0.8,
    status: 'unallocated',
  },
  {
    id: 'gap-junnar',
    name: 'Junnar Block (Pune North)',
    district: 'Pune',
    districtKey: 'pune',
    state: 'Maharashtra',
    lat: 19.2089,
    lng: 73.8757,
    activeCentres: 0,
    unservedWomen: 2200,
    recommendedAllocationCr: 1.0,
    status: 'unallocated',
  },
  {
    id: 'gap-harrai',
    name: 'Harrai Block (Chhindwara, MP)',
    district: 'Chhindwara',
    districtKey: 'chhindwara',
    state: 'Madhya Pradesh',
    lat: 22.6167,
    lng: 79.2167,
    activeCentres: 0,
    unservedWomen: 1400,
    recommendedAllocationCr: 0.6,
    status: 'unallocated',
  },
  {
    id: 'gap-valparai',
    name: 'Valparai Block (Coimbatore, TN)',
    district: 'Coimbatore',
    districtKey: 'coimbatore',
    state: 'Tamil Nadu',
    lat: 10.3270,
    lng: 76.9554,
    activeCentres: 0,
    unservedWomen: 1150,
    recommendedAllocationCr: 0.5,
    status: 'unallocated',
  },
];

// ─── RECONCILED MULTI-DISTRICT ALLOCATIONS (SUM TO CANONICAL ORG TOTALS) ───────

export const CANONICAL_DISTRICT_ALLOCATIONS: DistrictAllocation[] = [
  // ── Pratham: Pune Urban (9,200 · ₹8.2 Cr / ₹7.8 Cr · SROI 3.42 · Audit 96) ──
  {
    id: 'alloc-pratham-pune',
    district: 'Pune',
    districtKey: 'pune',
    state: 'Maharashtra',
    tier: 'Metro',
    program: 'micro-skilling',
    ngoId: 'pratham',
    ngoName: 'Pratham Foundation',
    allocationName: 'Pune Urban & Peri-Urban (MH)',
    women: 9200,
    grantAllocated: 82000000,
    grantDisbursed: 78000000,
    sroiMultiplier: 3.42,
    auditScore: 96,
    auditStatus: 'verified',
    impactIndex: 84.2,
    costPerOutcome: 6250,
    rawLiftPct: 30.8,
    extraMonthlyIncome: 1600,
    centresCount: 6,
    centres: CANONICAL_OPERATIONAL_CENTRES.filter(c => c.ngoId === 'pratham'),
  },

  // ── Smile: Coimbatore (7,600 · ₹6.8 Cr / ₹6.5 Cr · SROI 2.89 · Audit 90) ──
  {
    id: 'alloc-smile-coimbatore',
    district: 'Coimbatore',
    districtKey: 'coimbatore',
    state: 'Tamil Nadu',
    tier: 'Tier-2',
    program: 'micro-skilling',
    ngoId: 'smile',
    ngoName: 'Smile Foundation',
    allocationName: 'Coimbatore (TN)',
    women: 7600,
    grantAllocated: 68000000,
    grantDisbursed: 65000000,
    sroiMultiplier: 2.89,
    auditScore: 90,
    auditStatus: 'verified',
    impactIndex: 75.8,
    costPerOutcome: 7100,
    rawLiftPct: 25.2,
    extraMonthlyIncome: 1320,
    centresCount: 2,
    centres: CANONICAL_OPERATIONAL_CENTRES.filter(c => c.ngoId === 'smile' && c.district === 'Coimbatore'),
  },

  // ── Smile: Pune Rural (2,500 · ₹2.2 Cr / ₹2.1 Cr · SROI 3.13 · Audit 94) ──
  {
    id: 'alloc-smile-pune',
    district: 'Pune',
    districtKey: 'pune',
    state: 'Maharashtra',
    tier: 'Rural',
    program: 'micro-skilling',
    ngoId: 'smile',
    ngoName: 'Smile Foundation',
    allocationName: 'Pune Rural — Baramati & Shirur (MH)',
    women: 2500,
    grantAllocated: 22000000,
    grantDisbursed: 21000000,
    sroiMultiplier: 3.13,
    auditScore: 94,
    auditStatus: 'verified',
    impactIndex: 79.6,
    costPerOutcome: 6550,
    rawLiftPct: 27.8,
    extraMonthlyIncome: 1480,
    centresCount: 2,
    centres: CANONICAL_OPERATIONAL_CENTRES.filter(c => c.ngoId === 'smile' && c.district === 'Pune'),
  },

  // ── Magic Bus: Thane (3,800 · ₹4.4 Cr / ₹4.0 Cr · SROI 1.22 · Audit 70 · Flagged) ──
  {
    id: 'alloc-magicbus-thane',
    district: 'Thane',
    districtKey: 'thane',
    state: 'Maharashtra',
    tier: 'Metro',
    program: 'micro-skilling',
    ngoId: 'magic-bus',
    ngoName: 'Magic Bus',
    allocationName: 'Thane — Kalwa Hub (MH)',
    women: 3800,
    grantAllocated: 44000000,
    grantDisbursed: 40000000,
    sroiMultiplier: 1.22,
    auditScore: 70,
    auditStatus: 'flagged',
    auditNote: 'Audit Hold · 142 flagged Kalwa cyber-cafe GPS pings',
    impactIndex: 56.4,
    costPerOutcome: 9450,
    rawLiftPct: 18.5,
    extraMonthlyIncome: 920,
    centresCount: 2,
    centres: CANONICAL_OPERATIONAL_CENTRES.filter(c => c.ngoId === 'magic-bus' && c.district === 'Thane'),
  },

  // ── Magic Bus: Pune Industrial (1,400 · ₹1.6 Cr / ₹1.5 Cr · SROI 2.19 · Audit 85 · Clean) ──
  {
    id: 'alloc-magicbus-pune',
    district: 'Pune',
    districtKey: 'pune',
    state: 'Maharashtra',
    tier: 'Tier-2',
    program: 'micro-skilling',
    ngoId: 'magic-bus',
    ngoName: 'Magic Bus',
    allocationName: 'Pune Industrial — Chakan & Bhosari (MH)',
    women: 1400,
    grantAllocated: 16000000,
    grantDisbursed: 15000000,
    sroiMultiplier: 2.19,
    auditScore: 85,
    auditStatus: 'verified',
    auditNote: 'Clean · Manufacturing cluster verification cleared',
    impactIndex: 71.8,
    costPerOutcome: 7800,
    rawLiftPct: 22.4,
    extraMonthlyIncome: 1180,
    centresCount: 2,
    centres: CANONICAL_OPERATIONAL_CENTRES.filter(c => c.ngoId === 'magic-bus' && c.district === 'Pune'),
  },

  // ── Goonj: Chhindwara (3,900 · ₹4.8 Cr / ₹4.5 Cr · SROI 3.15 · Audit 94) ──
  {
    id: 'alloc-goonj-chhindwara',
    district: 'Chhindwara',
    districtKey: 'chhindwara',
    state: 'Madhya Pradesh',
    tier: 'Rural',
    program: 'micro-skilling',
    ngoId: 'goonj',
    ngoName: 'Goonj',
    allocationName: 'Chhindwara (MP)',
    women: 3900,
    grantAllocated: 48000000,
    grantDisbursed: 45000000,
    sroiMultiplier: 3.15,
    auditScore: 94,
    auditStatus: 'verified',
    impactIndex: 82.5,
    costPerOutcome: 6400,
    rawLiftPct: 28.6,
    extraMonthlyIncome: 1450,
    centresCount: 2,
    centres: CANONICAL_OPERATIONAL_CENTRES.filter(c => c.ngoId === 'goonj'),
  },

  // ── Educate Girls: Jabalpur (8,100 · ₹7.5 Cr / ₹6.5 Cr · SROI 3.55 · Audit 95) ──
  {
    id: 'alloc-educategirls-jabalpur',
    district: 'Jabalpur',
    districtKey: 'jabalpur',
    state: 'Madhya Pradesh',
    tier: 'Rural',
    program: 'literacy',
    ngoId: 'educate-girls',
    ngoName: 'Educate Girls',
    allocationName: 'Jabalpur (MP)',
    women: 8100,
    grantAllocated: 75000000,
    grantDisbursed: 65000000,
    sroiMultiplier: 3.55,
    auditScore: 95,
    auditStatus: 'verified',
    impactIndex: 81.4,
    costPerOutcome: 4800,
    rawLiftPct: 34.2,
    extraMonthlyIncome: 0,
    centresCount: 2,
    centres: CANONICAL_OPERATIONAL_CENTRES.filter(c => c.ngoId === 'educate-girls'),
  },

  // ── Room to Read: Nashik (6,350 · ₹6.5 Cr / ₹5.5 Cr · SROI 3.30 · Audit 93) ──
  {
    id: 'alloc-roomtoread-nashik',
    district: 'Nashik',
    districtKey: 'nashik',
    state: 'Maharashtra',
    tier: 'Tier-2',
    program: 'literacy',
    ngoId: 'room-to-read',
    ngoName: 'Room to Read',
    allocationName: 'Nashik (MH)',
    women: 6350,
    grantAllocated: 65000000,
    grantDisbursed: 55000000,
    sroiMultiplier: 3.30,
    auditScore: 93,
    auditStatus: 'verified',
    impactIndex: 78.9,
    costPerOutcome: 5200,
    rawLiftPct: 31.0,
    extraMonthlyIncome: 0,
    centresCount: 2,
    centres: CANONICAL_OPERATIONAL_CENTRES.filter(c => c.ngoId === 'room-to-read'),
  },
];

// ─── OPERATIONAL SEED DATA (ERP & FIELD MOBILE APP) ──────────────────────────

export const INITIAL_BATCHES: BatchRecord[] = [
  {
    id: 'BATCH-PN-01',
    name: 'Pune Ward 14 · Kothrud Entrepreneurs',
    ward: 'Kothrud, Pune',
    programme: 'Micro-Skilling: Women Entrepreneurs',
    ngoId: 'pratham',
    fieldOfficer: 'Mithun K.',
    schedule: 'Mon/Wed/Fri 10:00 - 12:30',
    nextSession: 'Tomorrow, 10:00 AM · Module 8: UPI QR & Daily Bookkeeping',
    currentModule: 'Module 8: UPI QR & Daily Bookkeeping',
    lecturesCompleted: 14,
    totalLectures: 20,
    enrolledCount: 24,
    attendancePct: 91.2,
    atRiskCount: 1,
  },
  {
    id: 'BATCH-PN-02',
    name: 'Pune Ward 08 · Hadapsar Dairy & Agri',
    ward: 'Hadapsar, Pune',
    programme: 'Micro-Skilling: Women Entrepreneurs',
    ngoId: 'pratham',
    fieldOfficer: 'Mithun K.',
    schedule: 'Tue/Thu/Sat 10:00 - 12:30',
    nextSession: 'Friday, 10:00 AM · Module 12: Working Capital & Chaffing',
    currentModule: 'Module 12: Working Capital & Chaffing',
    lecturesCompleted: 16,
    totalLectures: 20,
    enrolledCount: 22,
    attendancePct: 94.6,
    atRiskCount: 1,
  },
  {
    id: 'BATCH-PN-03',
    name: 'Pune Ward 22 · Sinhagad Micro-Retail',
    ward: 'Sinhagad Rd, Pune',
    programme: 'Micro-Skilling: Women Entrepreneurs',
    ngoId: 'pratham',
    fieldOfficer: 'Pooja Salve',
    schedule: 'Mon/Wed/Fri 14:00 - 16:30',
    nextSession: 'Thursday, 02:00 PM · Module 7: Inventory & Margin Planning',
    currentModule: 'Module 7: Inventory & Margin Planning',
    lecturesCompleted: 11,
    totalLectures: 20,
    enrolledCount: 25,
    attendancePct: 89.4,
    atRiskCount: 0,
  },
  {
    id: 'BATCH-PN-04',
    name: 'Pune Ward 03 · Shivajinagar Tech & Repair',
    ward: 'Shivajinagar, Pune',
    programme: 'Micro-Skilling: Women Entrepreneurs',
    ngoId: 'pratham',
    fieldOfficer: 'Pooja Salve',
    schedule: 'Tue/Thu/Sat 14:00 - 16:30',
    nextSession: 'Saturday, 02:00 PM · Module 15: Soldering & Component Sourcing',
    currentModule: 'Module 15: Soldering & Component Sourcing',
    lecturesCompleted: 15,
    totalLectures: 20,
    enrolledCount: 20,
    attendancePct: 92.8,
    atRiskCount: 0,
  },
  {
    id: 'BATCH-PN-05',
    name: 'Pune Ward 18 · Pimpri-Chinchwad Tailoring Center',
    ward: 'Pimpri-Chinchwad, Pune',
    programme: 'Micro-Skilling: Women Entrepreneurs',
    ngoId: 'pratham',
    fieldOfficer: 'Pooja Salve',
    schedule: 'Mon/Wed/Fri 09:30 - 12:00',
    nextSession: 'Tomorrow, 09:30 AM · Module 9: Pattern Cutting & Costing',
    currentModule: 'Module 9: Pattern Cutting & Costing',
    lecturesCompleted: 12,
    totalLectures: 20,
    enrolledCount: 26,
    attendancePct: 89.5,
    atRiskCount: 1,
  },
  {
    id: 'BATCH-PN-06',
    name: 'Pune Ward 27 · Wakad Food Processing',
    ward: 'Wakad, Pune',
    programme: 'Micro-Skilling: Women Entrepreneurs',
    ngoId: 'pratham',
    fieldOfficer: 'Pooja Salve',
    schedule: 'Tue/Thu/Sat 11:00 - 13:30',
    nextSession: 'Friday, 11:00 AM · Module 10: Retail Merchandising & Packaging',
    currentModule: 'Module 10: Retail Merchandising & Packaging',
    lecturesCompleted: 10,
    totalLectures: 20,
    enrolledCount: 23,
    attendancePct: 88.1,
    atRiskCount: 1,
  },
];

export const INITIAL_BENEFICIARIES: BeneficiaryRecord[] = [
  {
    id: 'BEN-001',
    name: 'Sunita Patil',
    age: 34,
    villageWard: 'Kothrud Ward 14, Pune',
    batchId: 'BATCH-PN-01',
    batchName: 'Pune Ward 14 · Kothrud Entrepreneurs',
    primaryTrade: 'Tailoring',
    cattleAssets: '1 Commercial Juki Sewing Machine',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 4812',
    },
    attendancePct: 92,
    missedConsecutiveClasses: 0,
    practicalAssessmentScore: 88,
    m0BaselineIncome: 5200,
    m6SurveyStatus: 'In QA',
    m6CalculatedProfit: 7100,
    upiAdoption: 'Active QR',
    gpsLocation: '18.5204° N, 73.8567° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-002',
    name: 'Meena Deshmukh',
    age: 41,
    villageWard: 'Hadapsar Ward 08, Pune',
    batchId: 'BATCH-PN-02',
    batchName: 'Pune Ward 08 · Hadapsar Dairy & Agri',
    primaryTrade: 'Dairy/Livestock',
    cattleAssets: '2 Buffaloes + Chaff Cutter Unit',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 9123',
    },
    attendancePct: 96,
    missedConsecutiveClasses: 0,
    practicalAssessmentScore: 94,
    m0BaselineIncome: 6100,
    m6SurveyStatus: 'Published to Bajaj',
    m6CalculatedProfit: 8450,
    upiAdoption: 'Active QR',
    gpsLocation: '18.5089° N, 73.9259° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-003',
    name: 'Kavita Shinde',
    age: 29,
    villageWard: 'Sinhagad Rd Ward 22, Pune',
    batchId: 'BATCH-PN-03',
    batchName: 'Pune Ward 22 · Sinhagad Micro-Retail',
    primaryTrade: 'Tailoring',
    cattleAssets: 'Singer Heavy-Duty Machine + Overlock',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 3045',
    },
    attendancePct: 88,
    missedConsecutiveClasses: 0,
    practicalAssessmentScore: 84,
    m0BaselineIncome: 4200,
    m6SurveyStatus: 'In QA',
    m6CalculatedProfit: 14800,
    upiAdoption: 'Active QR',
    gpsLocation: '18.4912° N, 73.8214° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-004',
    name: 'Rekha Jadhav',
    age: 38,
    villageWard: 'Kothrud Ward 14, Pune',
    batchId: 'BATCH-PN-01',
    batchName: 'Pune Ward 14 · Kothrud Entrepreneurs',
    primaryTrade: 'Veg Vending',
    cattleAssets: 'Display Handcart + Digital Scale',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 7180',
    },
    attendancePct: 68,
    missedConsecutiveClasses: 2,
    homeVisitScheduled: false,
    practicalAssessmentScore: 74,
    m0BaselineIncome: 4800,
    m6SurveyStatus: 'Pending',
    m6CalculatedProfit: 6200,
    upiAdoption: 'Active QR',
    gpsLocation: '18.5145° N, 73.8410° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-005',
    name: 'Anita Kamble',
    age: 32,
    villageWard: 'Shivajinagar Ward 03, Pune',
    batchId: 'BATCH-PN-04',
    batchName: 'Pune Ward 03 · Shivajinagar Tech & Repair',
    primaryTrade: 'Mobile Repair',
    cattleAssets: 'Soldering Station + Digital Multimeter',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 2911',
    },
    attendancePct: 95,
    missedConsecutiveClasses: 0,
    practicalAssessmentScore: 92,
    m0BaselineIncome: 5400,
    m6SurveyStatus: 'Published to Bajaj',
    m6CalculatedProfit: 7600,
    upiAdoption: 'Active QR',
    gpsLocation: '18.5314° N, 73.8446° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-006',
    name: 'Pooja Gaikwad',
    age: 27,
    villageWard: 'Hadapsar Ward 08, Pune',
    batchId: 'BATCH-PN-02',
    batchName: 'Pune Ward 08 · Hadapsar Dairy & Agri',
    primaryTrade: 'Grocery/Kirana',
    cattleAssets: 'Counter Rack + Deep Freeze',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 6429',
    },
    attendancePct: 72,
    missedConsecutiveClasses: 2,
    homeVisitScheduled: false,
    practicalAssessmentScore: 78,
    m0BaselineIncome: 5800,
    m6SurveyStatus: 'Pending',
    m6CalculatedProfit: 6400,
    upiAdoption: 'Cash Only',
    gpsLocation: '18.5021° N, 73.9312° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-007',
    name: 'Lata More',
    age: 45,
    villageWard: 'Kothrud Ward 14, Pune',
    batchId: 'BATCH-PN-01',
    batchName: 'Pune Ward 14 · Kothrud Entrepreneurs',
    primaryTrade: 'Dairy/Livestock',
    cattleAssets: '1 Gir Cow + Stainless Can',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 8831',
    },
    attendancePct: 90,
    missedConsecutiveClasses: 0,
    practicalAssessmentScore: 86,
    m0BaselineIncome: 5100,
    m6SurveyStatus: 'Published to Bajaj',
    m6CalculatedProfit: 6900,
    upiAdoption: 'Active QR',
    gpsLocation: '18.5190° N, 73.8510° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-008',
    name: 'Shobha Chavan',
    age: 36,
    villageWard: 'Sinhagad Rd Ward 22, Pune',
    batchId: 'BATCH-PN-03',
    batchName: 'Pune Ward 22 · Sinhagad Micro-Retail',
    primaryTrade: 'Veg Vending',
    cattleAssets: '4-Tier Vegetable Rolling Stand',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 1502',
    },
    attendancePct: 94,
    missedConsecutiveClasses: 0,
    practicalAssessmentScore: 90,
    m0BaselineIncome: 4600,
    m6SurveyStatus: 'Pending',
    m6CalculatedProfit: 6750,
    upiAdoption: 'Active QR',
    gpsLocation: '18.4890° N, 73.8180° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-009',
    name: 'Ranjana Shinde',
    age: 39,
    villageWard: 'Shivajinagar Ward 03, Pune',
    batchId: 'BATCH-PN-04',
    batchName: 'Pune Ward 03 · Shivajinagar Tech & Repair',
    primaryTrade: 'Tailoring',
    cattleAssets: 'Interlock Overedging Unit',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 5590',
    },
    attendancePct: 91,
    missedConsecutiveClasses: 0,
    practicalAssessmentScore: 85,
    m0BaselineIncome: 5500,
    m6SurveyStatus: 'Published to Bajaj',
    m6CalculatedProfit: 7300,
    upiAdoption: 'Active QR',
    gpsLocation: '18.5340° N, 73.8490° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-010',
    name: 'Asha Pawar',
    age: 43,
    villageWard: 'Pimpri-Chinchwad Ward 18, Pune',
    batchId: 'BATCH-PN-05',
    batchName: 'Pune Ward 18 · Pimpri-Chinchwad Tailoring Center',
    primaryTrade: 'Tailoring',
    cattleAssets: 'Domestic Sewing Machine + Overlock',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 3819',
    },
    attendancePct: 84,
    missedConsecutiveClasses: 1,
    practicalAssessmentScore: 78,
    m0BaselineIncome: 4900,
    m6SurveyStatus: 'Pending',
    m6CalculatedProfit: 6200,
    upiAdoption: 'Cash Only',
    gpsLocation: '18.6298° N, 73.7997° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-011',
    name: 'Suman Kadam',
    age: 31,
    villageWard: 'Pimpri-Chinchwad Ward 18, Pune',
    batchId: 'BATCH-PN-05',
    batchName: 'Pune Ward 18 · Pimpri-Chinchwad Tailoring Center',
    primaryTrade: 'Veg Vending',
    cattleAssets: 'Iron Balance + Woven Baskets',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 7724',
    },
    attendancePct: 64,
    missedConsecutiveClasses: 2,
    homeVisitScheduled: false,
    practicalAssessmentScore: 70,
    m0BaselineIncome: 4400,
    m6SurveyStatus: 'Pending',
    m6CalculatedProfit: 5400,
    upiAdoption: 'Cash Only',
    gpsLocation: '18.6250° N, 73.8010° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
  {
    id: 'BEN-012',
    name: 'Varsha Bhosle',
    age: 35,
    villageWard: 'Wakad Ward 27, Pune',
    batchId: 'BATCH-PN-06',
    batchName: 'Pune Ward 27 · Wakad Food Processing',
    primaryTrade: 'Grocery/Kirana',
    cattleAssets: 'Dry Goods Display Storage',
    kycStatus: {
      aadhaarMasked: true,
      bankLinked: true,
      accountNumberMasked: '•••• 1980',
    },
    attendancePct: 70,
    missedConsecutiveClasses: 2,
    homeVisitScheduled: false,
    practicalAssessmentScore: 72,
    m0BaselineIncome: 5000,
    m6SurveyStatus: 'Pending',
    m6CalculatedProfit: 5900,
    upiAdoption: 'Cash Only',
    gpsLocation: '18.5987° N, 73.7680° E',
    gpsMatchStatus: 'Inside Geofence ✓',
  },
];

export const INITIAL_SURVEY_QA: SurveyQARecord[] = [
  {
    id: 'SRV-QA-01',
    beneficiaryId: 'BEN-001',
    beneficiaryName: 'Sunita Patil',
    batchId: 'BATCH-PN-01',
    fieldOfficer: 'Mithun K.',
    submissionTime: '14 mins ago',
    timestamp: Date.now() - 14 * 60 * 1000,
    m0BaselineIncome: 5200,
    m6CalculatedProfit: 7100,
    profitJumpPct: 36.5,
    daysWorkedWeekly: 6,
    goodDayRevenue: 550,
    slowDayRevenue: 250,
    weeklyInputCost: 600,
    upiReceiptsCount: '20+',
    resilienceSource: 'Personal savings',
    surveyDuration: '4m 12s',
    durationSeconds: 252,
    gpsCoordinates: '18.5204° N, 73.8567° E',
    gpsMatchRate: 99.4,
    gpsStatus: 'Inside Geofence ✓',
    hasAnomaly: false,
    anomalyType: 'none',
    qaStatus: 'pending_qa',
  },
  {
    id: 'SRV-QA-02',
    beneficiaryId: 'BEN-003',
    beneficiaryName: 'Kavita Shinde',
    batchId: 'BATCH-PN-03',
    fieldOfficer: 'Pooja Salve',
    submissionTime: '1 hr ago',
    timestamp: Date.now() - 60 * 60 * 1000,
    m0BaselineIncome: 4200,
    m6CalculatedProfit: 14800,
    profitJumpPct: 252.4,
    daysWorkedWeekly: 7,
    goodDayRevenue: 1200,
    slowDayRevenue: 600,
    weeklyInputCost: 1400,
    upiReceiptsCount: '20+',
    resilienceSource: 'SHG emergency fund',
    surveyDuration: '5m 40s',
    durationSeconds: 340,
    gpsCoordinates: '18.4912° N, 73.8214° E',
    gpsMatchRate: 98.8,
    gpsStatus: 'Inside Geofence ✓',
    hasAnomaly: true,
    anomalyType: 'high_jump',
    anomalyNote: 'Jump > 200%: Bulk wedding order for 45 festive kurtas delivered in last 14 days.',
    qaStatus: 'pending_qa',
  },
];

export const INITIAL_AUDIT_EVENTS: LiveAuditEvent[] = [
  {
    id: 'EVT-01',
    timestamp: '25 mins ago',
    type: 'survey_synced',
    title: 'M6 Survey Approved & Published',
    detail: 'Meena Deshmukh (Hadapsar Batch 02) verified: +₹2,350 monthly lift · 99.4% GPS lock',
    actor: 'Rajesh Gaikwad (Pratham TL)',
    batchOrBeneficiary: 'Meena Deshmukh · Hadapsar',
  },
  {
    id: 'EVT-02',
    timestamp: '1 hr ago',
    type: 'attendance_logged',
    title: 'GPS-Verified Attendance Synchronized',
    detail: 'Batch PN-02 (Hadapsar Dairy): 21/22 present (95.5%) · Module 12 completed',
    actor: 'Mithun K. (Field Officer)',
    batchOrBeneficiary: 'Batch PN-02',
  },
  {
    id: 'EVT-03',
    timestamp: '3 hrs ago',
    type: 'survey_synced',
    title: 'M6 Survey Approved & Published',
    detail: 'Anita Kamble (Shivajinagar Batch 04) verified: +₹2,200 monthly lift · 99.1% GPS lock',
    actor: 'Rajesh Gaikwad (Pratham TL)',
    batchOrBeneficiary: 'Anita Kamble · Shivajinagar',
  },
];

// ─── REACT CONTEXT & STORE ─────────────────────────────────────────────────

export interface ImpactStoreContextType {
  // Master Records
  ngos: NGOStoreRecord[];
  decisions: ExecutiveDecision[];

  // Spatial Geographies & Multi-District Allocations
  districtAllocations: DistrictAllocation[];
  operationalCentres: OperationalCentre[];
  serviceGapBlocks: ServiceGapBlock[];
  stateRollups: StateRollup[];
  portfolioBenchmarks: {
    puneWeightedMean: number;
    portfolioWeightedMean: number;
  };
  earmarkedReserveCr: number;
  earmarkReserveForGap: (blockId: string, amountCr: number) => void;

  // Operational ERP & Field Entities
  batches: BatchRecord[];
  beneficiaries: BeneficiaryRecord[];
  surveyQAQueue: SurveyQARecord[];
  fieldErpPulse: {
    syncedSurveysCount: number;
    weeklyAttendancePct: number;
    activeBatchesCount: number;
    pendingQACount: number;
    recentAuditEvents: LiveAuditEvent[];
  };

  // Dynamic Portfolio Totals (Derived from live records)
  portfolio: {
    committedCr: number; // 42.0
    disbursedCr: number; // dynamically computed
    reserveCr: number;   // 42.0 - disbursedCr
    disbursedPct: number;
    totalEnrolled: number; // 42,850
    totalVerified: number; // 39,695
    partnersCount: number; // 6
    statesCount: number;   // 3 (MH, MP, TN)
    districtsCount: number;
    onTargetCount: number; // 5
    flaggedCount: number;  // 1 (Magic Bus)
    auditGeofenceAvgPct: number;
  };

  // Dynamic Programme Totals
  microSkilling: {
    committedCr: number; // 28.0
    disbursedCr: number; // dynamically computed (26.4 initially)
    reserveCr: number;
    enrolled: number;    // 28,400
    verified: number;    // 26,242 (92.4%)
    completionRate: number;
    activePartnersCount: number; // 4
    flaggedPartnersCount: number; // 1
  };

  literacy: {
    committedCr: number; // 14.0
    disbursedCr: number; // dynamically computed (12.0 initially)
    reserveCr: number;
    enrolled: number;    // 14,450
    verified: number;    // 13,453 (93.1%)
    completionRate: number;
    activePartnersCount: number; // 2
    flaggedPartnersCount: number; // 0
  };

  // Fixed Outcome Sets
  microScorecard: ScorecardMetric[];
  literacyScorecard: ScorecardMetric[];

  // Micro-Skilling Detailed Math (n = 26,242)
  microMath: {
    verifiedSample: number; // 26,242
    earningsDistribution: {
      declined: { pct: number; count: number }; // 8% (2,099)
      noChange: { pct: number; count: number }; // 19% (4,986)
      moderate: { pct: number; count: number }; // 38% (9,972)
      strong: { pct: number; count: number };   // 24% (6,298)
      veryStrong: { pct: number; count: number }; // 11% (2,887)
      totalGrowing: { pct: number; count: number }; // 73% (19,157)
    };
    enterpriseSurvival: {
      activeBaselinePct: number; // 61%
      activeBaselineCount: number; // 16,008
      activeEndlinePct: number; // 79%
      activeEndlineCount: number; // 20,731
      netNewEnterprises: number; // +4,723
      survivalRatePct: number; // 78%
      sustainedCount: number; // 16,170
      closedCount: number; // 4,561
      closureCauses: {
        workingCapital: { pct: number; count: number }; // 44% (2,007)
        seasonalDemand: { pct: number; count: number }; // 31% (1,414)
        household: { pct: number; count: number };      // 25% (1,140)
      };
    };
    financialDigital: {
      bankAccountPct: number; // 76% (19,944)
      bankAccountCount: number;
      upiQrPct: number; // 64% (16,795)
      upiQrCount: number;
      formalCreditPct: number; // 31% (8,135)
      formalCreditCount: number;
      digitalBookkeepingPct: number; // 28% (7,348)
      digitalBookkeepingCount: number;
      cashOnlyCount: number; // 9,440
    };
  };

  // Live Mutating Actions
  approveTranche: (decisionIdOrNgoId: string) => void;
  holdTranche: (decisionIdOrNgoId: string) => void;
  resetAllData: () => void;

  // Audit Dispute & Tranche Governance
  auditCases: AuditCaseRecord[];
  addCaseMessage: (caseId: string, author: string, role: string, text: string, isFunder?: boolean) => void;
  orderReAudit: (caseId: string, instructions?: string) => void;
  clearAuditHold: (ngoIdOrCaseId: string, resolutionNote?: string) => void;

  // Capital Reallocation Simulator
  draftAllocation: Record<string, number>;
  saveDraftAllocation: (alloc: Record<string, number>) => void;

  // Operational ERP & Field Mobile Actions
  markBatchAttendance: (batchId: string, presentBeneficiaryIds: string[], lectureTopic?: string) => void;
  submitFieldSurvey: (
    beneficiaryId: string,
    payload: {
      daysWorkedWeekly: number;
      goodDayRevenue: number;
      slowDayRevenue: number;
      weeklyInputCost: number;
      calculatedProfit: number;
      upiReceiptsCount: '0' | '1–5' | '6–20' | '20+';
      resilienceSource: string;
      durationSeconds: number;
      anomalyNote?: string;
    }
  ) => void;
  approveAndPublishSurvey: (surveyId: string) => void;
  returnSurvey: (surveyId: string, reason: string) => void;
  assignHomeVisit: (beneficiaryId: string, notes: string) => void;
}

const ImpactStoreContext = createContext<ImpactStoreContextType | null>(null);

export const ImpactStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ngos, setNgos] = useState<NGOStoreRecord[]>(CANONICAL_NGOS);
  const [decisions, setDecisions] = useState<ExecutiveDecision[]>(INITIAL_DECISIONS);

  // Operational State (NGO ERP & Field Mobile App)
  const [batches, setBatches] = useState<BatchRecord[]>(INITIAL_BATCHES);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRecord[]>(INITIAL_BENEFICIARIES);
  const [surveyQAQueue, setSurveyQAQueue] = useState<SurveyQARecord[]>(INITIAL_SURVEY_QA);
  const [syncedSurveysCount, setSyncedSurveysCount] = useState<number>(3410);
  const [auditEvents, setAuditEvents] = useState<LiveAuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [auditCases, setAuditCases] = useState<AuditCaseRecord[]>(INITIAL_AUDIT_CASES);
  const [draftAllocation, setDraftAllocation] = useState<Record<string, number>>(DEFAULT_ALLOCATION);

  // Spatial Geographies & Multi-District Allocations State
  const [serviceGapBlocks, setServiceGapBlocks] = useState<ServiceGapBlock[]>(CANONICAL_SERVICE_GAP_BLOCKS);
  const [earmarkedReserveCr, setEarmarkedReserveCr] = useState<number>(0);
  const districtAllocations = CANONICAL_DISTRICT_ALLOCATIONS;
  const operationalCentres = CANONICAL_OPERATIONAL_CENTRES;

  // Portfolio Benchmarks (Dynamically weighted)
  const portfolioBenchmarks = useMemo(() => {
    // Pune Beneficiary-Weighted Mean: (9200×84.2 + 2500×79.6 + 1400×71.8) / 13100 = 82.0
    const puneWeightedMean = 82.0;
    // Portfolio Benchmark across all 42,850 women = 76.8
    const portfolioWeightedMean = 76.8;
    return { puneWeightedMean, portfolioWeightedMean };
  }, []);

  // Dynamic State Rollups (Summing strictly to 42,850 women across 3 states)
  const stateRollups = useMemo<StateRollup[]>(() => {
    const mhAlloc = districtAllocations.filter(d => d.state === 'Maharashtra');
    const mpAlloc = districtAllocations.filter(d => d.state === 'Madhya Pradesh');
    const tnAlloc = districtAllocations.filter(d => d.state === 'Tamil Nadu');

    const totalWomen = 42850;
    const mhWomen = mhAlloc.reduce((s, a) => s + a.women, 0); // 23,250 (54.3%)
    const mpWomen = mpAlloc.reduce((s, a) => s + a.women, 0); // 12,000 (28.0%)
    const tnWomen = tnAlloc.reduce((s, a) => s + a.women, 0); // 7,600 (17.7%)

    const mhDisbursedCr = mhAlloc.reduce((s, a) => s + a.grantDisbursed, 0) / 10000000;
    const mpDisbursedCr = mpAlloc.reduce((s, a) => s + a.grantDisbursed, 0) / 10000000;
    const tnDisbursedCr = tnAlloc.reduce((s, a) => s + a.grantDisbursed, 0) / 10000000;

    return [
      {
        state: 'Maharashtra',
        women: mhWomen,
        pct: Number(((mhWomen / totalWomen) * 100).toFixed(1)),
        grantDisbursedCr: Number(mhDisbursedCr.toFixed(2)),
        ngos: ['Pratham Foundation', 'Smile Foundation', 'Magic Bus', 'Room to Read'],
        districts: ['Pune', 'Thane', 'Nashik'],
        liftDescription: '+28% lift',
        regionalSubtext: 'Pune, Thane, Nashik industrial & peri-urban belts',
      },
      {
        state: 'Madhya Pradesh',
        women: mpWomen,
        pct: Number(((mpWomen / totalWomen) * 100).toFixed(1)),
        grantDisbursedCr: Number(mpDisbursedCr.toFixed(2)),
        ngos: ['Goonj', 'Educate Girls'],
        districts: ['Chhindwara', 'Jabalpur'],
        liftDescription: '+22% lift',
        regionalSubtext: 'Chhindwara, Jabalpur rural tribal blocks',
      },
      {
        state: 'Tamil Nadu',
        women: tnWomen,
        pct: Number(((tnWomen / totalWomen) * 100).toFixed(1)),
        grantDisbursedCr: Number(tnDisbursedCr.toFixed(2)),
        ngos: ['Smile Foundation'],
        districts: ['Coimbatore'],
        liftDescription: '+24% lift',
        regionalSubtext: 'Coimbatore textile & agro-enterprise blocks',
      },
    ];
  }, [districtAllocations]);

  // Compute live portfolio statistics
  const portfolio = useMemo(() => {
    const committedCr = 42.0;
    const totalDisbursedINR = ngos.reduce((sum, n) => sum + n.grantDisbursed, 0);
    const disbursedCr = Number((totalDisbursedINR / 10000000).toFixed(2));
    const reserveCr = Number((committedCr - disbursedCr - earmarkedReserveCr).toFixed(2));
    const disbursedPct = Number(((disbursedCr / committedCr) * 100).toFixed(1));
    const totalEnrolled = ngos.reduce((sum, n) => sum + n.enrolled, 0);
    const totalVerified = ngos.reduce((sum, n) => sum + n.retained, 0);
    const partnersCount = ngos.length;
    const statesCount = new Set(ngos.map(n => n.state)).size;
    const districtsCount = new Set(ngos.map(n => n.district)).size;
    const flaggedCount = ngos.filter(n => n.auditStatus === 'flagged').length;
    const onTargetCount = partnersCount - flaggedCount;
    const auditGeofenceAvgPct = Math.round(
      ngos.reduce((sum, n) => sum + n.auditFlags.gpsGeofencePassPct, 0) / partnersCount
    );

    return {
      committedCr,
      disbursedCr,
      reserveCr,
      disbursedPct,
      totalEnrolled,
      totalVerified,
      partnersCount,
      statesCount,
      districtsCount,
      onTargetCount,
      flaggedCount,
      auditGeofenceAvgPct,
    };
  }, [ngos]);

  // Compute live programme statistics
  const microSkilling = useMemo(() => {
    const microNgos = ngos.filter(n => n.program === 'micro-skilling');
    const committedCr = 28.0;
    const totalDisbursedINR = microNgos.reduce((sum, n) => sum + n.grantDisbursed, 0);
    const disbursedCr = Number((totalDisbursedINR / 10000000).toFixed(2));
    const reserveCr = Number((committedCr - disbursedCr).toFixed(2));
    const enrolled = microNgos.reduce((sum, n) => sum + n.enrolled, 0);
    const verified = microNgos.reduce((sum, n) => sum + n.retained, 0);
    const completionRate = 92.4;
    const activePartnersCount = microNgos.length;
    const flaggedPartnersCount = microNgos.filter(n => n.auditStatus === 'flagged').length;

    return {
      committedCr,
      disbursedCr,
      reserveCr,
      enrolled,
      verified,
      completionRate,
      activePartnersCount,
      flaggedPartnersCount,
    };
  }, [ngos]);

  const literacy = useMemo(() => {
    const litNgos = ngos.filter(n => n.program === 'literacy');
    const committedCr = 14.0;
    const totalDisbursedINR = litNgos.reduce((sum, n) => sum + n.grantDisbursed, 0);
    const disbursedCr = Number((totalDisbursedINR / 10000000).toFixed(2));
    const reserveCr = Number((committedCr - disbursedCr).toFixed(2));
    const enrolled = litNgos.reduce((sum, n) => sum + n.enrolled, 0);
    const verified = litNgos.reduce((sum, n) => sum + n.retained, 0);
    const completionRate = 93.1;
    const activePartnersCount = litNgos.length;
    const flaggedPartnersCount = litNgos.filter(n => n.auditStatus === 'flagged').length;

    return {
      committedCr,
      disbursedCr,
      reserveCr,
      enrolled,
      verified,
      completionRate,
      activePartnersCount,
      flaggedPartnersCount,
    };
  }, [ngos]);

  // Fixed outcome specifications
  const microScorecard = CANONICAL_MICRO_SCORECARD;
  const literacyScorecard = CANONICAL_LITERACY_SCORECARD;

  // Single mathematical truth for Micro-Skilling (n = 26,242)
  const microMath = useMemo(() => ({
    verifiedSample: 26242,
    earningsDistribution: {
      declined: { pct: 8, count: 2099 },
      noChange: { pct: 19, count: 4986 },
      moderate: { pct: 38, count: 9972 },
      strong: { pct: 24, count: 6298 },
      veryStrong: { pct: 11, count: 2887 },
      totalGrowing: { pct: 73, count: 19157 },
    },
    enterpriseSurvival: {
      activeBaselinePct: 61,
      activeBaselineCount: 16008,
      activeEndlinePct: 79,
      activeEndlineCount: 20731,
      netNewEnterprises: 4723,
      survivalRatePct: 78,
      sustainedCount: 16170,
      closedCount: 4561, // User strict specification: replaces 1,837
      closureCauses: {
        workingCapital: { pct: 44, count: 2007 },
        seasonalDemand: { pct: 31, count: 1414 },
        household: { pct: 25, count: 1140 },
      },
    },
    financialDigital: {
      bankAccountPct: 76,
      bankAccountCount: 19944,
      upiQrPct: 64,
      upiQrCount: 16795,
      formalCreditPct: 31,
      formalCreditCount: 8135,
      digitalBookkeepingPct: 28,
      digitalBookkeepingCount: 7348,
      cashOnlyCount: 9440,
    },
  }), []);

  // Action: Approve Tranche
  const approveTranche = useCallback((id: string) => {
    // Check if id matches decisionId or ngoId
    const targetDecision = decisions.find(d => d.id === id || d.ngoId === id);
    const targetNgoId = targetDecision ? targetDecision.ngoId : id;

    setNgos(prevNgos =>
      prevNgos.map(ngo => {
        if (ngo.ngoId === targetNgoId && !ngo.trancheApproved) {
          const addDisbursed = ngo.pendingTranche;
          return {
            ...ngo,
            grantDisbursed: ngo.grantDisbursed + addDisbursed,
            pendingTranche: 0,
            trancheApproved: true,
            trancheHeld: false,
          };
        }
        return ngo;
      })
    );

    setDecisions(prevDecisions =>
      prevDecisions.map(d => {
        if (d.id === id || d.ngoId === targetNgoId) {
          return { ...d, status: 'approved' };
        }
        return d;
      })
    );
  }, [decisions]);

  // Action: Hold Tranche
  const holdTranche = useCallback((id: string) => {
    const targetDecision = decisions.find(d => d.id === id || d.ngoId === id);
    const targetNgoId = targetDecision ? targetDecision.ngoId : id;

    setNgos(prevNgos =>
      prevNgos.map(ngo => {
        if (ngo.ngoId === targetNgoId) {
          return {
            ...ngo,
            trancheHeld: true,
            trancheApproved: false,
          };
        }
        return ngo;
      })
    );

    setDecisions(prevDecisions =>
      prevDecisions.map(d => {
        if (d.id === id || d.ngoId === targetNgoId) {
          return { ...d, status: 'held' };
        }
        return d;
      })
    );
  }, [decisions]);

  const resetAllData = useCallback(() => {
    setNgos(CANONICAL_NGOS);
    setDecisions(INITIAL_DECISIONS);
    setBatches(INITIAL_BATCHES);
    setBeneficiaries(INITIAL_BENEFICIARIES);
    setSurveyQAQueue(INITIAL_SURVEY_QA);
    setSyncedSurveysCount(3410);
    setAuditEvents(INITIAL_AUDIT_EVENTS);
    setAuditCases(INITIAL_AUDIT_CASES);
    setDraftAllocation(DEFAULT_ALLOCATION);
    setServiceGapBlocks(CANONICAL_SERVICE_GAP_BLOCKS);
    setEarmarkedReserveCr(0);
  }, []);

  // Action: Add Case Message
  const addCaseMessage = useCallback((caseId: string, author: string, role: string, text: string, isFunder: boolean = true) => {
    const newMsg: CaseMessage = {
      id: `msg-${Date.now()}`,
      author,
      role,
      timestamp: 'Just now',
      text,
      isFunder,
    };
    setAuditCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            thread: [...c.thread, newMsg],
          };
        }
        return c;
      })
    );

    if (isFunder) {
      const newEvt: LiveAuditEvent = {
        id: `EVT-${Date.now()}`,
        timestamp: 'Just now',
        type: 'tranche_approved',
        title: `Audit Case Note Filed`,
        detail: `Suman Bajaj posted to Case ${caseId}: "${text.slice(0, 60)}..."`,
        actor: 'Suman Bajaj (Head of CSR)',
        batchOrBeneficiary: caseId,
      };
      setAuditEvents(prev => [newEvt, ...prev]);
    }
  }, []);

  // Action: Order Re-Audit
  const orderReAudit = useCallback((caseId: string, instructions?: string) => {
    const noteText = instructions || 'Independent spot re-audit commissioned with KPMG field taskforce. 20 random beneficiary home visits scheduled for Thursday.';
    const newMsg: CaseMessage = {
      id: `msg-${Date.now()}`,
      author: 'Suman Bajaj',
      role: 'Head of CSR, Bajaj Finserv',
      timestamp: 'Just now',
      text: `ACTION: Independent Spot Re-Audit Commissioned. ${noteText}`,
      isFunder: true,
    };

    setAuditCases(prev =>
      prev.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 're_audit_ordered',
            thread: [...c.thread, newMsg],
          };
        }
        return c;
      })
    );

    const newEvt: LiveAuditEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: 'Just now',
      type: 're_audit_ordered',
      title: 'Independent Spot Re-Audit Commissioned',
      detail: `Case ${caseId}: KPMG forensic team dispatched for physical verification in Thane cluster.`,
      actor: 'Suman Bajaj (Head of CSR)',
      batchOrBeneficiary: 'Magic Bus (Thane)',
    };
    setAuditEvents(prev => [newEvt, ...prev]);
  }, []);

  // Action: Clear Audit Hold & Unlock Tranche
  const clearAuditHold = useCallback((idOrCaseId: string, resolutionNote?: string) => {
    const noteText = resolutionNote || 'Physical paper attendance registries verified against municipal voter roll. Hold cleared. ₹35 L tranche unlocked for disbursement.';
    const newMsg: CaseMessage = {
      id: `msg-${Date.now()}`,
      author: 'Suman Bajaj',
      role: 'Head of CSR, Bajaj Finserv',
      timestamp: 'Just now',
      text: `RESOLUTION: Audit Hold Cleared. ${noteText}`,
      isFunder: true,
    };

    setAuditCases(prev =>
      prev.map(c => {
        if (c.id === idOrCaseId || c.ngoId === idOrCaseId) {
          return {
            ...c,
            status: 'resolved',
            thread: [...c.thread, newMsg],
          };
        }
        return c;
      })
    );

    // Update Magic Bus in ngos
    setNgos(prevNgos =>
      prevNgos.map(ngo => {
        if (ngo.ngoId === 'magic-bus') {
          const addDisbursed = ngo.pendingTranche > 0 ? ngo.pendingTranche : 3500000;
          return {
            ...ngo,
            grantDisbursed: ngo.grantDisbursed + addDisbursed,
            pendingTranche: 0,
            trancheApproved: true,
            trancheHeld: false,
            auditStatus: 'verified',
            auditIntegrityScore: 88,
          };
        }
        return ngo;
      })
    );

    // Update decision
    setDecisions(prevDecisions =>
      prevDecisions.map(d => {
        if (d.id === 'dec-magic-bus' || d.ngoId === 'magic-bus') {
          return { ...d, status: 'approved' };
        }
        return d;
      })
    );

    const newEvt: LiveAuditEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'audit_hold_cleared',
      title: 'Audit Hold Cleared · ₹35 L Unlocked',
      detail: 'Magic Bus (Thane) compliance verified. ₹35 L milestone tranche released to CSR escrow.',
      actor: 'Suman Bajaj (Head of CSR)',
      batchOrBeneficiary: 'Magic Bus (Thane)',
    };
    setAuditEvents(prev => [newEvt, ...prev]);
  }, []);

  // Action: Save Draft Allocation
  const saveDraftAllocation = useCallback((alloc: Record<string, number>) => {
    setDraftAllocation(alloc);
    const newEvt: LiveAuditEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'allocation_saved',
      title: 'FY26 Capital Rebalancing Proposal Saved',
      detail: `Pratham: ₹${alloc.pratham} Cr, Smile: ₹${alloc.smile} Cr, Goonj: ₹${alloc.goonj} Cr, Magic Bus: ₹${alloc['magic-bus']} Cr. Total: ₹28.0 Cr.`,
      actor: 'Suman Bajaj (Head of CSR)',
      batchOrBeneficiary: 'Micro-Skilling Portfolio',
    };
    setAuditEvents(prev => [newEvt, ...prev]);
  }, []);

  // Dynamic fieldErpPulse calculation
  const fieldErpPulse = useMemo(() => {
    const totalAttendancePct = batches.length > 0
      ? Number((batches.reduce((sum, b) => sum + b.attendancePct, 0) / batches.length).toFixed(1))
      : 91.2;
    const pendingQACount = surveyQAQueue.filter(s => s.qaStatus === 'pending_qa').length;
    return {
      syncedSurveysCount,
      weeklyAttendancePct: totalAttendancePct,
      activeBatchesCount: batches.length,
      pendingQACount,
      recentAuditEvents: auditEvents,
    };
  }, [batches, surveyQAQueue, syncedSurveysCount, auditEvents]);

  // Operational Action 1: Mark Batch Attendance
  const markBatchAttendance = useCallback((batchId: string, presentIds: string[], lectureTopic?: string) => {
    const targetBatch = batches.find(b => b.id === batchId);
    if (!targetBatch) return;

    const newAttendancePct = Number(((presentIds.length / targetBatch.enrolledCount) * 100).toFixed(1));
    const newLectures = Math.min(targetBatch.totalLectures, targetBatch.lecturesCompleted + 1);

    setBatches(prev =>
      prev.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            attendancePct: newAttendancePct,
            lecturesCompleted: newLectures,
            currentModule: lectureTopic || b.currentModule,
          };
        }
        return b;
      })
    );

    setBeneficiaries(prev =>
      prev.map(ben => {
        if (ben.batchId === batchId) {
          const isPresent = presentIds.includes(ben.id);
          return {
            ...ben,
            missedConsecutiveClasses: isPresent ? 0 : ben.missedConsecutiveClasses + 1,
            attendancePct: isPresent
              ? Math.min(100, ben.attendancePct + 1)
              : Math.max(50, ben.attendancePct - 2),
          };
        }
        return ben;
      })
    );

    const newEvt: LiveAuditEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'attendance_logged',
      title: 'GPS-Verified Attendance Synchronized',
      detail: `${targetBatch.name}: ${presentIds.length}/${targetBatch.enrolledCount} present (${newAttendancePct}%) · ${lectureTopic || targetBatch.currentModule}`,
      actor: 'Mithun K. (Field Officer)',
      batchOrBeneficiary: targetBatch.name,
    };
    setAuditEvents(prev => [newEvt, ...prev]);
  }, [batches]);

  // Operational Action 2: Submit Field Survey (From Mobile App)
  const submitFieldSurvey = useCallback(
    (
      beneficiaryId: string,
      payload: {
        daysWorkedWeekly: number;
        goodDayRevenue: number;
        slowDayRevenue: number;
        weeklyInputCost: number;
        calculatedProfit: number;
        upiReceiptsCount: '0' | '1–5' | '6–20' | '20+';
        resilienceSource: string;
        durationSeconds: number;
        anomalyNote?: string;
      }
    ) => {
      const ben = beneficiaries.find(b => b.id === beneficiaryId);
      if (!ben) return;

      const jumpPct = Number((((payload.calculatedProfit - ben.m0BaselineIncome) / ben.m0BaselineIncome) * 100).toFixed(1));
      const hasHighJump = jumpPct > 200;
      const isSpeedrun = payload.durationSeconds < 60;
      const hasAnomaly = hasHighJump || isSpeedrun;

      const mins = Math.floor(payload.durationSeconds / 60);
      const secs = payload.durationSeconds % 60;
      const durStr = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

      const newQA: SurveyQARecord = {
        id: `SRV-QA-${Date.now()}`,
        beneficiaryId: ben.id,
        beneficiaryName: ben.name,
        batchId: ben.batchId,
        fieldOfficer: 'Mithun K.',
        submissionTime: 'Just now',
        timestamp: Date.now(),
        m0BaselineIncome: ben.m0BaselineIncome,
        m6CalculatedProfit: payload.calculatedProfit,
        profitJumpPct: jumpPct,
        daysWorkedWeekly: payload.daysWorkedWeekly,
        goodDayRevenue: payload.goodDayRevenue,
        slowDayRevenue: payload.slowDayRevenue,
        weeklyInputCost: payload.weeklyInputCost,
        upiReceiptsCount: payload.upiReceiptsCount,
        resilienceSource: payload.resilienceSource,
        surveyDuration: durStr,
        durationSeconds: payload.durationSeconds,
        gpsCoordinates: ben.gpsLocation,
        gpsMatchRate: 99.4,
        gpsStatus: 'Inside Geofence ✓',
        hasAnomaly,
        anomalyType: hasHighJump ? 'high_jump' : isSpeedrun ? 'speedrun' : 'none',
        anomalyNote: payload.anomalyNote || (hasHighJump ? 'High jump > 200% recorded' : undefined),
        qaStatus: 'pending_qa',
      };

      setSurveyQAQueue(prev => [newQA, ...prev]);

      setBeneficiaries(prev =>
        prev.map(b => {
          if (b.id === beneficiaryId) {
            return {
              ...b,
              m6SurveyStatus: 'In QA',
              m6CalculatedProfit: payload.calculatedProfit,
            };
          }
          return b;
        })
      );

      const newEvt: LiveAuditEvent = {
        id: `EVT-${Date.now()}`,
        timestamp: 'Just now',
        type: 'survey_synced',
        title: 'M6 Survey Queued for Team Leader QA',
        detail: `Field survey submitted for ${ben.name} (${ben.villageWard}): ₹${payload.calculatedProfit.toLocaleString('en-IN')}/mo estimated profit`,
        actor: 'Mithun K. (Field Officer)',
        batchOrBeneficiary: ben.name,
      };
      setAuditEvents(prev => [newEvt, ...prev]);
    },
    [beneficiaries]
  );

  // Operational Action 3: Approve & Publish Survey (By NGO Team Leader)
  const approveAndPublishSurvey = useCallback((surveyId: string) => {
    let targetBeneficiaryId = '';
    let benName = '';
    let lift = 0;
    let newProfit = 0;

    setSurveyQAQueue(prev =>
      prev.map(s => {
        if (s.id === surveyId) {
          targetBeneficiaryId = s.beneficiaryId;
          benName = s.beneficiaryName;
          lift = s.m6CalculatedProfit - s.m0BaselineIncome;
          newProfit = s.m6CalculatedProfit;
          return {
            ...s,
            qaStatus: 'approved_synced',
            approvedAt: 'Just now',
          };
        }
        return s;
      })
    );

    if (targetBeneficiaryId) {
      setBeneficiaries(prev =>
        prev.map(b => {
          if (b.id === targetBeneficiaryId) {
            return {
              ...b,
              m6SurveyStatus: 'Published to Bajaj',
              m6CalculatedProfit: newProfit || b.m6CalculatedProfit,
            };
          }
          return b;
        })
      );
    }

    setSyncedSurveysCount(prev => prev + 1);

    const newEvt: LiveAuditEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'survey_synced',
      title: 'M6 Survey Approved & Published to Bajaj',
      detail: `${benName || 'Beneficiary'} milestone verified: +₹${lift.toLocaleString('en-IN')} net lift · Audit-locked for CSR compliance`,
      actor: 'Rajesh Gaikwad (Pratham TL)',
      batchOrBeneficiary: benName,
    };
    setAuditEvents(prev => [newEvt, ...prev]);
  }, []);

  // Operational Action 4: Return Survey to Field Officer
  const returnSurvey = useCallback((surveyId: string, reason: string) => {
    let targetBeneficiaryId = '';
    let benName = '';

    setSurveyQAQueue(prev =>
      prev.map(s => {
        if (s.id === surveyId) {
          targetBeneficiaryId = s.beneficiaryId;
          benName = s.beneficiaryName;
          return {
            ...s,
            qaStatus: 'returned_for_revision',
            revisionReason: reason,
          };
        }
        return s;
      })
    );

    if (targetBeneficiaryId) {
      setBeneficiaries(prev =>
        prev.map(b => {
          if (b.id === targetBeneficiaryId) {
            return {
              ...b,
              m6SurveyStatus: 'Pending',
            };
          }
          return b;
        })
      );
    }

    const newEvt: LiveAuditEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'survey_synced',
      title: 'Survey Returned for Field Verification',
      detail: `${benName || 'Survey'} returned to Mithun K. Reason: ${reason}`,
      actor: 'Rajesh Gaikwad (Pratham TL)',
      batchOrBeneficiary: benName,
    };
    setAuditEvents(prev => [newEvt, ...prev]);
  }, []);

  // Operational Action 5: Assign Home Visit (By Team Leader)
  const assignHomeVisit = useCallback((beneficiaryId: string, notes: string) => {
    let benName = '';
    setBeneficiaries(prev =>
      prev.map(b => {
        if (b.id === beneficiaryId) {
          benName = b.name;
          return {
            ...b,
            homeVisitScheduled: true,
            homeVisitNotes: notes,
          };
        }
        return b;
      })
    );

    const newEvt: LiveAuditEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'home_visit_assigned',
      title: 'Home Visit Ticket Dispatched',
      detail: `Assigned to Mithun K. for ${benName || 'Beneficiary'}. Priority: Consecutive attendance drop. Note: ${notes}`,
      actor: 'Rajesh Gaikwad (Pratham TL)',
      batchOrBeneficiary: benName,
    };
    setAuditEvents(prev => [newEvt, ...prev]);
  }, []);

  // Spatial Action: Earmark Unallocated Reserve for Service Gap Block
  const earmarkReserveForGap = useCallback((blockId: string, amountCr: number) => {
    setServiceGapBlocks(prev =>
      prev.map(b => (b.id === blockId ? { ...b, status: 'earmarked' as const, earmarkedDate: 'Earmarked Q4' } : b))
    );
    setEarmarkedReserveCr(prev => Number((prev + amountCr).toFixed(2)));

    const block = CANONICAL_SERVICE_GAP_BLOCKS.find(b => b.id === blockId);
    const newEvt: LiveAuditEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: 'Just now',
      type: 'allocation_saved',
      title: `₹${amountCr} Cr Earmarked for Service Gap`,
      detail: `Capital earmarked from unallocated reserve for ${block?.name || blockId}. Priority expansion to unserved women.`,
      actor: 'Suman Bajaj (Head of CSR)',
      batchOrBeneficiary: block?.name || 'Service Gap Cluster',
    };
    setAuditEvents(prev => [newEvt, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      ngos,
      decisions,
      portfolio,
      microSkilling,
      literacy,
      microScorecard,
      literacyScorecard,
      microMath,
      batches,
      beneficiaries,
      surveyQAQueue,
      fieldErpPulse,
      approveTranche,
      holdTranche,
      resetAllData,
      auditCases,
      addCaseMessage,
      orderReAudit,
      clearAuditHold,
      draftAllocation,
      saveDraftAllocation,
      markBatchAttendance,
      submitFieldSurvey,
      approveAndPublishSurvey,
      returnSurvey,
      assignHomeVisit,
      districtAllocations,
      operationalCentres,
      serviceGapBlocks,
      stateRollups,
      portfolioBenchmarks,
      earmarkedReserveCr,
      earmarkReserveForGap,
    }),
    [
      ngos,
      decisions,
      portfolio,
      microSkilling,
      literacy,
      microScorecard,
      literacyScorecard,
      microMath,
      batches,
      beneficiaries,
      surveyQAQueue,
      fieldErpPulse,
      approveTranche,
      holdTranche,
      resetAllData,
      auditCases,
      addCaseMessage,
      orderReAudit,
      clearAuditHold,
      draftAllocation,
      saveDraftAllocation,
      markBatchAttendance,
      submitFieldSurvey,
      approveAndPublishSurvey,
      returnSurvey,
      assignHomeVisit,
      districtAllocations,
      operationalCentres,
      serviceGapBlocks,
      stateRollups,
      portfolioBenchmarks,
      earmarkedReserveCr,
      earmarkReserveForGap,
    ]
  );

  return <ImpactStoreContext.Provider value={value}>{children}</ImpactStoreContext.Provider>;
};

export const useImpactStore = (): ImpactStoreContextType => {
  const context = useContext(ImpactStoreContext);
  if (!context) {
    throw new Error('useImpactStore must be used within an ImpactStoreProvider');
  }
  return context;
};
