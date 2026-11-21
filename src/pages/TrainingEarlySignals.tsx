import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle as Warning,
  ArrowRight,
  CheckCircle2 as CheckCircle,
} from 'lucide-react';

interface TrainingEarlySignalsProps {
  onNavigate?: (screenId: string) => void;
}

interface ScatterPoint {
  ngoId: string;
  name: string;
  district: string;
  state: string;
  program: string;
  completionPct: number; // X-axis (M3 Curriculum Completion)
  retentionPct: number;  // Y-axis (M6 Outcome Retention / Fluency)
  status: 'verified' | 'flagged';
  enrolled: number;
  highlightNote: string;
  dx: number;
  dy: number;
  textAnchor: 'start' | 'end';
}

export const TrainingEarlySignals: React.FC<TrainingEarlySignalsProps> = ({ onNavigate }) => {
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  // 6 Canonical NGOs mapped to real Quality vs Retention coordinates
  const scatterPoints: ScatterPoint[] = [
    {
      ngoId: 'goonj',
      name: 'Goonj',
      district: 'Chhindwara',
      state: 'Madhya Pradesh',
      program: 'Micro-Skilling',
      completionPct: 96.0,
      retentionPct: 93.0,
      status: 'verified',
      enrolled: 3900,
      highlightNote: '96% completion; 93% active handicraft enterprise survival.',
      dx: 12,
      dy: -5,
      textAnchor: 'start',
    },
    {
      ngoId: 'educate-girls',
      name: 'Educate Girls',
      district: 'Jabalpur',
      state: 'Madhya Pradesh',
      program: "Women's Literacy",
      completionPct: 95.0,
      retentionPct: 88.0,
      status: 'verified',
      enrolled: 8100,
      highlightNote: '95% attendance; 88% sustained Grade-3 reading retention.',
      dx: 12,
      dy: 7,
      textAnchor: 'start',
    },
    {
      ngoId: 'pratham',
      name: 'Pratham Foundation',
      district: 'Pune',
      state: 'Maharashtra',
      program: 'Micro-Skilling',
      completionPct: 94.0,
      retentionPct: 86.0,
      status: 'verified',
      enrolled: 9200,
      highlightNote: '94% completion; 86% verified 6-mo enterprise survival.',
      dx: 12,
      dy: 24,
      textAnchor: 'start',
    },
    {
      ngoId: 'room-to-read',
      name: 'Room to Read',
      district: 'Nashik',
      state: 'Maharashtra',
      program: "Women's Literacy",
      completionPct: 91.0,
      retentionPct: 85.0,
      status: 'verified',
      enrolled: 6350,
      highlightNote: '91% attendance; 85% community library reading continuity.',
      dx: -12,
      dy: -5,
      textAnchor: 'end',
    },
    {
      ngoId: 'smile',
      name: 'Smile Foundation',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      program: 'Micro-Skilling',
      completionPct: 93.0,
      retentionPct: 84.0,
      status: 'verified',
      enrolled: 10100,
      highlightNote: '93% completion; 84% active merchant retention in textile hubs.',
      dx: -12,
      dy: 18,
      textAnchor: 'end',
    },
    {
      ngoId: 'magic-bus',
      name: 'Magic Bus',
      district: 'Thane',
      state: 'Maharashtra',
      program: 'Micro-Skilling',
      completionPct: 78.0,
      retentionPct: 62.0,
      status: 'flagged',
      enrolled: 5200,
      highlightNote: 'FLAGGED: 78% completion; steep drop to 62% survival + 142 GPS anomalies.',
      dx: -12,
      dy: -4,
      textAnchor: 'end',
    },
  ];

  return (
    <div className="space-y-6 pb-24 text-[#1C1917]">
      {/* ── EDITORIAL HEADLINE BANNER (ZERO BLACK CARDS) ── */}
      <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#0B4A7D]">
            Curriculum Rigor & Milestone Integrity
          </span>
          <span className="text-xs text-[#8C8479]">·</span>
          <span className="text-xs font-medium text-[#2E6B4E] flex items-center gap-1">
            <ShieldCheck size={14} />
            M3 Completion vs M6 Survival Audit
          </span>
        </div>

        <h1 className="font-narrative text-2xl sm:text-3xl font-normal text-[#1C1917] leading-snug max-w-4xl">
          5 of 6 NGO partners meet the ≥85% curriculum quality benchmark—Magic Bus (Thane) shows incomplete delivery (78% completion · 62% retention) under audit review.
        </h1>

        <p className="text-xs text-[#6B655C] max-w-3xl leading-relaxed">
          Frontline telemetry correlating M3 classroom completion with M6 enterprise survival and literacy retention across 42,850 enrolled women.
        </p>
      </div>

      {/* ── 4 BORDERLESS OPEN-CANVAS STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] shadow-xs">
        {/* Stat 1: Avg Curriculum Completion */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8479] block">
            Avg. Curriculum Completion
          </span>
          <div className="text-2xl font-semibold text-[#2E6B4E] tabular-nums">
            89.4%
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#2E6B4E] font-medium">
            <CheckCircle size={13} />
            <span>Target ≥85% · On Target</span>
          </div>
        </div>

        {/* Stat 2: On-Track Partners */}
        <div className="space-y-1 pl-4 border-l border-[#E5DFD3]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8479] block">
            On-Track Partners
          </span>
          <div className="text-2xl font-semibold text-[#1C1917] tabular-nums">
            5 / 6
          </div>
          <span className="text-[11px] text-[#6B655C] block">
            83.3% compliance rate
          </span>
        </div>

        {/* Stat 3: Correlation */}
        <div className="space-y-1 pl-4 border-l border-[#E5DFD3]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8479] block">
            M3 → M6 Correlation
          </span>
          <div className="text-2xl font-semibold text-[#0B4A7D] tabular-nums">
            r = 0.84
          </div>
          <span className="text-[11px] text-[#6B655C] block">
            Strong linear retention link
          </span>
        </div>

        {/* Stat 4: Flagged Risk */}
        <div className="space-y-1 pl-4 border-l border-[#E5DFD3]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8479] block">
            Flagged Execution Risk
          </span>
          <div className="text-2xl font-semibold text-[#B42318] tabular-nums">
            1 Partner
          </div>
          <span className="text-[11px] text-[#B42318] font-semibold flex items-center gap-1">
            <Warning size={12} />
            <span>Magic Bus (Thane)</span>
          </span>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN SECTION: SCATTER PLOT (58%) + POLICY PANEL (42%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Quality vs Retention Scatter Plot (7 cols / ~58%) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="font-narrative text-lg font-normal text-[#1C1917]">
                Curriculum Completion vs. M6 Outcome Retention
              </h2>
              <span className="text-[10px] font-semibold text-[#0B4A7D] bg-[#E7F0F7] px-2 py-0.5 rounded">
                6 Canonical Partners
              </span>
            </div>
            <p className="text-xs text-[#6B655C]">
              X-axis: M3 curriculum completion % · Y-axis: M6 verified enterprise survival & reading fluency %.
            </p>
          </div>

          {/* Clean Editorial SVG Scatter Plot with Quadrant Shading */}
          <div className="relative w-full h-80 bg-[#F7F4ED] rounded-xl border border-[#E5DFD3] p-4 select-none">
            {/* SVG Canvas (viewBox 0 0 600 300) */}
            <svg viewBox="0 0 600 300" className="w-full h-full overflow-visible font-sans">
              <defs>
                {/* Benchmark high quality quadrant highlight */}
                <rect id="high-quality-zone" x="300" y="20" width="280" height="180" fill="#2E6B4E" fillOpacity="0.05" rx="8" />
                {/* Rushed execution risk zone */}
                <rect id="risk-zone" x="50" y="160" width="220" height="120" fill="#B42318" fillOpacity="0.05" rx="8" />
              </defs>

              <use href="#high-quality-zone" />
              <use href="#risk-zone" />

              {/* Grid Lines */}
              <line x1="60" y1="20" x2="580" y2="20" stroke="#E5DFD3" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="60" y1="80" x2="580" y2="80" stroke="#E5DFD3" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="60" y1="140" x2="580" y2="140" stroke="#E5DFD3" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="60" y1="200" x2="580" y2="200" stroke="#E5DFD3" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="60" y1="260" x2="580" y2="260" stroke="#E5DFD3" strokeWidth="1.5" />

              {/* Threshold Guidelines */}
              <line x1="380" y1="20" x2="380" y2="260" stroke="#2E6B4E" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
              <line x1="60" y1="100" x2="580" y2="100" stroke="#2E6B4E" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />

              {/* Zone Annotations */}
              <text x="390" y="38" fill="#2E6B4E" fontSize="10" fontWeight="600" opacity="0.8">
                HIGH QUALITY ZONE (≥85% Survival & Retention)
              </text>
              <text x="75" y="245" fill="#B42318" fontSize="10" fontWeight="600" opacity="0.8">
                RUSHED / REVIEW REQUIRED ZONE
              </text>

              {/* Y-Axis Labels (Retention %) */}
              <text x="50" y="24" fill="#8C8479" fontSize="10" textAnchor="end" className="tabular-nums">100%</text>
              <text x="50" y="84" fill="#8C8479" fontSize="10" textAnchor="end" className="tabular-nums">85%</text>
              <text x="50" y="144" fill="#8C8479" fontSize="10" textAnchor="end" className="tabular-nums">70%</text>
              <text x="50" y="204" fill="#8C8479" fontSize="10" textAnchor="end" className="tabular-nums">55%</text>
              <text x="50" y="264" fill="#8C8479" fontSize="10" textAnchor="end" className="tabular-nums">40%</text>

              {/* X-Axis Labels (Completion %) */}
              <text x="60" y="282" fill="#8C8479" fontSize="10" textAnchor="middle" className="tabular-nums">70%</text>
              <text x="190" y="282" fill="#8C8479" fontSize="10" textAnchor="middle" className="tabular-nums">80%</text>
              <text x="320" y="282" fill="#8C8479" fontSize="10" textAnchor="middle" className="tabular-nums">90%</text>
              <text x="380" y="282" fill="#2E6B4E" fontSize="10" fontWeight="bold" textAnchor="middle" className="tabular-nums">85% Target</text>
              <text x="450" y="282" fill="#8C8479" fontSize="10" textAnchor="middle" className="tabular-nums">95%</text>
              <text x="580" y="282" fill="#8C8479" fontSize="10" textAnchor="middle" className="tabular-nums">100%</text>

              {/* 6 Canonical Partner Points */}
              {scatterPoints.map((pt) => {
                // Map X: 70% -> 60, 100% -> 580 (width = 520, delta = 30% -> 17.33 px per %)
                const cx = 60 + (pt.completionPct - 70) * (520 / 30);
                // Map Y: 100% -> 20, 40% -> 260 (height = 240, delta = 60% -> 4.0 px per %)
                const cy = 20 + (100 - pt.retentionPct) * 4.0;
                const isHovered = hoveredPoint?.ngoId === pt.ngoId;
                const isFlagged = pt.status === 'flagged';

                return (
                  <g
                    key={pt.ngoId}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Pulsing ring for flagged or hovered */}
                    {(isHovered || isFlagged) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isFlagged ? 13 : 11}
                        fill={isFlagged ? '#B42318' : '#2E6B4E'}
                        fillOpacity={0.2}
                        className={isFlagged ? 'animate-pulse' : ''}
                      />
                    )}

                    {/* Point Node */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={7}
                      fill={isFlagged ? '#B42318' : '#2E6B4E'}
                      stroke="#FCFBF8"
                      strokeWidth={2}
                    />

                    {/* Direct Inline Text Label */}
                    <text
                      x={cx + pt.dx}
                      y={cy + pt.dy}
                      fill={isFlagged ? '#B42318' : '#181D24'}
                      fontSize="10"
                      fontWeight="600"
                      textAnchor={pt.textAnchor}
                    >
                      {pt.name}
                    </text>
                    <text
                      x={cx + pt.dx}
                      y={cy + pt.dy + 11}
                      fill="#8C8479"
                      fontSize="8.5"
                      textAnchor={pt.textAnchor}
                      className="tabular-nums"
                    >
                      {pt.district} ({pt.completionPct}% · {pt.retentionPct}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Tooltip Card */}
          <div className="mt-3 p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-xs flex items-center justify-between min-h-[44px]">
            {hoveredPoint ? (
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${hoveredPoint.status === 'flagged' ? 'bg-[#B42318]' : 'bg-[#2E6B4E]'}`} />
                <span className="font-semibold text-[#181D24]">{hoveredPoint.name}:</span>
                <span className="text-[#646058]">{hoveredPoint.highlightNote}</span>
              </div>
            ) : (
              <span className="text-[#8C8479]">
                Hover any node to inspect partner completion pace, 6-month retention, and audit verification.
              </span>
            )}
            <span className="text-[10px] text-[#8C8479] tabular-nums font-semibold flex-shrink-0">
              Pearson r = 0.84
            </span>
          </div>
        </div>

        {/* Right: Policy & Execution Signals (5 cols / ~42%) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="border-b border-[#E5DFD3] pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#0B4A7D]">
                Funder Governance Framework
              </span>
              <h2 className="font-narrative text-lg font-normal text-[#1C1917] mt-0.5">
                Statutory CSR Execution Rules
              </h2>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Mandatory operational gates preventing milestone speedruns and quality leakage.
              </p>
            </div>

            {/* Rule 1 */}
            <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0B4A7D] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <span className="font-semibold text-xs text-[#1C1917]">
                  Decouple Invoicing from Completion Speed
                </span>
              </div>
              <p className="text-[11px] text-[#6B655C] leading-relaxed pl-7">
                Tie 40% of Tranche 3 to verified M6 outcome retention rather than classroom attendance velocity alone. Rushing modules without practical incubation triggers tranche hold.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0B4A7D] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <span className="font-semibold text-xs text-[#1C1917]">
                  Field Quality Gate
                </span>
              </div>
              <p className="text-[11px] text-[#6B655C] leading-relaxed pl-7">
                Require GPS-verified attendance logs (≥80% match) and unannounced physical spot audits before releasing milestone capital. Eliminates ghost rosters.
              </p>
            </div>

            {/* Flagged Partner Audit Case Card */}
            <div className="p-3.5 rounded-xl bg-[#FCECEB] border border-[#B42318]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B42318] flex items-center gap-1">
                  <Warning size={13} />
                  Flagged Partner Investigation
                </span>
                <span className="text-[10px] font-bold text-[#B42318] bg-[#FCECEB] px-2 py-0.5 rounded">
                  ₹35 L Tranche Held
                </span>
              </div>
              <div className="font-semibold text-xs text-[#1C1917]">
                Magic Bus · Thane Cluster (#AUD-2025-04)
              </div>
              <p className="text-[11px] text-[#6B655C] leading-relaxed">
                Incomplete delivery (78% completion · 62% retention) produced low 6-month enterprise survival alongside 142 GPS anomalies in Mumbra &amp; Kalwa centers.
              </p>
            </div>
          </div>

          {/* Working Action Link to Audit Cases Tab */}
          <div className="pt-2 border-t border-[#E5DFD3]">
            <button
              type="button"
              onClick={() => onNavigate?.('operations')}
              className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-transform duration-100 active:scale-[0.98] flex items-center justify-center gap-2 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25"
            >
              <span>Inspect Magic Bus Audit Docket in Tab 1</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
