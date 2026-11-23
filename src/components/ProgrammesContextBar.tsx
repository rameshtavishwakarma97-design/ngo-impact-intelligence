import React, { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScreenId } from '../App';
import { useImpactStore } from '../data/impactStore';

export interface ProgrammesContextBarProps {
  selectedProgram: 'micro-skilling' | 'literacy';
  onProgramChange: (p: 'micro-skilling' | 'literacy') => void;
  selectedState: string;
  onStateChange: (s: string) => void;
  selectedNgo: string;
  onNgoChange: (n: string) => void;
  selectedCohort: string;
  onCohortChange: (c: string) => void;
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const ProgrammesContextBar: React.FC<ProgrammesContextBarProps> = ({
  selectedProgram,
  onProgramChange,
  selectedState,
  onStateChange,
  selectedNgo,
  onNgoChange,
  selectedCohort,
  onCohortChange,
  activeScreen,
  onSelectScreen,
}) => {
  const { ngos } = useImpactStore();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const isMicro = selectedProgram === 'micro-skilling';

  const currentProgramNgos = ngos.filter(n => n.program === selectedProgram);

  const tabs = isMicro
    ? [
        { id: 'income' as ScreenId, label: 'Earnings & Income' },
        { id: 'entrepreneurship' as ScreenId, label: 'Enterprise & Survival' },
        { id: 'digital' as ScreenId, label: 'Financial & Digital' },
        { id: 'prepost' as ScreenId, label: 'Before vs. After' },
      ]
    : [
        { id: 'income' as ScreenId, label: 'Reading & Numeracy' },
        { id: 'digital' as ScreenId, label: 'Banking & UPI Fluency' },
        { id: 'entrepreneurship' as ScreenId, label: 'Autonomy & Agency' },
        { id: 'prepost' as ScreenId, label: 'Before vs. After' },
      ];

  return (
    <section className="bg-[#FCFBF8] border border-[#E5DFD3] rounded-2xl px-4 py-3 shadow-2xs mb-6 md:sticky md:top-14 z-20 backdrop-blur-md space-y-2.5">
      {/* Mobile Layout (< md): Full-width Programme + Filter Drawer Toggle */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <div className="relative flex-1 min-w-0">
          <select
            aria-label="Select CSR Programme"
            value={selectedProgram}
            onChange={(e) => onProgramChange(e.target.value as 'micro-skilling' | 'literacy')}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-[#F7F4ED] hover:bg-[#EFECE4] border border-[#E5DFD3] rounded-xl text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer shadow-2xs truncate"
          >
            <option value="micro-skilling">
              Micro-Skilling: Women Entrepreneurs (28,400)
            </option>
            <option value="literacy">
              Foundational Women's Literacy (14,450)
            </option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]"
          />
        </div>

        <button
          type="button"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 cursor-pointer ${
            mobileFiltersOpen || selectedState !== 'All States' || selectedNgo !== 'All NGOs' || selectedCohort !== 'All Cohorts'
              ? 'bg-[#0B4A7D] text-white border-[#0B4A7D]'
              : 'bg-[#F7F4ED] text-[#646058] border-[#E5DFD3] hover:text-[#181D24]'
          }`}
        >
          <SlidersHorizontal size={13} />
          <span>Filters</span>
          <span className="text-[10px]">{mobileFiltersOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Mobile Expandable Filter Drawer (< md) */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden overflow-hidden space-y-2 pt-1 border-t border-[#E5DFD3]/80"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* State Filter */}
              <div className="relative">
                <select
                  aria-label="Filter by State"
                  value={selectedState}
                  onChange={(e) => onStateChange(e.target.value)}
                  className="w-full appearance-none pl-2.5 pr-6 py-2 bg-[#FCFBF8] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none"
                >
                  <option value="All States">All States (MH, MP, TN)</option>
                  <option value="Maharashtra">Maharashtra (Pune, Thane, Nashik)</option>
                  <option value="Madhya Pradesh">Madhya Pradesh (Chhindwara, Jabalpur)</option>
                  <option value="Tamil Nadu">Tamil Nadu (Coimbatore)</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
              </div>

              {/* NGO Partner Filter */}
              <div className="relative">
                <select
                  aria-label="Filter by NGO Partner"
                  value={selectedNgo}
                  onChange={(e) => onNgoChange(e.target.value)}
                  className="w-full appearance-none pl-2.5 pr-6 py-2 bg-[#FCFBF8] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none"
                >
                  <option value="All NGOs">All NGOs ({currentProgramNgos.length} Partners)</option>
                  {currentProgramNgos.map(n => (
                    <option key={n.ngoId} value={n.ngoName}>{n.ngoName} ({n.district})</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
              </div>

              {/* Cohort Filter */}
              <div className="relative">
                <select
                  aria-label="Filter by Cohort Wave"
                  value={selectedCohort}
                  onChange={(e) => onCohortChange(e.target.value)}
                  className="w-full appearance-none pl-2.5 pr-6 py-2 bg-[#FCFBF8] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none"
                >
                  <option value="All Cohorts">All Cohorts (142 Batches)</option>
                  <option value="Cohort 1">Cohort 1 (M6 Audited)</option>
                  <option value="Cohort 2">Cohort 2 (M3 Midline)</option>
                  <option value="Cohort 3">Cohort 3 (M0 Intake)</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Layout (>= md): Sleek Single-Row with Flex-Wrap Safe Spacing */}
      <div className="hidden md:flex flex-wrap items-center justify-between gap-2.5 py-0.5">
        {/* Left: Programme Selector Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] uppercase font-semibold text-[#8C8479] tracking-wider hidden lg:inline">
            Programme:
          </span>
          <div className="relative inline-block">
            <select
              aria-label="Select CSR Programme"
              value={selectedProgram}
              onChange={(e) => onProgramChange(e.target.value as 'micro-skilling' | 'literacy')}
              className="appearance-none pl-3 pr-8 py-1.5 bg-[#F7F4ED] hover:bg-[#EFECE4] border border-[#E5DFD3] rounded-xl text-xs sm:text-sm font-semibold text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
            >
              <option value="micro-skilling">
                Micro-Skilling: Women Entrepreneurs (28,400 Women · 4 NGOs)
              </option>
              <option value="literacy">
                Foundational Women's Literacy (14,450 Women · 2 NGOs)
              </option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]"
            />
          </div>
        </div>

        {/* Right: Inline Filter Trio */}
        <div className="flex flex-wrap items-center gap-2">
          {/* State Filter */}
          <div className="relative">
            <select
              aria-label="Filter by State"
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="appearance-none pl-2.5 pr-6 py-1.5 bg-[#FCFBF8] hover:bg-[#F7F4ED] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer shadow-2xs"
            >
              <option value="All States">All States (Maharashtra, MP, TN)</option>
              <option value="Maharashtra">Maharashtra (Pune, Thane, Nashik)</option>
              <option value="Madhya Pradesh">Madhya Pradesh (Chhindwara, Jabalpur)</option>
              <option value="Tamil Nadu">Tamil Nadu (Coimbatore)</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
          </div>

          {/* NGO Partner Filter */}
          <div className="relative">
            <select
              aria-label="Filter by NGO Partner"
              value={selectedNgo}
              onChange={(e) => onNgoChange(e.target.value)}
              className="appearance-none pl-2.5 pr-6 py-1.5 bg-[#FCFBF8] hover:bg-[#F7F4ED] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer shadow-2xs"
            >
              <option value="All NGOs">All NGO Partners ({currentProgramNgos.length} NGOs)</option>
              {currentProgramNgos.map(n => (
                <option key={n.ngoId} value={n.ngoName}>{n.ngoName} ({n.district})</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
          </div>

          {/* Cohort Filter */}
          <div className="relative">
            <select
              aria-label="Filter by Cohort Wave"
              value={selectedCohort}
              onChange={(e) => onCohortChange(e.target.value)}
              className="appearance-none pl-2.5 pr-6 py-1.5 bg-[#FCFBF8] hover:bg-[#F7F4ED] border border-[#E5DFD3] rounded-lg text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#0B4A7D] cursor-pointer shadow-2xs"
            >
              <option value="All Cohorts">All Cohorts (142 Batches)</option>
              <option value="Cohort 1">Cohort 1 (M6 Audited)</option>
              <option value="Cohort 2">Cohort 2 (M3 Midline)</option>
              <option value="Cohort 3">Cohort 3 (M0 Intake)</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C8479]" />
          </div>
        </div>
      </div>

      {/* 4 Consolidated Adaptive Outcome Tabs with Shared-Element Gliding Pill */}
      <div className="flex items-center gap-1.5 border-t border-[#E5DFD3]/80 pt-2 overflow-x-auto no-scrollbar whitespace-nowrap relative">
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectScreen(tab.id)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-transform duration-100 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 focus-visible:outline-none ${
                isActive ? 'text-white font-semibold' : 'text-[#6B655C] hover:text-[#1C1917] hover:bg-[#F7F4ED]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="programmes-active-tab"
                  className="absolute inset-0 bg-[#0B4A7D] rounded-lg shadow-2xs z-0"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
