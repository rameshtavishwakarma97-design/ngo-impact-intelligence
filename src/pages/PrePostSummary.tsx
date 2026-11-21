import React, { useState } from 'react';
import {
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { ScreenId } from '../App';
import { useImpactStore } from '../data/impactStore';

interface PrePostSummaryProps {
  onNavigate?: (screen: ScreenId) => void;
  selectedProgram?: 'micro-skilling' | 'literacy';
}

export const PrePostSummary: React.FC<PrePostSummaryProps> = ({
  selectedProgram = 'micro-skilling',
}) => {
  const { microScorecard, literacyScorecard, microSkilling, literacy } = useImpactStore();
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const isMicro = selectedProgram === 'micro-skilling';
  const scorecardRows = isMicro ? microScorecard : literacyScorecard;

  const handlePrintScorecard = () => {
    setToastMessage({
      title: 'Boardroom Scorecard Generated',
      desc: `Exported clean 1-page PDF dossier for ${
        isMicro ? 'Micro-Skilling (28,400 Women)' : "Foundational Women's Literacy (14,450 Women)"
      }.`,
    });
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#FCFBF8] border border-[#E5DFD3] px-5 py-3.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={18} className="text-[#2E6B4E] flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#1C1917]">{toastMessage.title}</p>
            <p className="text-[11px] text-[#6B655C]">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* ── TOP EDITORIAL HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5DFD3] pb-5">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[#0B4A7D] tracking-wider block">
            {isMicro
              ? 'Intervention Impact Assessment · FY24–25 Audit'
              : 'FLN & Functional Literacy Assessment · FY24–25 Audit'}
          </span>
          <h1 className="font-narrative text-2xl sm:text-3xl font-medium text-[#1C1917] tracking-tight">
            6-Month Programme Scorecard: Before vs. After
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B655C]">
            <span className="font-medium text-[#2E6B4E] bg-[#E8F3EC] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Check size={12} strokeWidth={2.5} />
              <span>
                {isMicro
                  ? `All 6 outcomes field-verified · n = ${microSkilling.verified.toLocaleString('en-IN')} of ${microSkilling.enrolled.toLocaleString('en-IN')} · ${microSkilling.completionRate}% completion`
                  : `All 6 outcomes field-verified · n = ${literacy.verified.toLocaleString('en-IN')} of ${literacy.enrolled.toLocaleString('en-IN')} · ${literacy.completionRate}% completion`}
              </span>
            </span>
            <span className="text-[#8C8479]">·</span>
            <span>Quasi-Experimental Evaluation vs Waitlisted Control</span>
          </div>
        </div>

        {/* Action Button: Print Board Scorecard */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handlePrintScorecard}
            className="px-3.5 py-2 rounded-xl border border-[#E5DFD3] bg-[#FCFBF8] text-[#1C1917] text-xs font-semibold hover:border-[#0B4A7D] hover:text-[#0B4A7D] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer size={14} className="text-[#8C8479]" />
            <span>Print Board Scorecard</span>
          </button>
        </div>
      </div>

      {/* ── MAIN SCORECARD TABLE (HONEST CAUSAL COMPARISON) ─────────────────── */}
      <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] overflow-hidden shadow-2xs">
        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5DFD3] bg-[#F7F4ED]/60 text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider">
                <th className="py-3 px-5">Outcome Metric</th>
                <th className="py-3 px-4">Start (M0)</th>
                <th className="py-3 px-4">6 Months (M6)</th>
                <th className="py-3 px-4">Raw Change</th>
                <th className="py-3 px-4">Local Control Avg</th>
                <th className="py-3 px-4">True Programme Lift</th>
                <th className="py-3 px-5 text-right">Target Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD3]">
              {scorecardRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#F7F4ED]/40 transition-colors">
                  {/* Outcome Metric + Category */}
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-sm text-[#1C1917]">{row.name}</div>
                    <span className="text-[10px] uppercase font-medium text-[#8C8479] tracking-wider">
                      {row.category}
                    </span>
                  </td>

                  {/* Start (M0) */}
                  <td className="py-3.5 px-4 font-semibold text-[#1C1917] tabular-nums">
                    {row.baseline}
                  </td>

                  {/* 6 Months (M6) */}
                  <td className="py-3.5 px-4 font-bold text-[#1C1917] tabular-nums">
                    {row.endline}
                  </td>

                  {/* Raw Change */}
                  <td className="py-3.5 px-4 text-[#0B4A7D] font-semibold tabular-nums">
                    {row.rawChange}
                  </td>

                  {/* Local Control Avg */}
                  <td className="py-3.5 px-4 text-[#8C8479] tabular-nums">
                    {row.controlAvg}
                  </td>

                  {/* True Programme Lift */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#2E6B4E] tabular-nums block">
                      {row.trueLift}
                    </span>
                    <span className="text-[10px] text-[#6B655C]">
                      {row.pValueNote || 'Net foundation attribution'}
                    </span>
                  </td>

                  {/* Target Status - Clean single checkmark / alert (NO DOUBLE CHECKMARK) */}
                  <td className="py-3.5 px-5 text-right">
                    {row.status === 'Met' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E6B4E] bg-[#E8F3EC] px-2.5 py-1 rounded-full">
                        <Check size={12} strokeWidth={2.5} />
                        <span>Met</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A86414] bg-[#FEF6EE] px-2.5 py-1 rounded-full">
                        <AlertCircle size={12} strokeWidth={2} />
                        <span>Near Target (Watch)</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Scannable Cards View (< md) */}
        <div className="md:hidden divide-y divide-[#E5DFD3]">
          {scorecardRows.map((row) => (
            <div key={row.id} className="p-4 space-y-3 bg-[#FCFBF8]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                    {row.category}
                  </span>
                  <div className="font-semibold text-sm text-[#1C1917] mt-0.5">
                    {row.name}
                  </div>
                </div>
                {row.status === 'Met' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded-full flex-shrink-0">
                    <Check size={11} strokeWidth={2.5} />
                    <span>Met</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#A86414] bg-[#FEF6EE] px-2 py-0.5 rounded-full flex-shrink-0">
                    <AlertCircle size={11} strokeWidth={2} />
                    <span>Watch</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                  <span className="text-[10px] text-[#8C8479] uppercase block font-medium">Trajectory (M0 → M6)</span>
                  <div className="text-xs font-bold text-[#1C1917] tabular-nums mt-0.5">
                    {row.baseline} → {row.endline}
                  </div>
                  <span className="text-[10px] text-[#0B4A7D] font-semibold">
                    Raw: {row.rawChange}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#E8F3EC]/50 border border-[#2E6B4E]/20">
                  <span className="text-[10px] text-[#2E6B4E] uppercase block font-medium">True Net Lift</span>
                  <div className="text-xs font-bold text-[#2E6B4E] tabular-nums mt-0.5">
                    {row.trueLift}
                  </div>
                  <span className="text-[10px] text-[#6B655C]">
                    Control avg: {row.controlAvg}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLLAPSIBLE METHODOLOGY DISCLOSURE BAR ─────────────────────────── */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFBF8] overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F7F4ED]/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#0B4A7D]" />
            <div>
              <span className="text-xs font-semibold text-[#1C1917] block">
                How We Verify &amp; Isolate Impact
              </span>
              <span className="text-[11px] text-[#8C8479]">
                Quasi-experimental Difference-in-Differences (DiD) protocol
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8C8479]">
            <span className="text-[11px]">{methodologyOpen ? 'Hide Protocol' : 'Review Protocol'}</span>
            {methodologyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {methodologyOpen && (
          <div className="p-4 pt-1 border-t border-[#E5DFD3] bg-[#F7F4ED]/40 text-xs text-[#6B655C] space-y-3 animate-in fade-in duration-150 leading-relaxed">
            <p>
              To eliminate positive bias and distinguish Bajaj Foundation's actual intervention impact from organic regional wage drift, every cohort is evaluated against a <strong>waitlisted local peer control group</strong> ({isMicro ? 'n = 4,200 non-participating micro-vendors' : 'n = 2,800 rural adult learners'}) operating in identical municipal wards and weekly village haats.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[#FCFBF8] border border-[#E5DFD3]">
                <div className="font-semibold text-[#1C1917] text-xs mb-1">M6 Survey Completion</div>
                <div className="text-sm font-bold text-[#0B4A7D] tabular-nums">
                  {isMicro
                    ? `${microSkilling.completionRate}% (${microSkilling.verified.toLocaleString('en-IN')} of ${microSkilling.enrolled.toLocaleString('en-IN')})`
                    : `${literacy.completionRate}% (${literacy.verified.toLocaleString('en-IN')} of ${literacy.enrolled.toLocaleString('en-IN')})`}
                </div>
                <div className="text-[10px] text-[#8C8479] mt-0.5">Physical field survey with geo-tagged verification</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FCFBF8] border border-[#E5DFD3]">
                <div className="font-semibold text-[#1C1917] text-xs mb-1">Counterfactual Drift Control</div>
                <div className="text-sm font-bold text-[#1C1917] tabular-nums">
                  {isMicro ? '+₹420 / mo (+7.8%)' : '+22.4 pts (+131%)'}
                </div>
                <div className="text-[10px] text-[#8C8479] mt-0.5">Isolated from regional economic &amp; seasonal inflation</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FCFBF8] border border-[#E5DFD3]">
                <div className="font-semibold text-[#1C1917] text-xs mb-1">Statistical Confidence</div>
                <div className="text-sm font-bold text-[#0B4A7D] tabular-nums">p &lt; 0.001 (99.9% Conf.)</div>
                <div className="text-[10px] text-[#8C8479] mt-0.5">Two-tailed difference-in-differences t-test</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
