import React, { useState, useMemo } from 'react';
import {
  Users,
  Smartphone as DeviceMobile,
  Landmark as Bank,
  Briefcase,
  Sparkles as Sparkle,
} from 'lucide-react';
import { type ProgramType } from '../data/impactStore';

interface BaselineProfileProps {
  onNavigate?: (screenId: string) => void;
}

export const BaselineProfile: React.FC<BaselineProfileProps> = () => {

  const [cohortFilter, setCohortFilter] = useState<'all' | ProgramType>('all');

  // Demographic age breakdown (100% Women)
  const ageBreakdown = useMemo(() => {
    return [
      { range: '18–25 yrs', pct: 26, count: 11141, note: 'Young mothers & school-leavers' },
      { range: '26–35 yrs', pct: 44, count: 18854, note: 'Core household income earners' },
      { range: '36–45 yrs', pct: 22, count: 9427, note: 'Established nano-traders' },
      { range: '45+ yrs', pct: 8, count: 3428, note: 'Senior artisans & SHG elders' },
    ];
  }, []);

  // Income distribution at intake
  const incomeDistribution = useMemo(() => {
    return [
      { range: 'Below ₹5,000 / month', pct: 41, color: '#0B4A7D' },
      { range: '₹5,000 – ₹10,000 / month', pct: 44, color: '#B5532A' },
      { range: 'Above ₹10,000 / month', pct: 15, color: '#646058' },
    ];
  }, []);

  // Intake activities disaggregated by cohort
  const intakeActivities = useMemo(() => {
    if (cohortFilter === 'micro-skilling') {
      return [
        { label: 'Tailoring & Garments', pct: 40, count: 11360 },
        { label: 'Veg & Agri-Vending', pct: 24, count: 6816 },
        { label: 'Daily Wage & Unskilled Labour', pct: 16, count: 4544 },
        { label: 'Mobile Repair & Electronics', pct: 14, count: 3976 },
        { label: 'Handicrafts & Artisanal Crafts', pct: 6, count: 1704 },
      ];
    }
    if (cohortFilter === 'literacy') {
      return [
        { label: 'Non-literate (FLN Level 0: No letter recognition)', pct: 54, count: 7803 },
        { label: 'Early letter recognition (FLN Level 1)', pct: 32, count: 4624 },
        { label: 'Simple word reading & basic numeracy (FLN Level 2)', pct: 14, count: 2023 },
      ];
    }
    return [
      { label: 'Informal Micro-Enterprise (Tailoring, Vending, Crafts)', pct: 48, count: 20568 },
      { label: 'Daily Wage & Agricultural Labour', pct: 28, count: 12000 },
      { label: 'Homemaker / Zero Prior Commercial Activity', pct: 24, count: 10282 },
    ];
  }, [cohortFilter]);

  const cohortCount = cohortFilter === 'micro-skilling' ? 28400 : cohortFilter === 'literacy' ? 14450 : 42850;

  return (
    <div className="space-y-6 pb-28 text-[#1C1917]">
      {/* ── EDITORIAL HEADER BANNER (ZERO BLACK CARDS) ── */}
      <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#0B4A7D]">
              Cohort Intake Census
            </span>
            <span className="text-xs text-[#8C8479]">·</span>
            <span className="text-xs font-medium text-[#0B4A7D] flex items-center gap-1">
              <Users size={14} />
              100% Women Beneficiaries
            </span>
          </div>
          <h1 className="font-narrative text-2xl sm:text-3xl font-normal text-[#1C1917]">
            Beneficiary Intake Profile (M0)
          </h1>
          <p className="text-xs sm:text-sm text-[#6B655C] mt-1 max-w-2xl leading-relaxed">
            Pre-intervention socio-economic baseline surveyed during M0 induction. Serves as the counterfactual foundation against which all net earnings lift and literacy gains are isolated.
          </p>
        </div>

        {/* Cohort Scope Toggle Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F4ED] border border-[#E5DFD3] rounded-xl self-start md:self-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setCohortFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              cohortFilter === 'all'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#6B655C] hover:text-[#1C1917]'
            }`}
          >
            All 42,850 Women
          </button>
          <button
            type="button"
            onClick={() => setCohortFilter('micro-skilling')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              cohortFilter === 'micro-skilling'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#6B655C] hover:text-[#1C1917]'
            }`}
          >
            Micro-Skilling (28,400)
          </button>
          <button
            type="button"
            onClick={() => setCohortFilter('literacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              cohortFilter === 'literacy'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#6B655C] hover:text-[#1C1917]'
            }`}
          >
            Literacy (14,450)
          </button>
        </div>
      </div>

      {/* ── TOP SPLIT: OCCUPATION AT INTAKE (7 COLS) VS DEMOGRAPHICS & INCOME (5 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left (7 cols): Occupation & Prior Experience Breakdown */}
        <div className="lg:col-span-7 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3 mb-4">
              <div>
                <h2 className="font-narrative text-lg font-normal text-[#1C1917]">
                  {cohortFilter === 'literacy'
                    ? 'Baseline Reading & Numeracy Level at Intake'
                    : 'Baseline Economic Activity at Intake'}
                </h2>
                <p className="text-xs text-[#6B655C]">
                  {cohortFilter === 'literacy'
                    ? 'ASER-standard foundational literacy pre-test before community classroom sessions.'
                    : 'Pre-skilling income-generating activities across urban wards and rural haat centers.'}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#0B4A7D] bg-[#E7F0F7] px-2.5 py-1 rounded-lg tabular-nums">
                n = {cohortCount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {intakeActivities.map((act, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#1C1917]">{act.label}</span>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-semibold text-sm text-[#1C1917]">{act.pct}%</span>
                      <span className="text-[11px] text-[#8C8479]">({act.count.toLocaleString('en-IN')})</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${act.pct}%`,
                        backgroundColor: i === 0 ? '#0B4A7D' : i === 1 ? '#B5532A' : '#646058',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#E5DFD3] flex items-center justify-between text-xs text-[#6B655C]">
            <span>
              {cohortFilter === 'literacy'
                ? '86% had non-functional or zero prior reading capacity at enrollment.'
                : '61.4% operated informal micro-trades prior to structured skilling induction.'}
            </span>
            <span className="font-semibold text-[#2E6B4E]">Verified M0 Audit</span>
          </div>
        </div>

        {/* Right (5 cols): Demographics & Baseline Income */}
        <div className="lg:col-span-5 space-y-5">
          {/* 100% Women Beneficiaries: Age Profile */}
          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5">
              <div>
                <h3 className="font-narrative text-base font-normal text-[#1C1917]">
                  100% Women Beneficiaries
                </h3>
                <p className="text-[11px] text-[#6B655C]">Age distribution & learner background</p>
              </div>
              <span className="text-[10px] font-bold text-[#0B4A7D] bg-[#E7F0F7] px-2 py-0.5 rounded">
                Bajaj Women Priority
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {ageBreakdown.map((ag) => (
                <div key={ag.range} className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#8C8479] font-medium">{ag.range}</span>
                    <span className="text-xs font-semibold text-[#0B4A7D] tabular-nums">{ag.pct}%</span>
                  </div>
                  <div className="text-[10px] text-[#6B655C] mt-0.5 truncate">{ag.note}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E5DFD3] text-[11px] text-[#0B4A7D] font-semibold flex items-center gap-1.5">
              <Sparkle size={14} />
              <span>78% First-time formal skilling or literacy learners in their households</span>
            </div>
          </div>

          {/* Baseline Monthly Income Distribution */}
          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 shadow-xs space-y-3">
            <div className="border-b border-[#E5DFD3] pb-2.5">
              <h3 className="font-narrative text-base font-normal text-[#1C1917]">
                Baseline Monthly Income Distribution
              </h3>
              <p className="text-[11px] text-[#6B655C]">Self-reported pre-intervention earnings tier</p>
            </div>

            <div className="space-y-2.5">
              {incomeDistribution.map((r) => (
                <div key={r.range} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B655C]">{r.range}</span>
                    <span className="font-semibold tabular-nums text-[#1C1917]">{r.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2.5 border-t border-[#E5DFD3]">
              <p className="text-xs font-semibold text-[#B45309]">
                85% of incoming women earned below ₹10,000/month at intake.
              </p>
              <p className="text-[10px] text-[#8C8479] mt-0.5">
                Exact sum of Below ₹5,000 (41%) + ₹5,000–₹10,000 (44%) verified across all 6 districts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TRIAD: BUSINESS OWNERSHIP, FINANCIAL ACCESS, PHONE CONNECTIVITY (CLEAN PADDING) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Enterprise Experience */}
        <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[#0B4A7D] mb-1">
              <Briefcase size={16} />
              <h3 className="font-narrative text-base font-normal text-[#1C1917]">
                Prior Commercial Experience
              </h3>
            </div>
            <p className="text-xs text-[#6B655C]">Pre-enrollment business activity status</p>

            <div className="space-y-3 mt-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C1917] font-medium">Informal Home Nano-Trade</span>
                  <span className="font-semibold tabular-nums text-[#0B4A7D]">42.5%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B4A7D] rounded-full" style={{ width: '42.5%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C1917] font-medium">Seasonal Haat / Street Stall</span>
                  <span className="font-semibold tabular-nums text-[#B5532A]">18.9%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B5532A] rounded-full" style={{ width: '18.9%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C1917] font-medium">First-Time Entrepreneur</span>
                  <span className="font-semibold tabular-nums text-[#646058]">38.6%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#646058] rounded-full" style={{ width: '38.6%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5DFD3] text-[11px] text-[#6B655C]">
            38.6% of women had zero commercial enterprise experience prior to induction.
          </div>
        </div>

        {/* Card 2: Financial Access Baseline */}
        <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[#0B4A7D] mb-1">
              <Bank size={16} />
              <h3 className="font-narrative text-base font-normal text-[#1C1917]">
                Baseline Financial Inclusion
              </h3>
            </div>
            <p className="text-xs text-[#6B655C]">Banking & credit linkage status at intake</p>

            <div className="space-y-2.5 mt-3">
              <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#1C1917]">Bank Account Held</div>
                  <div className="text-[10px] text-[#8C8479]">PMJDY basic savings account</div>
                </div>
                <span className="text-lg font-semibold tabular-nums text-[#2E6B4E]">88.4%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#1C1917]">Formal Credit Linkage</div>
                  <div className="text-[10px] text-[#8C8479]">Prior bank or Mudra sanction</div>
                </div>
                <span className="text-lg font-semibold tabular-nums text-[#A86414]">12.2%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#1C1917]">Prior Digital UPI Usage</div>
                  <div className="text-[10px] text-[#8C8479]">Transacted via QR or UPI PIN</div>
                </div>
                <span className="text-lg font-semibold tabular-nums text-[#646058]">23.5%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5DFD3] text-[11px] text-[#6B655C]">
            High bank account penetration, but severe commercial credit and UPI starvation at entry.
          </div>
        </div>

        {/* Card 3: Realistic Phone Connectivity */}
        <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[#0B4A7D] mb-1">
              <DeviceMobile size={16} />
              <h3 className="font-narrative text-base font-normal text-[#1C1917]">
                Mobile Phone Access at Intake
              </h3>
            </div>
            <p className="text-xs text-[#6B655C]">Frontline digital readiness profile</p>

            <div className="space-y-3 mt-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C1917] font-medium">Own Smartphone</span>
                  <span className="font-semibold tabular-nums text-[#0B4A7D]">54.0%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B4A7D] rounded-full" style={{ width: '54%' }} />
                </div>
                <span className="text-[10px] text-[#8C8479] block">Personal WhatsApp & UPI capable</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C1917] font-medium">Shared Family Smartphone</span>
                  <span className="font-semibold tabular-nums text-[#B5532A]">32.0%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B5532A] rounded-full" style={{ width: '32%' }} />
                </div>
                <span className="text-[10px] text-[#8C8479] block">Available in evenings after work</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#1C1917] font-medium">Feature Phone / Field-Assisted</span>
                  <span className="font-semibold tabular-nums text-[#646058]">14.0%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#646058] rounded-full" style={{ width: '14%' }} />
                </div>
                <span className="text-[10px] text-[#8C8479] block">Logged by offline Field Officer tablet</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5DFD3] text-[11px] text-[#6B655C]">
            54% own a smartphone; 46% require shared or field-officer assisted data collection.
          </div>
        </div>
      </div>
    </div>
  );
};
