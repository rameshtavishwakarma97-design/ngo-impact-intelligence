// Reconciled econometric & operational dataset for NGO Performance, derived from canonical ImpactStore

import {
  CANONICAL_NGOS,
  type NGOStoreRecord,
  type ProgramType,
  type RegionalTier,
  type LongitudinalPoint,
} from './impactStore';

export type { ProgramType, RegionalTier, LongitudinalPoint };

export type NGOProgramRecord = NGOStoreRecord;

export const CONTROL_BENCHMARK: Record<ProgramType, LongitudinalPoint[]> = {
  'micro-skilling': [
    { wave: 'M0', value: 5100, ciLow: 4950, ciHigh: 5250, pctLift: 0 },
    { wave: 'M3', value: 5250, ciLow: 5050, ciHigh: 5450, pctLift: 2.9 },
    { wave: 'M6', value: 5450, ciLow: 5250, ciHigh: 5650, pctLift: 6.9 },
    { wave: 'M12', value: 5580, ciLow: 5350, ciHigh: 5800, pctLift: 9.4 },
  ],
  'literacy': [
    { wave: 'M0', value: 17, ciLow: 15, ciHigh: 19, pctLift: 0 },
    { wave: 'M3', value: 24, ciLow: 21, ciHigh: 27, pctLift: 41.2 },
    { wave: 'M6', value: 39, ciLow: 35, ciHigh: 43, pctLift: 129.4 },
    { wave: 'M12', value: 42, ciLow: 38, ciHigh: 46, pctLift: 147.1 },
  ],
};

export const NGO_RECORDS: NGOProgramRecord[] = CANONICAL_NGOS;

// Helper to filter and aggregate for Portfolio Ribbon
export function computePortfolioKPIs(records: NGOProgramRecord[]) {
  if (records.length === 0) {
    return {
      totalGrantDisbursed: 0,
      blendedUtilization: 0,
      blendedSROI: 0,
      avgCostPerOutcome: 0,
      avgNetLift: 0,
      auditScore: 0,
      totalEnrolled: 0,
      totalOutcomes: 0,
    };
  }

  const totalGrant = records.reduce((acc, r) => acc + r.grantDisbursed, 0);
  const totalAllocated = records.reduce((acc, r) => acc + r.grantAllocated, 0);
  const totalEnrolled = records.reduce((acc, r) => acc + r.enrolled, 0);
  const totalRetained = records.reduce((acc, r) => acc + r.retained, 0);

  // SROI weighted by grant spend
  const blendedSROI =
    records.reduce((acc, r) => acc + r.sroiMultiplier * r.grantDisbursed, 0) / (totalGrant || 1);

  // Cost per outcome weighted
  const avgCostPerOutcome = Math.round(
    records.reduce((acc, r) => acc + r.costPerOutcome * r.retained, 0) / (totalRetained || 1)
  );

  // Net lift weighted by enrolled
  const avgNetLift =
    records.reduce((acc, r) => acc + r.didNetAttributableLiftPct * r.enrolled, 0) / (totalEnrolled || 1);

  // Audit score average
  const auditScore = Math.round(
    records.reduce((acc, r) => acc + r.auditIntegrityScore, 0) / records.length
  );

  const blendedUtilization =
    totalAllocated > 0 ? Math.round((totalGrant / totalAllocated) * 1000) / 10 : 0;

  return {
    totalGrantDisbursed: totalGrant,
    blendedUtilization,
    blendedSROI: Math.round(blendedSROI * 100) / 100,
    avgCostPerOutcome,
    avgNetLift: Math.round(avgNetLift * 10) / 10,
    auditScore,
    totalEnrolled,
    totalOutcomes: totalRetained,
  };
}
