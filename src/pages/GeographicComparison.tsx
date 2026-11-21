import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  X,
  ArrowRight,
  AlertTriangle as Warning,
} from 'lucide-react';
import { useImpactStore, type NGOStoreRecord, type ProgramType, type RegionalTier } from '../data/impactStore';

interface GeographicComparisonProps {
  onNavigate?: (screenId: string) => void;
}

type HighlightMetric = 'outcome' | 'grant' | 'retention' | 'audit';

export const GeographicComparison: React.FC<GeographicComparisonProps> = ({ onNavigate }) => {
  const { ngos } = useImpactStore();

  const [programFilter, setProgramFilter] = useState<'all' | ProgramType>('all');
  const [tierFilter, setTierFilter] = useState<'all' | RegionalTier>('all');
  const [highlightedMetric, setHighlightedMetric] = useState<HighlightMetric>('outcome');
  const [selectedDistrictNgo, setSelectedDistrictNgo] = useState<NGOStoreRecord | null>(null);

  // Global ESC key listener to dismiss drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedDistrictNgo(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered district rows from canonical NGOs
  const filteredDistricts = useMemo(() => {
    return ngos.filter((n) => {
      const matchProgram = programFilter === 'all' || n.program === programFilter;
      const matchTier = tierFilter === 'all' || n.tier === tierFilter;
      return matchProgram && matchTier;
    });
  }, [ngos, programFilter, tierFilter]);

  // Aggregate tier metrics across 6 canonical districts
  const tierSummary = useMemo(() => {
    const ruralNgos = ngos.filter((n) => n.tier === 'Rural');
    const tier2Ngos = ngos.filter((n) => n.tier === 'Tier-2');
    const metroNgos = ngos.filter((n) => n.tier === 'Metro');

    const ruralWomen = ruralNgos.reduce((s, n) => s + n.enrolled, 0);
    const tier2Women = tier2Ngos.reduce((s, n) => s + n.enrolled, 0);
    const metroWomen = metroNgos.reduce((s, n) => s + n.enrolled, 0);

    const ruralDisbursed = ruralNgos.reduce((s, n) => s + n.grantDisbursed, 0) / 10000000;
    const tier2Disbursed = tier2Ngos.reduce((s, n) => s + n.grantDisbursed, 0) / 10000000;
    const metroDisbursed = metroNgos.reduce((s, n) => s + n.grantDisbursed, 0) / 10000000;

    return {
      rural: { women: ruralWomen, disbursedCr: ruralDisbursed, ngos: ruralNgos },
      tier2: { women: tier2Women, disbursedCr: tier2Disbursed, ngos: tier2Ngos },
      metro: { women: metroWomen, disbursedCr: metroDisbursed, ngos: metroNgos },
    };
  }, [ngos]);

  return (
    <div className="space-y-6 pb-24 text-[#1C1917]">
      {/* ── EDITORIAL PAGE HEADER ── */}
      <div className="space-y-1">
        <h1 className="font-narrative text-2xl sm:text-3xl font-normal text-[#1C1917]">
          Regional Equity & District Performance
        </h1>
        <p className="text-xs sm:text-sm text-[#6B655C] max-w-3xl leading-relaxed">
          Standardized saturation, outcome depth, and audit integrity disaggregated across 6 district clusters in Maharashtra, Madhya Pradesh, and Tamil Nadu.
        </p>
      </div>

      {/* ── DUAL INTERACTIVE FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-2xs">
        {/* Left: Programme Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-[#8C8479] mr-1 uppercase tracking-wider">
            Programme:
          </span>
          <button
            type="button"
            onClick={() => setProgramFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              programFilter === 'all'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#6B655C] hover:bg-[#EAE6DD] hover:text-[#1C1917]'
            }`}
          >
            All Programmes (42,850)
          </button>
          <button
            type="button"
            onClick={() => setProgramFilter('micro-skilling')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              programFilter === 'micro-skilling'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#6B655C] hover:bg-[#EAE6DD] hover:text-[#1C1917]'
            }`}
          >
            Micro-Skilling (28,400)
          </button>
          <button
            type="button"
            onClick={() => setProgramFilter('literacy')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              programFilter === 'literacy'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#6B655C] hover:bg-[#EAE6DD] hover:text-[#1C1917]'
            }`}
          >
            Women's Literacy (14,450)
          </button>
        </div>

        {/* Right: Regional Tier Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-[#8C8479] mr-1 uppercase tracking-wider">
            Tier:
          </span>
          {(['all', 'Rural', 'Tier-2', 'Metro'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTierFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                tierFilter === t
                  ? 'bg-[#181D24] text-white shadow-2xs'
                  : 'text-[#6B655C] hover:bg-[#EAE6DD] hover:text-[#1C1917]'
              }`}
            >
              {t === 'all' ? 'All Tiers' : t}
            </button>
          ))}
        </div>
      </div>

      {/* ── TOP STRIP: 3 CLEAN TIER COMPARISON SUMMARY TILES (ZERO BLACK CARDS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Rural Clusters */}
        <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
              Rural Clusters
            </span>
            <span className="text-xs font-semibold text-[#2E6B4E]">Highest Capital Return</span>
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#181D24] tabular-nums">
              {tierSummary.rural.women.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-[#646058]">women (28.0%)</span>
            </div>
            <div className="text-xs font-medium text-[#2E6B4E] mt-0.5 tabular-nums">
              ₹{tierSummary.rural.disbursedCr.toFixed(1)} Cr disbursed · Chhindwara & Jabalpur
            </div>
          </div>
          <p className="text-[11px] text-[#646058] leading-relaxed pt-2 border-t border-[#E5DFD3]">
            Deepest intake poverty; lowest cost per verified outcome (Goonj ₹4,400/grad · +34% lift) and highest FLN literacy lift (Educate Girls 83% FLN 3).
          </p>
        </div>

        {/* Tier 2: Tier-2 Clusters */}
        <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#B5532A] bg-[#FAEDE6] px-2 py-0.5 rounded">
              Tier-2 Clusters
            </span>
            <span className="text-xs font-semibold text-[#B5532A]">High Stability</span>
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#181D24] tabular-nums">
              {tierSummary.tier2.women.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-[#646058]">women (38.4%)</span>
            </div>
            <div className="text-xs font-medium text-[#B5532A] mt-0.5 tabular-nums">
              ₹{tierSummary.tier2.disbursedCr.toFixed(1)} Cr disbursed · Coimbatore & Nashik
            </div>
          </div>
          <p className="text-[11px] text-[#646058] leading-relaxed pt-2 border-t border-[#E5DFD3]">
            High merchant QR density in Coimbatore textile clusters (Smile 65%) and strong community library reading retention (Room to Read 81% FLN 3).
          </p>
        </div>

        {/* Tier 3: Metro Clusters */}
        <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#646058] bg-[#EEEAE0] px-2 py-0.5 rounded">
              Metro Clusters
            </span>
            <span className="text-xs font-semibold text-[#B42318]">1 Audit Hold (Thane)</span>
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#181D24] tabular-nums">
              {tierSummary.metro.women.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-[#646058]">women (33.6%)</span>
            </div>
            <div className="text-xs font-medium text-[#646058] mt-0.5 tabular-nums">
              ₹{tierSummary.metro.disbursedCr.toFixed(1)} Cr disbursed · Pune & Thane
            </div>
          </div>
          <p className="text-[11px] text-[#646058] leading-relaxed pt-2 border-t border-[#E5DFD3]">
            Highest nominal wage lift (+31% in Pune manufacturing), but urban relocation drop-off and 142 GPS anomalies flagged in Thane.
          </p>
        </div>
      </div>

      {/* ── MAIN VISUAL: DISTRICT OUTCOME & EQUITY MATRIX ── */}
      <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] overflow-hidden shadow-xs">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-narrative text-lg font-normal text-[#1C1917]">
              District Outcome & Governance Matrix
            </h2>
            <p className="text-xs text-[#6B655C] mt-0.5">
              Click any district row to view local baseline barriers and operational actions.
            </p>
          </div>

          {/* Metric Highlight Selector Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479] mr-1">
              Highlight:
            </span>
            {(
              [
                { key: 'outcome', label: 'Outcome Lift' },
                { key: 'grant', label: 'Grant Deployed' },
                { key: 'retention', label: 'Retention / Fluency' },
                { key: 'audit', label: 'Audit Score' },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setHighlightedMetric(m.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  highlightedMetric === m.key
                    ? 'bg-[#0B4A7D] text-white shadow-2xs'
                    : 'bg-[#F7F4ED] border border-[#E5DFD3] text-[#6B655C] hover:text-[#1C1917]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Clean Table for Desktop (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F4ED] text-[#8C8479] font-medium border-b border-[#E5DFD3] select-none text-[11px]">
                <th className="py-3 px-4 font-semibold text-[#1C1917]">District & State</th>
                <th className="py-3 px-4 font-semibold text-[#1C1917]">Tier</th>
                <th className="py-3 px-4 font-semibold text-[#1C1917]">Assigned NGO Partner</th>
                <th className="py-3 px-4 font-semibold text-[#1C1917]">Programme</th>
                <th className="py-3 px-4 text-right font-semibold text-[#1C1917]">Women Tracked</th>
                <th className="py-3 px-4 text-right font-semibold text-[#1C1917]">Grant Deployed</th>
                <th className="py-3 px-4 text-right font-semibold text-[#1C1917]">Outcome Lift</th>
                <th className="py-3 px-4 text-center font-semibold text-[#1C1917]">Audit Integrity</th>
                <th className="py-3 px-4 text-right font-semibold text-[#1C1917]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD3]">
              {filteredDistricts.map((ngo) => {
                const isHeld = ngo.trancheHeld || ngo.auditStatus === 'flagged';
                const isSelected = selectedDistrictNgo?.ngoId === ngo.ngoId;

                return (
                  <tr
                    key={ngo.ngoId}
                    onClick={() => setSelectedDistrictNgo(ngo)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#E7F0F7]/70'
                        : isHeld
                        ? 'hover:bg-[#FCECEB]/60'
                        : 'hover:bg-[#F7F4ED]/60'
                    }`}
                  >
                    {/* District & State */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
                        <MapPin size={14} className={isHeld ? 'text-[#B42318]' : 'text-[#0B4A7D]'} />
                        <span>{ngo.district}</span>
                      </div>
                      <span className="text-[10px] text-[#8C8479] pl-5 block">{ngo.state}</span>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ngo.tier === 'Rural'
                            ? 'bg-[#E8F3EC] text-[#2E6B4E]'
                            : ngo.tier === 'Tier-2'
                            ? 'bg-[#FAEDE6] text-[#B5532A]'
                            : 'bg-[#EAE6DD] text-[#1C1917]'
                        }`}
                      >
                        {ngo.tier}
                      </span>
                    </td>

                    {/* Assigned NGO */}
                    <td className="py-3.5 px-4 font-semibold text-[#1C1917]">
                      {ngo.ngoName}
                    </td>

                    {/* Programme */}
                    <td className="py-3.5 px-4 text-[11px] text-[#6B655C]">
                      {ngo.program === 'micro-skilling' ? 'Micro-Skilling' : "Women's Literacy"}
                    </td>

                    {/* Women Tracked */}
                    <td className="py-3.5 px-4 text-right font-semibold tabular-nums text-[#1C1917]">
                      {ngo.enrolled.toLocaleString('en-IN')}
                    </td>

                    {/* Grant Deployed */}
                    <td
                      className={`py-3.5 px-4 text-right tabular-nums font-semibold ${
                        highlightedMetric === 'grant' ? 'text-[#0B4A7D] bg-[#E7F0F7]/40' : 'text-[#1C1917]'
                      }`}
                    >
                      ₹{(ngo.grantDisbursed / 10000000).toFixed(2)} Cr
                      <span className="text-[10px] text-[#8C8479] block font-normal">
                        {ngo.utilizationRate}% utilized
                      </span>
                    </td>

                    {/* Outcome Lift */}
                    <td
                      className={`py-3.5 px-4 text-right tabular-nums font-semibold ${
                        highlightedMetric === 'outcome' ? 'text-[#0B4A7D] bg-[#E7F0F7]/40' : 'text-[#1C1917]'
                      }`}
                    >
                      {ngo.program === 'micro-skilling' ? (
                        <>
                          <span className={isHeld ? 'text-[#A86414]' : 'text-[#2E6B4E]'}>
                            +{ngo.rawLiftPct}% lift
                          </span>
                          <span className="text-[10px] text-[#8C8479] block font-normal">
                            +₹{ngo.extraMonthlyIncome.toLocaleString('en-IN')}/mo
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[#2E6B4E]">
                            {ngo.district === 'Jabalpur' ? '83.0%' : '81.0%'} FLN 3
                          </span>
                          <span className="text-[10px] text-[#8C8479] block font-normal">
                            Grade-level fluency
                          </span>
                        </>
                      )}
                    </td>

                    {/* Audit Integrity */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                          ngo.auditIntegrityScore >= 90
                            ? 'bg-[#E8F3EC] text-[#2E6B4E]'
                            : ngo.auditIntegrityScore >= 80
                            ? 'bg-[#FDF4E3] text-[#A86414]'
                            : 'bg-[#FCECEB] text-[#B42318]'
                        }`}
                      >
                        {ngo.auditIntegrityScore}/100
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDistrictNgo(ngo);
                        }}
                        className="text-[11px] font-semibold text-[#0B4A7D] hover:underline flex items-center justify-end gap-1 cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Scannable Cards View for Mobile (< md) */}
        <div className="md:hidden divide-y divide-[#E5DFD3]">
          {filteredDistricts.map((ngo) => {
            const isHeld = ngo.trancheHeld || ngo.auditStatus === 'flagged';
            const isSelected = selectedDistrictNgo?.ngoId === ngo.ngoId;

            return (
              <div
                key={ngo.ngoId}
                onClick={() => setSelectedDistrictNgo(ngo)}
                className={`p-4 space-y-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#E7F0F7]/70' : isHeld ? 'hover:bg-[#FCECEB]/60' : 'hover:bg-[#F7F4ED]/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className={isHeld ? 'text-[#B42318]' : 'text-[#0B4A7D]'} />
                    <div>
                      <div className="font-semibold text-sm text-[#1C1917]">{ngo.district}</div>
                      <div className="text-[10px] text-[#8C8479]">{ngo.state}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ngo.tier === 'Rural'
                          ? 'bg-[#E8F3EC] text-[#2E6B4E]'
                          : ngo.tier === 'Tier-2'
                          ? 'bg-[#FAEDE6] text-[#B5532A]'
                          : 'bg-[#EAE6DD] text-[#1C1917]'
                      }`}
                    >
                      {ngo.tier}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                        ngo.auditIntegrityScore >= 90
                          ? 'bg-[#E8F3EC] text-[#2E6B4E]'
                          : ngo.auditIntegrityScore >= 80
                          ? 'bg-[#FDF4E3] text-[#A86414]'
                          : 'bg-[#FCECEB] text-[#B42318]'
                      }`}
                    >
                      {ngo.auditIntegrityScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E5DFD3]/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C8479] block">Partner & Programme</span>
                    <span className="font-medium text-[#1C1917] block truncate">{ngo.ngoName}</span>
                    <span className="text-[10px] text-[#6B655C]">{ngo.program === 'micro-skilling' ? 'Micro-Skilling' : "Women's Literacy"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C8479] block">Women & Deployed</span>
                    <span className="font-semibold text-[#1C1917] tabular-nums">{ngo.enrolled.toLocaleString('en-IN')} women</span>
                    <span className="text-[10px] text-[#0B4A7D] block font-semibold">₹{(ngo.grantDisbursed / 10000000).toFixed(2)} Cr ({ngo.utilizationRate}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C8479] block">Outcome</span>
                    {ngo.program === 'micro-skilling' ? (
                      <span className={`text-xs font-semibold ${isHeld ? 'text-[#A86414]' : 'text-[#2E6B4E]'}`}>
                        +{ngo.rawLiftPct}% lift (+₹{ngo.extraMonthlyIncome.toLocaleString('en-IN')}/mo)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#2E6B4E]">
                        {ngo.district === 'Jabalpur' ? '83.0%' : '81.0%'} FLN 3
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDistrictNgo(ngo);
                    }}
                    className="text-xs font-semibold text-[#0B4A7D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Cluster</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 420px DISTRICT ACTION DRAWER (SLIDE-OVER IN ANIMATEPRESENCE) ── */}
      <AnimatePresence>
        {selectedDistrictNgo && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedDistrictNgo(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.26 }}
              className="relative z-10 w-full sm:max-w-[420px] max-h-[88dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
              <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-[#E5DFD3] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#0B4A7D]" />
                  <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
                    {selectedDistrictNgo.district} Cluster
                  </h2>
                  <span className="text-[10px] font-semibold text-[#8C8479] bg-[#EAE6DD] px-2 py-0.5 rounded">
                    {selectedDistrictNgo.tier}
                  </span>
                </div>
                <p className="text-xs text-[#6B655C]">
                  {selectedDistrictNgo.state} · Tender {selectedDistrictNgo.tenderId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDistrictNgo(null)}
                className="p-1 rounded-lg text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Assigned Partner Profile Card */}
            <div className="p-4 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8479]">
                  Operating Partner
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedDistrictNgo.auditStatus === 'flagged'
                      ? 'bg-[#FCECEB] text-[#B42318]'
                      : 'bg-[#E8F3EC] text-[#2E6B4E]'
                  }`}
                >
                  {selectedDistrictNgo.auditStatus === 'flagged' ? 'Audit Flagged' : 'KPMG Verified'}
                </span>
              </div>
              <div className="font-semibold text-[#1C1917] text-sm">
                {selectedDistrictNgo.ngoName}
              </div>
              <p className="text-[11px] text-[#6B655C]">
                {selectedDistrictNgo.program === 'micro-skilling'
                  ? 'Executing micro-entrepreneurship curriculum, seed inventory support, and UPI onboarding.'
                  : 'Executing FLN Level 1–3 foundational Hindi & Marathi literacy modules and digital learning tools.'}
              </p>
            </div>

            {/* District Baseline Structural Challenge */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C8479]">
                District Socio-Economic Terrain
              </h3>
              <div className="p-3.5 rounded-xl border border-[#E5DFD3] bg-[#FCFBF8] text-xs text-[#6B655C] leading-relaxed">
                {selectedDistrictNgo.district === 'Pune' && (
                  <p>
                    Peri-urban automotive and manufacturing belt. High wage competition creates 6.0% dropout leakage as women transition to formal factory shifts.
                  </p>
                )}
                {selectedDistrictNgo.district === 'Nashik' && (
                  <p>
                    Agri-processing hub with seasonal grape harvests. Female learners require evening library shifts to sustain FLN attendance during peak pruning cycles.
                  </p>
                )}
                {selectedDistrictNgo.district === 'Thane' && (
                  <p className="text-[#B42318]">
                    High-density urban sprawl in Mumbra & Kalwa. Field audit flagged 142 GPS coordinate anomalies and duplicate phone logs. Tranche release held in escrow.
                  </p>
                )}
                {selectedDistrictNgo.district === 'Jabalpur' && (
                  <p>
                    Rural central block with 48% tribal population. Highest baseline distance to schools; mobile FLN centers achieved exceptional 83% Grade-3 fluency.
                  </p>
                )}
                {selectedDistrictNgo.district === 'Chhindwara' && (
                  <p>
                    Forest-fringe tribal craft clusters. Low baseline income (₹4,800/mo) transformed by cotton handicraft haats into highest SROI in the portfolio (₹4.18 / ₹1).
                  </p>
                )}
                {selectedDistrictNgo.district === 'Coimbatore' && (
                  <p>
                    Power-loom textile corridor. High merchant QR readiness (65% active UPI merchants) and robust SHG micro-credit linkages across Salem & Coimbatore.
                  </p>
                )}
              </div>
            </div>

            {/* 4-Metric Verified Performance Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Women Enrolled</span>
                <div className="text-base font-semibold text-[#1C1917] tabular-nums mt-0.5">
                  {selectedDistrictNgo.enrolled.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#2E6B4E]">
                  {selectedDistrictNgo.retained.toLocaleString('en-IN')} retained
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Corpus Deployed</span>
                <div className="text-base font-semibold text-[#1C1917] tabular-nums mt-0.5">
                  ₹{(selectedDistrictNgo.grantDisbursed / 10000000).toFixed(2)} Cr
                </div>
                <span className="text-[10px] text-[#8C8479]">
                  of ₹{(selectedDistrictNgo.grantAllocated / 10000000).toFixed(2)} Cr
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Verified Gain</span>
                <div className="text-base font-semibold text-[#2E6B4E] tabular-nums mt-0.5">
                  {selectedDistrictNgo.program === 'micro-skilling'
                    ? `+₹${selectedDistrictNgo.extraMonthlyIncome.toLocaleString('en-IN')}`
                    : `${selectedDistrictNgo.district === 'Jabalpur' ? '83%' : '81%'} FLN 3`}
                </div>
                <span className="text-[10px] text-[#6B655C]">
                  {selectedDistrictNgo.program === 'micro-skilling' ? 'Monthly lift / household' : 'Reading fluency'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">Audit Score</span>
                <div
                  className={`text-base font-semibold tabular-nums mt-0.5 ${
                    selectedDistrictNgo.auditIntegrityScore >= 90 ? 'text-[#2E6B4E]' : 'text-[#B42318]'
                  }`}
                >
                  {selectedDistrictNgo.auditIntegrityScore}/100
                </div>
                <span className="text-[10px] text-[#8C8479]">
                  {selectedDistrictNgo.auditFlags.gpsGeofencePassPct}% GPS pass
                </span>
              </div>
            </div>

              </div>

              {/* Working Action Buttons with Emil/Jakub Tactile Feedback */}
              <div className="pt-4 border-t border-[#E5DFD3] space-y-2">
                {selectedDistrictNgo.auditStatus === 'flagged' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistrictNgo(null);
                      onNavigate?.('operations');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#B42318] text-white text-xs font-semibold hover:bg-[#991B1B] transition-transform duration-100 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B42318]/25"
                  >
                    <Warning size={14} />
                    <span>Review Audit Hold &amp; Case Docket →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistrictNgo(null);
                      onNavigate?.('ngo');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-transform duration-100 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25"
                  >
                    <span>Compare in NGO Partners →</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedDistrictNgo(null)}
                  className="w-full py-2 rounded-xl border border-[#E5DFD3] text-[#6B655C] hover:text-[#1C1917] text-xs font-medium transition-colors cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
