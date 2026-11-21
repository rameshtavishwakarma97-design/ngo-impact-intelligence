import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ScreenId } from '../App';

interface EntrepreneurshipProps {
  onNavigate?: (screen: ScreenId) => void;
  selectedProgram?: 'micro-skilling' | 'literacy';
}

// ─── RETENTION TRAJECTORY (M0 TO M12) ──────────────────────────────────────────
const RETENTION_DATA = [
  { wave: 'Launch', rate: 100, label: '100% Active' },
  { wave: 'M3 Wave', rate: 91, label: '91% Retained' },
  { wave: 'M6 Audit', rate: 78, label: '78% Retained' },
  { wave: 'M12 Goal', rate: 71, label: '71% Retained' },
];

export const Entrepreneurship: React.FC<EntrepreneurshipProps> = ({
  selectedProgram = 'micro-skilling',
}) => {
  const [closureDrawerOpen, setClosureDrawerOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const isMicro = selectedProgram === 'micro-skilling';

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFlagMicroCredit = () => {
    setClosureDrawerOpen(false);
    showToast(
      'Flagged for Micro-Credit Support',
      '2,007 affected entrepreneurs in Thane and Chhindwara clusters enrolled in emergency working-capital revolving fund.'
    );
  };

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

      {/* ── EDITORIAL BRIEFING TITLE (NEWSREADER SERIF) ────────────────────── */}
      <div className="space-y-1.5">
        <h1 className="font-narrative text-[24px] sm:text-[26px] lg:text-[28px] font-normal tracking-tight text-[#1C1917] leading-snug">
          {isMicro
            ? 'Active business ownership rose from 61% to 79%—creating 4,723 new enterprises, with 78% staying open past 6 months.'
            : "Women's agency and household financial decision-making expanded from 22% to 68% after foundational literacy."}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#6B655C]">
          {isMicro
            ? 'Bajaj Finserv Micro-Skilling Programme · Enterprise Creation & 6-Month Commercial Survival · n = 26,242 Verified Women'
            : "Bajaj Finserv Women's Literacy Programme · Autonomy & Household Decision-Making Protocol · n = 14,450 Verified Women"}
        </p>
      </div>

      {/* ── 4 BORDERLESS HERO STATS (ZERO BLACK CARDS) ─────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 py-5 border-y border-[#E5DFD3]">
        {/* Stat 1: Active Businesses */}
        <div className="pr-4 sm:pr-6 py-2">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'ACTIVE BUSINESSES' : 'INDEPENDENT BANK VISITS'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '79%' : '68%'}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B655C]">
            <span className="font-medium text-[#2E6B4E]">
              {isMicro ? '+18 pts from 61%' : '+46 pts from 22%'}
            </span>
            <span className="text-[#8C8479]">·</span>
            <span>{isMicro ? '20,731 open' : '9,826 women'}</span>
          </div>
        </div>

        {/* Stat 2: Net New Enterprises */}
        <div className="pl-4 sm:px-6 py-2 border-l border-[#E5DFD3]">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'NET NEW ENTERPRISES' : 'HEALTH & SCHOOL DECISIONS'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#2E6B4E] mt-1 tracking-tight">
            {isMicro ? '+4,723' : '74%'}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {isMicro ? '16,008 → 20,731 active units' : 'Primary or joint decision-maker'}
          </div>
          <div className="mt-2 h-[3px] w-full max-w-[160px] bg-[#E5DFD3] rounded-full overflow-hidden">
            <div className="h-full bg-[#2E6B4E] rounded-full" style={{ width: '79%' }} />
          </div>
        </div>

        {/* Stat 3: 6-Month Survival */}
        <div className="pr-4 sm:px-6 py-2 border-t lg:border-t-0 lg:border-l border-[#E5DFD3]">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? '6-MONTH SURVIVAL' : 'SHG PARTICIPATION'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '78%' : '81%'}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {isMicro ? 'Vs 54% local unassisted peer rate' : 'Active self-help group members'}
          </div>
        </div>

        {/* Stat 4: Moved from Daily Wage */}
        <div className="pl-4 sm:px-6 py-2 border-t lg:border-t-0 border-l border-[#E5DFD3]">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'MOVED FROM DAILY WAGE' : 'PERSONAL SAVINGS AUTONOMY'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '24%' : '62%'}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {isMicro ? '6,298 daily-wage women transitioned' : 'Maintains independent savings account'}
          </div>
        </div>
      </section>

      {/* ── CENTERPIECE: OCCUPATIONAL FLOW (55%) & SURVIVAL TRAJECTORY (45%) ─ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (55% / col-span-7): Occupational Transition Flow (Custom Diagram) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="border-b border-[#E5DFD3] pb-3 flex justify-between items-baseline">
              <div>
                <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
                  Occupational Transition Flow
                </h2>
                <p className="text-xs text-[#6B655C] mt-0.5">
                  How 26,242 verified women shifted from informal day labor into sustained business ownership.
                </p>
              </div>
              <span className="text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider hidden sm:inline">
                M0 → M6 Census Flow
              </span>
            </div>

            {/* Custom SVG Sankey / Transition Flow Diagram */}
            <div className="pt-4">
              <div className="flex justify-between text-xs font-semibold text-[#8C8479] mb-3 uppercase tracking-wider">
                <span>Intake Baseline (M0)</span>
                <span>Endline Status (M6)</span>
              </div>

              {/* Diagram Canvas */}
              <div className="relative w-full bg-[#F7F4ED]/60 rounded-xl border border-[#E5DFD3] p-4">
                <svg viewBox="0 0 540 240" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="flowTeal" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0B4A7D" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0B4A7D" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="flowEmerald" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2E6B4E" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#2E6B4E" stopOpacity="0.75" />
                    </linearGradient>
                    <linearGradient id="flowTaupe" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8C8479" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8C8479" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="flowCrimson" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8C8479" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#B42318" stopOpacity="0.65" />
                    </linearGradient>
                  </defs>

                  {/* Flow Ribbons (Curved Bezier Paths) */}
                  {/* Ribbon 1: Informal Trade (16,008) -> Active Business (14,407) */}
                  <path
                    d="M 120 40 C 260 40, 260 40, 400 40"
                    fill="none"
                    stroke="url(#flowTeal)"
                    strokeWidth="38"
                    strokeLinecap="round"
                    className="hover:stroke-opacity-90 transition-all cursor-pointer"
                  />

                  {/* Ribbon 2: Daily Wage (6,298) -> Active Business (4,723) (NEW ENTERPRISES!) */}
                  <path
                    d="M 120 125 C 250 125, 270 65, 400 65"
                    fill="none"
                    stroke="url(#flowEmerald)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    className="hover:stroke-opacity-90 transition-all cursor-pointer"
                  />

                  {/* Ribbon 3: Home / Unemployed (3,936) -> Active Business (1,601) */}
                  <path
                    d="M 120 200 C 260 200, 280 85, 400 85"
                    fill="none"
                    stroke="url(#flowTeal)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Ribbon 4: Daily Wage (6,298) -> Wage / Seeking (1,575) */}
                  <path
                    d="M 120 135 C 250 135, 260 145, 400 145"
                    fill="none"
                    stroke="url(#flowTaupe)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />

                  {/* Ribbon 5: Informal Trade + Home -> Closed / Paused (1,837) */}
                  <path
                    d="M 120 60 C 250 60, 260 205, 400 205"
                    fill="none"
                    stroke="url(#flowCrimson)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />

                  {/* Left Source Nodes (M0 Baseline) */}
                  {/* Node 1: Informal Trade */}
                  <g className="cursor-pointer">
                    <rect x="10" y="15" width="110" height="50" rx="8" fill="#FCFBF8" stroke="#E5DFD3" strokeWidth="1.5" />
                    <text x="20" y="35" fontSize="11" fontWeight="600" fill="#1C1917">Informal Trade</text>
                    <text x="20" y="52" fontSize="10" fill="#6B655C">61% (16,008)</text>
                  </g>

                  {/* Node 2: Daily Wage */}
                  <g className="cursor-pointer">
                    <rect x="10" y="100" width="110" height="50" rx="8" fill="#FCFBF8" stroke="#E5DFD3" strokeWidth="1.5" />
                    <text x="20" y="120" fontSize="11" fontWeight="600" fill="#1C1917">Daily Wage Labor</text>
                    <text x="20" y="137" fontSize="10" fill="#6B655C">24% (6,298)</text>
                  </g>

                  {/* Node 3: Home / Unemployed */}
                  <g className="cursor-pointer">
                    <rect x="10" y="175" width="110" height="50" rx="8" fill="#FCFBF8" stroke="#E5DFD3" strokeWidth="1.5" />
                    <text x="20" y="195" fontSize="11" fontWeight="600" fill="#1C1917">Home / Unemployed</text>
                    <text x="20" y="212" fontSize="10" fill="#6B655C">15% (3,936)</text>
                  </g>

                  {/* Right Target Nodes (M6 Endline) */}
                  {/* Node 1: Running Active Business (79%) */}
                  <g className="cursor-pointer">
                    <rect x="400" y="15" width="130" height="85" rx="8" fill="#E8F3EC" stroke="#2E6B4E" strokeWidth="2" />
                    <text x="412" y="38" fontSize="11" fontWeight="700" fill="#2E6B4E">Running Business</text>
                    <text x="412" y="56" fontSize="13" fontWeight="800" fill="#1C1917">79% (20,731)</text>
                    <text x="412" y="74" fontSize="9.5" fontWeight="600" fill="#2E6B4E">+4,723 Net New!</text>
                    <text x="412" y="88" fontSize="9" fill="#6B655C">16,008 → 20,731 units</text>
                  </g>

                  {/* Node 2: Wage / Seeking (14%) */}
                  <g className="cursor-pointer">
                    <rect x="400" y="120" width="130" height="50" rx="8" fill="#FCFBF8" stroke="#E5DFD3" strokeWidth="1.5" />
                    <text x="412" y="140" fontSize="11" fontWeight="600" fill="#1C1917">Wage / Seeking</text>
                    <text x="412" y="157" fontSize="10" fill="#6B655C">14% (3,674)</text>
                  </g>

                  {/* Node 3: Closed / Paused (22%) */}
                  <g className="cursor-pointer">
                    <rect x="400" y="185" width="130" height="45" rx="8" fill="#FCECEB" stroke="#B42318" strokeWidth="1.5" />
                    <text x="412" y="203" fontSize="11" fontWeight="600" fill="#B42318">Closed / Paused</text>
                    <text x="412" y="218" fontSize="10" fill="#B42318">22% (4,561 units)</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5DFD3] flex justify-between items-center text-xs text-[#8C8479]">
            <span>Net Enterprise Creation: 4,723 first-time commercial ventures</span>
            <span className="font-semibold text-[#2E6B4E]">92.4% Verified Census Match</span>
          </div>
        </div>

        {/* Right (45% / col-span-5): Survival Trajectory & Closure Drivers */}
        <div className="lg:col-span-5 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 flex flex-col justify-between shadow-2xs space-y-6">
          {/* Top: Compact Retention Curve */}
          <div>
            <div className="border-b border-[#E5DFD3] pb-3 flex justify-between items-baseline">
              <div>
                <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                  Commercial Survival Trajectory
                </h3>
                <p className="text-xs text-[#6B655C]">78% of launched enterprises sustained past month 6.</p>
              </div>
              <span className="text-xs font-semibold text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
                +24 pts vs Control
              </span>
            </div>

            {/* Recharts Retention Curve */}
            <div className="h-40 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={RETENTION_DATA} margin={{ top: 15, right: 25, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD3" vertical={false} />
                  <XAxis dataKey="wave" tick={{ fontSize: 11, fill: '#8C8479' }} axisLine={{ stroke: '#E5DFD3' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#8C8479' }} axisLine={{ stroke: '#E5DFD3' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-[#FCFBF8] border border-[#D5CEC0] p-2.5 rounded-xl shadow-xl text-xs space-y-1 tabular-nums">
                          <p className="font-bold text-[#1C1917]">{label}</p>
                          <p className="text-[#0B4A7D] font-bold">{payload[0].value}% Survival</p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#0B4A7D"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0B4A7D', stroke: '#FCFBF8', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom: Why 22% Closed Before M6 (Interactive Drivers) */}
          <div className="pt-2 border-t border-[#E5DFD3] space-y-3">
            <div className="flex justify-between items-baseline">
              <div>
                <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                  Why 22% Closed Before M6
                </h4>
                <p className="text-[11px] text-[#6B655C]">Root causes behind 4,561 non-retained micro-units.</p>
              </div>
              <span className="text-[10px] text-[#8C8479]">Click bar to inspect</span>
            </div>

            <div className="space-y-2.5">
              {/* Driver 1 */}
              <div
                onClick={() => {
                  setSelectedDriver('capital');
                  setClosureDrawerOpen(true);
                }}
                className="group cursor-pointer space-y-1"
              >
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#1C1917] group-hover:text-[#0B4A7D] transition-colors flex items-center gap-1">
                    <span>Working Capital Shortage</span>
                    <ArrowRight size={11} className="text-[#8C8479] group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    44% <span className="text-[#8C8479] font-normal">(2,007 businesses)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B42318] rounded-full" style={{ width: '44%' }} />
                </div>
              </div>

              {/* Driver 2 */}
              <div
                onClick={() => {
                  setSelectedDriver('seasonal');
                  setClosureDrawerOpen(true);
                }}
                className="group cursor-pointer space-y-1"
              >
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#1C1917] group-hover:text-[#0B4A7D] transition-colors flex items-center gap-1">
                    <span>Seasonal Agriculture Demand Drop</span>
                    <ArrowRight size={11} className="text-[#8C8479] group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    31% <span className="text-[#8C8479] font-normal">(1,414 businesses)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#A86414] rounded-full" style={{ width: '31%' }} />
                </div>
              </div>

              {/* Driver 3 */}
              <div
                onClick={() => {
                  setSelectedDriver('household');
                  setClosureDrawerOpen(true);
                }}
                className="group cursor-pointer space-y-1"
              >
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#1C1917] group-hover:text-[#0B4A7D] transition-colors flex items-center gap-1">
                    <span>Household / Caregiving Constraints</span>
                    <ArrowRight size={11} className="text-[#8C8479] group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    25% <span className="text-[#8C8479] font-normal">(1,140 businesses)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8C8479] rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE SLIDE-OVER CLOSURE DRAWER (Desktop: 420px · Mobile: Bottom Sheet) ─── */}
      {closureDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <aside className="w-full sm:max-w-md max-h-[88dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl flex flex-col justify-between">
            {/* Mobile Drag Handle */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B42318] tracking-wider block">
                    Closure Root Cause Diagnostics
                  </span>
                  <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                    {selectedDriver === 'capital'
                      ? 'Working Capital Shortage (44% · 2,007 Units)'
                      : selectedDriver === 'seasonal'
                      ? 'Seasonal Demand Drop (31% · 1,414 Units)'
                      : 'Household Constraints (25% · 1,140 Units)'}
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Field surveyor audit from M6 wave non-operational micro-enterprises.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setClosureDrawerOpen(false)}
                  className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Geographic Pockets */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                  Most Impacted Geographic Clusters
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1C1917]">Thane Peri-Urban (Magic Bus)</div>
                      <div className="text-[11px] text-[#6B655C]">Mumbra &amp; Bhiwandi tailoring clusters</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-[#B42318]">392 units</div>
                      <div className="text-[10px] text-[#8C8479]">48.5% of issue</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1C1917]">Chhindwara Tribal (Goonj)</div>
                      <div className="text-[11px] text-[#6B655C]">Rural periodic weekly haats</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-[#B42318]">246 units</div>
                      <div className="text-[10px] text-[#8C8479]">30.4% of issue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Findings */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                  Field Remediation Opportunity
                </span>
                <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-xs space-y-2 text-[#6B655C] leading-relaxed">
                  <p>
                    <strong className="text-[#1C1917]">Intervention Summary:</strong> 72% of these closed businesses have intact production assets (sewing machines, tools) and confirmed client demand, but ran out of inventory cash flow following raw material price spikes.
                  </p>
                  <p>
                    A ₹5,000–₹10,000 low-interest micro-working-capital grant or revolving credit linkage through local SHGs can immediately reactivate an estimated 580 businesses within 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
              <button
                type="button"
                onClick={handleFlagMicroCredit}
                className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard size={14} />
                <span>Flag for Micro-Credit Support</span>
              </button>
              <button
                type="button"
                onClick={() => setClosureDrawerOpen(false)}
                className="w-full py-2 rounded-xl bg-[#F7F4ED] text-xs font-semibold text-[#6B655C] hover:text-[#1C1917] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
