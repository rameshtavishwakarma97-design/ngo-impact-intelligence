import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  QrCode,
} from 'lucide-react';
import type { ScreenId } from '../App';

interface DigitalAdoptionProps {
  onNavigate?: (screen: ScreenId) => void;
  selectedProgram?: 'micro-skilling' | 'literacy';
}

const BANKABILITY_DUMBBELL = [
  {
    pillar: 'Bank Account Access',
    baseline: 54,
    endline: 76,
    gain: 22,
    tag: 'Foundational Rail',
    tagColor: '#2E6B4E',
    tagBg: '#E8F3EC',
  },
  {
    pillar: 'UPI Merchant QR Payments',
    baseline: 31,
    endline: 64,
    gain: 33,
    tag: 'High Velocity',
    tagColor: '#0B4A7D',
    tagBg: '#E7F0F7',
  },
  {
    pillar: 'WhatsApp Business Catalogs',
    baseline: 18,
    endline: 47,
    gain: 29,
    tag: 'Customer Expansion',
    tagColor: '#0B4A7D',
    tagBg: '#E7F0F7',
  },
  {
    pillar: 'Formal Credit / Mudra Access',
    baseline: 14,
    endline: 31,
    gain: 17,
    tag: 'Institutional Debt',
    tagColor: '#B5532A',
    tagBg: '#FAEDE6',
  },
  {
    pillar: 'Digital Bookkeeping (Khatabook)',
    baseline: 6,
    endline: 28,
    gain: 22,
    tag: 'Auditable Records',
    tagColor: '#A86414',
    tagBg: '#FEF6EE',
  },
];

const LITERACY_BANKING_DUMBBELL = [
  {
    pillar: 'Fraud & OTP Scam Awareness',
    baseline: 18,
    endline: 86,
    gain: 68,
    tag: 'Safety Foundation',
    tagColor: '#2E6B4E',
    tagBg: '#E8F3EC',
  },
  {
    pillar: 'Passbook Entry Reading',
    baseline: 11,
    endline: 71,
    gain: 60,
    tag: 'Audit Autonomy',
    tagColor: '#0B4A7D',
    tagBg: '#E7F0F7',
  },
  {
    pillar: 'Independent ATM Debit Use',
    baseline: 8,
    endline: 58,
    gain: 50,
    tag: 'Card Fluency',
    tagColor: '#0B4A7D',
    tagBg: '#E7F0F7',
  },
  {
    pillar: 'UPI PIN Verification & Receipt',
    baseline: 6,
    endline: 64,
    gain: 58,
    tag: 'Digital Wallet',
    tagColor: '#B5532A',
    tagBg: '#FAEDE6',
  },
  {
    pillar: 'Government Subsidy (DBT) Tracking',
    baseline: 14,
    endline: 69,
    gain: 55,
    tag: 'Entitlement Access',
    tagColor: '#A86414',
    tagBg: '#FEF6EE',
  },
];

export const DigitalAdoption: React.FC<DigitalAdoptionProps> = ({
  selectedProgram = 'micro-skilling',
}) => {
  const [campDrawerOpen, setCampDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const isMicro = selectedProgram === 'micro-skilling';
  const dumbbellRows = isMicro ? BANKABILITY_DUMBBELL : LITERACY_BANKING_DUMBBELL;

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeployCamp = () => {
    setCampDrawerOpen(false);
    showToast(
      'UPI Onboarding Camps Scheduled',
      'Field teams deployed across Thane & Chhindwara clusters. Target: 9,440 cash-only merchants onboarded within 3 weeks.'
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
            ? 'Digital trails make informal women bankable—UPI adoption doubled to 64%, unlocking 4× higher formal credit approval.'
            : 'Functional literacy enabled 74% of rural women to operate UPI apps and verify bank passbooks without family dependency.'}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#6B655C]">
          {isMicro
            ? 'Bajaj Finserv Micro-Skilling Programme · Financial Inclusion & Digital Transaction Rails · n = 26,242 Verified Women'
            : "Bajaj Finserv Women's Literacy Programme · Functional Digital Banking & Financial Agency · n = 14,450 Verified Women"}
        </p>
      </div>

      {/* ── 4 BORDERLESS HERO STATS (ZERO BLACK CARDS) ─────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 py-5 border-y border-[#E5DFD3]">
        {/* Stat 1: Bank Account Access */}
        <div className="pr-6 py-1">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'BANK ACCOUNT ACCESS' : 'INDEPENDENT ATM USE'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '76%' : '58%'}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B655C]">
            <span className="font-medium text-[#2E6B4E]">
              {isMicro ? '+22 pts from 54%' : '+50 pts from 8%'}
            </span>
            <span className="text-[#8C8479]">·</span>
            <span>{isMicro ? '19,944 banked' : '8,381 women'}</span>
          </div>
        </div>

        {/* Stat 2: UPI Merchant QR */}
        <div className="px-6 py-1 border-l border-[#E5DFD3]">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'UPI MERCHANT QR' : 'UPI PIN & TRANSFER'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#2E6B4E] mt-1 tracking-tight">
            {isMicro ? '64%' : '64%'}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B655C]">
            <span className="font-medium text-[#2E6B4E]">
              {isMicro ? '+33 pts from 31%' : '+58 pts from 6%'}
            </span>
            <span className="text-[#8C8479]">·</span>
            <span>{isMicro ? '16,795 active QR' : '9,248 women'}</span>
          </div>
          <div className="mt-2 h-[3px] w-full max-w-[160px] bg-[#E5DFD3] rounded-full overflow-hidden">
            <div className="h-full bg-[#2E6B4E] rounded-full" style={{ width: '64%' }} />
          </div>
        </div>

        {/* Stat 3: Formal Credit Access */}
        <div className="px-6 py-1 border-l border-[#E5DFD3]">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'FORMAL CREDIT ACCESS' : 'PASSBOOK READING'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '31%' : '71%'}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {isMicro ? '+17 pts from 14% (8,135 loans)' : '71% verify deposit entries'}
          </div>
        </div>

        {/* Stat 4: Digital Bookkeeping */}
        <div className="pl-6 py-1 border-l border-[#E5DFD3]">
          <span className="font-sans text-[11px] uppercase tracking-wider font-medium text-[#8C8479] block">
            {isMicro ? 'DIGITAL BOOKKEEPING' : 'FRAUD & OTP AWARENESS'}
          </span>
          <div className="font-sans tabular-nums font-semibold text-2xl sm:text-3xl text-[#1C1917] mt-1 tracking-tight">
            {isMicro ? '28%' : '86%'}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {isMicro ? '+22 pts from 6% (7,348 users)' : '86% refuse sharing OTP with strangers'}
          </div>
        </div>
      </section>

      {/* ── DUAL CENTERPIECE: BANKABILITY LADDER (55%) & PROOF PANEL (45%) ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (55% / col-span-7): The Bankability Ladder (SVG Dumbbell Range Chart) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 pb-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="border-b border-[#E5DFD3] pb-3 flex justify-between items-baseline">
              <div>
                <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
                  {isMicro ? 'The Bankability Ladder' : 'Digital Financial Competency Ladder'}
                </h2>
                <p className="text-xs text-[#6B655C] mt-0.5">
                  {isMicro
                    ? 'Baseline (M0) to Endline (M6) conversion across institutional financial rails.'
                    : 'Intake vs Endline capability across practical banking touchpoints.'}
                </p>
              </div>
              <span className="text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider hidden sm:inline">
                Shared 0–100% Scale
              </span>
            </div>

            {/* Dumbbell Chart Rows */}
            <div className="divide-y divide-[#E5DFD3] pt-2">
              {dumbbellRows.map((row, idx) => (
                <div key={idx} className="py-3.5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#1C1917] flex items-center gap-2">
                      <span>{row.pillar}</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.2 rounded"
                        style={{ color: row.tagColor, backgroundColor: row.tagBg }}
                      >
                        {row.tag}
                      </span>
                    </span>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="text-[#8C8479]">{row.baseline}%</span>
                      <span className="text-[#8C8479]">→</span>
                      <span className="font-bold text-[#1C1917]">{row.endline}%</span>
                      <span className="text-[#2E6B4E] font-semibold text-[11px]">(+{row.gain} pts)</span>
                    </div>
                  </div>

                  {/* SVG Dumbbell Visual */}
                  <div className="h-5 w-full relative flex items-center">
                    {/* Background line */}
                    <div className="absolute inset-x-0 h-[2px] bg-[#E5DFD3]" />

                    {/* Connecting bar */}
                    <div
                      className="absolute h-[3px] bg-[#2E6B4E] rounded-full"
                      style={{
                        left: `${row.baseline}%`,
                        width: `${row.endline - row.baseline}%`,
                      }}
                    />

                    {/* M0 Hollow Circle */}
                    <div
                      className="absolute w-3 h-3 rounded-full border-2 border-[#8C8479] bg-[#FCFBF8] -translate-x-1.5"
                      style={{ left: `${row.baseline}%` }}
                      title={`Baseline: ${row.baseline}%`}
                    />

                    {/* M6 Solid Circle */}
                    <div
                      className="absolute w-3.5 h-3.5 rounded-full bg-[#2E6B4E] border-2 border-[#FCFBF8] -translate-x-1.5 shadow-2xs"
                      style={{ left: `${row.endline}%` }}
                      title={`Endline: ${row.endline}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-[#E5DFD3] flex justify-between items-center text-xs text-[#8C8479] flex-shrink-0">
            <span>Grey hollow dot: M0 Baseline · Solid Botanical Moss dot: M6 Endline</span>
            <span className="font-semibold text-[#2E6B4E]">n = 26,242 Verified</span>
          </div>
        </div>

        {/* Right (45% / col-span-5): The "So What?" Proof Panel */}
        <div className="lg:col-span-5 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 flex flex-col justify-between shadow-2xs space-y-6">
          <div className="space-y-4">
            <div className="border-b border-[#E5DFD3] pb-3">
              <span className="text-[10px] uppercase font-bold text-[#0B4A7D] tracking-wider block">
                The Executive Proof
              </span>
              <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                Cash-Only vs. Digitally Active
              </h3>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Why digital trails matter: causal comparison of audited cohort outcomes.
              </p>
            </div>

            {/* 3 Comparison Cards */}
            <div className="space-y-3">
              {/* Row 1: Formal Credit Approval */}
              <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                  Formal Bank Loan Approval Rate
                </span>
                <div className="flex justify-between items-baseline">
                  <div className="text-xs">
                    <span className="text-[#8C8479]">Cash-Only: </span>
                    <span className="font-bold text-[#1C1917] tabular-nums">12%</span>
                  </div>
                  <span className="text-xs font-bold text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
                    +4× Higher
                  </span>
                  <div className="text-xs">
                    <span className="text-[#2E6B4E]">UPI + Ledger: </span>
                    <span className="font-bold text-[#2E6B4E] tabular-nums">48%</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B655C]">
                  Bank managers approve Mudra loans when transaction history confirms regular cash flow.
                </p>
              </div>

              {/* Row 2: Median Monthly Income */}
              <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                  Median Monthly Income
                </span>
                <div className="flex justify-between items-baseline">
                  <div className="text-xs">
                    <span className="text-[#8C8479]">Cash-Only: </span>
                    <span className="font-bold text-[#1C1917] tabular-nums">₹5,900</span>
                  </div>
                  <span className="text-xs font-bold text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
                    +₹1,950 / mo
                  </span>
                  <div className="text-xs">
                    <span className="text-[#2E6B4E]">UPI + Ledger: </span>
                    <span className="font-bold text-[#2E6B4E] tabular-nums">₹7,850</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B655C]">
                  Digital QR allows higher ticket sales and remote payments via WhatsApp catalogs.
                </p>
              </div>

              {/* Row 3: 6-Month Survival */}
              <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                  6-Month Business Survival Rate
                </span>
                <div className="flex justify-between items-baseline">
                  <div className="text-xs">
                    <span className="text-[#8C8479]">Cash-Only: </span>
                    <span className="font-bold text-[#1C1917] tabular-nums">71%</span>
                  </div>
                  <span className="text-xs font-bold text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
                    +15 pts Lift
                  </span>
                  <div className="text-xs">
                    <span className="text-[#2E6B4E]">UPI + Ledger: </span>
                    <span className="font-bold text-[#2E6B4E] tabular-nums">86%</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B655C]">
                  Digitally active micro-merchants manage stock deficits and working capital shocks significantly better.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 border-t border-[#E5DFD3]">
            <button
              type="button"
              onClick={() => setCampDrawerOpen(true)}
              className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <QrCode size={14} />
              <span>Target 9,440 Cash-Only Merchants for UPI Camp →</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE SLIDE-OVER UPI CAMP DRAWER (Desktop: 420px · Mobile: Bottom Sheet) ── */}
      {campDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <aside className="w-full sm:max-w-md max-h-[88dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl flex flex-col justify-between">
            {/* Mobile Drag Handle */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#0B4A7D] tracking-wider block">
                    Intervention Campaign
                  </span>
                  <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
                    9,440 Cash-Only Merchants
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Rapid deployment of merchant QR soundboxes and digital ledger training.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCampDrawerOpen(false)}
                  className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Geographic Rollout Plan */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                  Priority Cluster Rollout
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1C1917]">Pune &amp; Thane Industrial Belts</div>
                      <div className="text-[11px] text-[#6B655C]">Pratham &amp; Magic Bus hubs</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-[#0B4A7D]">5,200 merchants</div>
                      <div className="text-[10px] text-[#8C8479]">Week 1–2</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1C1917]">Chhindwara &amp; Jabalpur Blocks</div>
                      <div className="text-[11px] text-[#6B655C]">Goonj &amp; SEWA weekly haats</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-[#0B4A7D]">4,240 merchants</div>
                      <div className="text-[10px] text-[#8C8479]">Week 3–4</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Scope */}
              <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-2 text-xs text-[#6B655C] leading-relaxed">
                <span className="font-semibold text-[#1C1917] block">What the Intervention Delivers:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Direct bank account linking via local Bank Mitras (BCs).</li>
                  <li>Laminated zero-MDR merchant QR standee with voice soundbox alert.</li>
                  <li>30-minute vernacular training on Khatabook daily transaction recording.</li>
                  <li>Pre-qualification for ₹25,000 Mudra Shishu loan assessment after 90 days.</li>
                </ul>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
              <button
                type="button"
                onClick={handleDeployCamp}
                className="w-full py-2.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <QrCode size={14} />
                <span>Confirm &amp; Schedule UPI Camps</span>
              </button>
              <button
                type="button"
                onClick={() => setCampDrawerOpen(false)}
                className="w-full py-2 rounded-xl bg-[#F7F4ED] text-xs font-semibold text-[#6B655C] hover:text-[#1C1917] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
