import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  PhoneCall,
  MapPin,
  Clock,
  QrCode,
  Building,
  Send,
} from 'lucide-react';
import { useImpactStore, type BeneficiaryRecord, type BatchRecord, type SurveyQARecord } from '../data/impactStore';
import { SonnerToast, type ToastItem } from '../components/SonnerToast';

interface NgoErpConsoleProps {
  activeTab?: 'batches' | 'beneficiaries' | 'qa_queue';
  onSelectTab?: (tab: 'batches' | 'beneficiaries' | 'qa_queue') => void;
}

export const NgoErpConsole: React.FC<NgoErpConsoleProps> = ({
  activeTab: controlledActiveTab,
}) => {
  const {
    batches,
    beneficiaries,
    surveyQAQueue,
    fieldErpPulse,
    markBatchAttendance,
    approveAndPublishSurvey,
    returnSurvey,
    assignHomeVisit,
    raiseNgoIssue,
  } = useImpactStore();

  const [internalActiveTab] = useState<'batches' | 'beneficiaries' | 'qa_queue'>('batches');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  // Raise Issue Modal State (Pass 2 Two-Sided Communication Loop)
  const [raiseModalOpen, setRaiseModalOpen] = useState<boolean>(false);
  const [issueCategory, setIssueCategory] = useState<string>('Banking / Escrow');
  const [issueTitle, setIssueTitle] = useState<string>('');
  const [issueContext, setIssueContext] = useState<string>('');
  const [issueHelpNeeded, setIssueHelpNeeded] = useState<string>('');

  // Filters for Beneficiary Ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Beneficiary for 360° Drawer
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryRecord | null>(null);

  // Home Visit Modal State
  const [homeVisitModalBen, setHomeVisitModalBen] = useState<BeneficiaryRecord | null>(null);
  const [homeVisitNote, setHomeVisitNote] = useState('');

  // Attendance Modal State
  const [attendanceModalBatch, setAttendanceModalBatch] = useState<BatchRecord | null>(null);
  const [attendanceCheckedIds, setAttendanceCheckedIds] = useState<string[]>([]);
  const [lectureTopicInput, setLectureTopicInput] = useState('');

  // QA Return Modal State
  const [returnModalSurvey, setReturnModalSurvey] = useState<SurveyQARecord | null>(null);
  const [returnReasonInput, setReturnReasonInput] = useState('');

  // Toast Notification
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [approvingSurveyId, setApprovingSurveyId] = useState<string | null>(null);

  // Global ESC key listener to dismiss drawer & modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBeneficiary(null);
        setHomeVisitModalBen(null);
        setAttendanceModalBatch(null);
        setReturnModalSurvey(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (title: string, desc?: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, title, desc }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Filtered Beneficiaries
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchWard = b.villageWard.toLowerCase().includes(q);
        const matchTrade = b.primaryTrade.toLowerCase().includes(q);
        if (!matchName && !matchWard && !matchTrade) return false;
      }
      if (tradeFilter !== 'all' && b.primaryTrade !== tradeFilter) return false;
      if (batchFilter !== 'all' && b.batchId !== batchFilter) return false;
      if (statusFilter !== 'all' && b.m6SurveyStatus !== statusFilter) return false;
      return true;
    });
  }, [beneficiaries, searchQuery, tradeFilter, batchFilter, statusFilter]);

  // Cohort Dynamic Averages
  const cohortStats = useMemo(() => {
    if (filteredBeneficiaries.length === 0) return null;
    const avgAge = Math.round(filteredBeneficiaries.reduce((sum, b) => sum + b.age, 0) / filteredBeneficiaries.length);
    const avgBaseline = Math.round(filteredBeneficiaries.reduce((sum, b) => sum + b.m0BaselineIncome, 0) / filteredBeneficiaries.length);
    const avgAttendance = (filteredBeneficiaries.reduce((sum, b) => sum + b.attendancePct, 0) / filteredBeneficiaries.length).toFixed(1);
    const upiCount = filteredBeneficiaries.filter((b) => b.upiAdoption === 'Active QR').length;
    const upiPct = Math.round((upiCount / filteredBeneficiaries.length) * 100);
    return { avgAge, avgBaseline, avgAttendance, upiPct, total: filteredBeneficiaries.length };
  }, [filteredBeneficiaries]);

  // At-risk women (missed >= 2 classes)
  const atRiskWomen = useMemo(() => {
    return beneficiaries.filter((b) => b.missedConsecutiveClasses >= 2);
  }, [beneficiaries]);

  // Handle Home Visit Assignment
  const handleConfirmHomeVisit = () => {
    if (!homeVisitModalBen) return;
    const noteText = homeVisitNote.trim() || 'Urgent home visit requested: 2 consecutive absences from micro-skilling.';
    assignHomeVisit(homeVisitModalBen.id, noteText);
    showToast(
      'Home Visit Dispatched to Field App',
      `Ticket generated for Mithun K. regarding ${homeVisitModalBen.name} (${homeVisitModalBen.villageWard}).`
    );
    setHomeVisitModalBen(null);
    setHomeVisitNote('');
  };

  // Open Attendance Modal
  const handleOpenAttendance = (batch: BatchRecord) => {
    setAttendanceModalBatch(batch);
    setLectureTopicInput(batch.currentModule);
    // Pre-select beneficiaries of that batch who aren't at risk or default select all
    const batchBens = beneficiaries.filter((b) => b.batchId === batch.id);
    setAttendanceCheckedIds(batchBens.map((b) => b.id));
  };

  // Confirm Attendance Save
  const handleSaveAttendance = () => {
    if (!attendanceModalBatch) return;
    markBatchAttendance(attendanceModalBatch.id, attendanceCheckedIds, lectureTopicInput);
    showToast(
      'Attendance Synchronized Live',
      `${attendanceCheckedIds.length} beneficiaries marked present for ${attendanceModalBatch.name}. Funder weekly pulse updated.`
    );
    setAttendanceModalBatch(null);
  };

  // Confirm Approve Survey with Stateful Morph
  const handleApproveSurvey = (survey: SurveyQARecord) => {
    setApprovingSurveyId(survey.id);
    setTimeout(() => {
      approveAndPublishSurvey(survey.id);
      setApprovingSurveyId(null);
      showToast(
        'Survey Approved & Synced to Bajaj',
        `${survey.beneficiaryName}'s M6 milestone (+₹${(survey.m6CalculatedProfit - survey.m0BaselineIncome).toLocaleString('en-IN')}) verified & synced to Suman Bajaj.`
      );
    }, 320);
  };

  // Confirm Return Survey
  const handleConfirmReturnSurvey = () => {
    if (!returnModalSurvey) return;
    const reason = returnReasonInput.trim() || 'GPS coordinate re-check and income receipt reconciliation requested.';
    returnSurvey(returnModalSurvey.id, reason);
    showToast(
      'Survey Returned for Field Verification',
      `Sent back to Mithun K. with instructions: "${reason}"`
    );
    setReturnModalSurvey(null);
    setReturnReasonInput('');
  };

  // Submit Partner Issue to Bajaj CSR (Two-Sided Communication Loop)
  const handleRaiseIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim() || !issueContext.trim() || !issueHelpNeeded.trim()) return;
    raiseNgoIssue(
      'pratham',
      issueCategory,
      issueTitle.trim(),
      issueContext.trim(),
      issueHelpNeeded.trim()
    );
    setRaiseModalOpen(false);
    setIssueTitle('');
    setIssueContext('');
    setIssueHelpNeeded('');
    showToast(
      'Issue Escalated to Bajaj CSR ✓',
      'Ticket dispatched directly to Suman Bajaj leadership inbox.'
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* ── SONNER STACKED TOAST ────────────────────────────────────── */}
      <SonnerToast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* ── TOP CONTEXT HEADER: PRATHAM PUNE OPERATIONS ───────────────── */}
      <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
                NGO Team Leader Console
              </span>
              <span className="text-xs text-[#8C8479]">·</span>
              <span className="text-xs font-medium text-[#2E6B4E] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2E6B4E] animate-pulse" />
                Live Connection to Bajaj ImpactOS
              </span>
            </div>
            <h1 className="font-narrative text-2xl sm:text-3xl font-normal text-[#1C1917]">
              Pratham Foundation · Pune Block Operations
            </h1>
            <p className="text-xs text-[#6B655C]">
              Operational hub managing 6 micro-skilling batches, daily GPS-verified attendance, and M6 survey QA verification.
            </p>
          </div>

          {/* Quick Metrics Badges & Escalation Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] text-[#1C1917] font-semibold tabular-nums">
              <span className="text-[#8C8479] font-normal mr-1.5">Synced to Bajaj:</span>
              {fieldErpPulse.syncedSurveysCount.toLocaleString('en-IN')}
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] text-[#1C1917] font-semibold tabular-nums">
              <span className="text-[#8C8479] font-normal mr-1.5">Field QA Pass:</span>
              96.2%
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] text-[#1C1917] font-semibold tabular-nums">
              <span className="text-[#8C8479] font-normal mr-1.5">Active Officers:</span>
              3
            </div>

            <button
              type="button"
              onClick={() => setRaiseModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 active:scale-[0.98]"
            >
              <AlertTriangle size={13} />
              <span>+ Raise Issue to Bajaj</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB A: BATCHES & ATTENDANCE ─────────────────────────────────── */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          {/* Top 4-Stat Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-4 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#8C8479] font-medium block">
                Active Cohorts
              </span>
              <div className="font-sans font-semibold text-2xl text-[#1C1917] tabular-nums">
                {batches.length} Batches
              </div>
              <p className="text-[11px] text-[#6B655C]">Pune Urban & Peri-Urban Clusters</p>
            </div>

            <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-4 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#8C8479] font-medium block">
                Weekly Attendance
              </span>
              <div className="font-sans font-semibold text-2xl text-[#2E6B4E] tabular-nums">
                {fieldErpPulse.weeklyAttendancePct}%
              </div>
              <p className="text-[11px] text-[#6B655C]">Target: ≥90% attendance</p>
            </div>

            <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-4 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#8C8479] font-medium block">
                At-Risk Drop-Outs
              </span>
              <div className="font-sans font-semibold text-2xl text-[#B42318] tabular-nums">
                {atRiskWomen.length} Women
              </div>
              <p className="text-[11px] text-[#B42318]">≥2 missed classes alert</p>
            </div>

            <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-4 space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#8C8479] font-medium block">
                Pending QA Queue
              </span>
              <div className="font-sans font-semibold text-2xl text-[#B45309] tabular-nums">
                {fieldErpPulse.pendingQACount} Surveys
              </div>
              <p className="text-[11px] text-[#6B655C]">Awaiting Team Leader review</p>
            </div>
          </div>

          {/* Active Cohorts Progress Table */}
          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-[#E5DFD3] flex items-center justify-between">
              <div>
                <h2 className="font-narrative text-lg font-normal text-[#1C1917]">
                  Active Training Batches & Schedule
                </h2>
                <p className="text-xs text-[#6B655C]">
                  Curriculum completion, field officer in charge, and GPS-verified attendance logs.
                </p>
              </div>
              <span className="text-xs text-[#8C8479] font-medium">{batches.length} cohorts running</span>
            </div>

            <div className="divide-y divide-[#E5DFD3]">
              {batches.map((batch) => {
                const progressPct = Math.round((batch.lecturesCompleted / batch.totalLectures) * 100);
                return (
                  <div
                    key={batch.id}
                    className="p-4 sm:p-5 hover:bg-[#F7F4ED]/50 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    {/* Col 1: Batch Info (md:col-span-4) */}
                    <div className="md:col-span-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#8C8479] bg-[#EAE6DD] px-1.5 py-0.5 rounded tracking-tight">
                          {batch.id}
                        </span>
                        <h3 className="font-sans text-xs font-semibold text-[#1C1917]">
                          {batch.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#6B655C] flex items-center gap-1.5">
                        <MapPin size={11} className="text-[#8C8479]" />
                        <span>{batch.ward}</span>
                        <span>·</span>
                        <span>Officer: <strong>{batch.fieldOfficer}</strong></span>
                      </p>
                    </div>

                    {/* Col 2: Curriculum Progress (md:col-span-3) */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#6B655C]">Curriculum Progress</span>
                        <span className="font-semibold text-[#1C1917] tabular-nums">
                          {batch.lecturesCompleted} / {batch.totalLectures} ({progressPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E5DFD3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2E6B4E] rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#8C8479] truncate">{batch.currentModule}</p>
                    </div>

                    {/* Col 3: Attendance & At-Risk (md:col-span-3) */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[10px] text-[#8C8479] block">ATTENDANCE</span>
                          <span className="text-xs font-semibold text-[#2E6B4E] tabular-nums">
                            {batch.attendancePct}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8C8479] block">ENROLLED</span>
                          <span className="text-xs font-semibold text-[#1C1917] tabular-nums">
                            {batch.enrolledCount} women
                          </span>
                        </div>
                        {batch.atRiskCount > 0 && (
                          <div>
                            <span className="text-[10px] text-[#B42318] block">AT RISK</span>
                            <span className="text-xs font-semibold text-[#B42318] tabular-nums">
                              {batch.atRiskCount} alert
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-[#6B655C] truncate">
                        Next: {batch.nextSession}
                      </p>
                    </div>

                    {/* Col 4: Action (md:col-span-2) */}
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenAttendance(batch)}
                        className="px-3 py-1.5 rounded-lg bg-[#FCFBF8] border border-[#2E6B4E] text-[#2E6B4E] hover:bg-[#2E6B4E] hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Log Attendance
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drop-out Recovery Alert Section */}
          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#B42318]" />
                  <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                    Drop-Out Early Warning & Recovery Action
                  </h3>
                </div>
                <p className="text-xs text-[#6B655C] mt-0.5">
                  Women with ≥2 consecutive class absences. Assign a home-visit ticket directly to Mithun K.'s mobile app to prevent drop-out.
                </p>
              </div>
              <span className="text-xs font-bold text-[#B42318] bg-[#FCECEB] px-2 py-0.5 rounded">
                {atRiskWomen.length} Urgent Follow-ups
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {atRiskWomen.map((woman) => (
                <div
                  key={woman.id}
                  className="rounded-xl border border-[#E5DFD3] bg-[#F7F4ED]/60 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-sans text-xs font-semibold text-[#1C1917]">
                        {woman.name} ({woman.age} yrs)
                      </h4>
                      <p className="text-[11px] text-[#6B655C]">{woman.villageWard}</p>
                      <span className="inline-block text-[10px] text-[#8C8479] bg-[#EAE6DD] px-1.5 py-0.2 rounded mt-1 font-medium">
                        Trade: {woman.primaryTrade} · {woman.batchName}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#B42318] bg-white border border-[#B42318]/30 px-2 py-0.5 rounded">
                      {woman.missedConsecutiveClasses} Missed Classes
                    </span>
                  </div>

                  <div className="text-[11px] text-[#6B655C] space-y-1 pt-2 border-t border-[#E5DFD3]">
                    <div>Assets: {woman.cattleAssets}</div>
                    <div>Attendance: <span className="font-semibold text-[#B42318]">{woman.attendancePct}%</span></div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {woman.homeVisitScheduled ? (
                      <span className="text-[11px] text-[#2E6B4E] font-medium flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-[#2E6B4E]" />
                        Home Visit Ticket Dispatched
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setHomeVisitModalBen(woman)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E6B4E] text-white text-xs font-semibold hover:bg-[#24563E] transition-colors cursor-pointer shadow-2xs"
                      >
                        <PhoneCall size={12} />
                        <span>Assign Home Visit Ticket</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB B: BENEFICIARY 360° LEDGER ─────────────────────────────── */}
      {activeTab === 'beneficiaries' && (
        <div className="space-y-6">
          {/* Multi-Filter Control Bar */}
          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8479]" />
                <input
                  type="text"
                  placeholder="Search by woman's name, ward, or trade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917] placeholder-[#8C8479] focus:border-[#2E6B4E]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={tradeFilter}
                  onChange={(e) => setTradeFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-[#1C1917] outline-none cursor-pointer"
                >
                  <option value="all">All Trades</option>
                  <option value="Tailoring">Tailoring</option>
                  <option value="Veg Vending">Veg Vending</option>
                  <option value="Mobile Repair">Mobile Repair</option>
                  <option value="Dairy/Livestock">Dairy/Livestock</option>
                  <option value="Grocery/Kirana">Grocery/Kirana</option>
                </select>

                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-[#1C1917] outline-none cursor-pointer"
                >
                  <option value="all">All Batches</option>
                  <option value="BATCH-PN-01">Batch PN-01 (Kothrud)</option>
                  <option value="BATCH-PN-02">Batch PN-02 (Hadapsar)</option>
                  <option value="BATCH-PN-03">Batch PN-03 (Sinhagad)</option>
                  <option value="BATCH-PN-04">Batch PN-04 (Shivajinagar)</option>
                  <option value="BATCH-TH-01">Batch TH-01 (Kalwa)</option>
                  <option value="BATCH-TH-02">Batch TH-02 (Mumbra)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-[#1C1917] outline-none cursor-pointer"
                >
                  <option value="all">All M6 Statuses</option>
                  <option value="Pending">Pending Survey</option>
                  <option value="In QA">In QA Queue</option>
                  <option value="Published to Bajaj">Published to Bajaj</option>
                </select>
              </div>
            </div>

            {/* Dynamic Cohort Summary Strip */}
            {cohortStats && (
              <div className="pt-3 border-t border-[#E5DFD3] flex flex-wrap items-center justify-between text-xs text-[#6B655C]">
                <div>
                  Showing <strong className="text-[#1C1917]">{cohortStats.total}</strong> filtered women
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Avg Age: <strong>{cohortStats.avgAge} yrs</strong></span>
                  <span>Avg Baseline: <strong>₹{cohortStats.avgBaseline.toLocaleString('en-IN')}/mo</strong></span>
                  <span>Avg Attendance: <strong>{cohortStats.avgAttendance}%</strong></span>
                  <span>UPI Adoption: <strong>{cohortStats.upiPct}%</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Beneficiary Ledger Table */}
          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] overflow-hidden shadow-xs">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#EFECE4] border-b border-[#E5DFD3] text-[10px] uppercase tracking-wider text-[#8C8479]">
                    <th className="py-3 px-4 font-semibold">Beneficiary Profile</th>
                    <th className="py-3 px-4 font-semibold">Trade & Assets</th>
                    <th className="py-3 px-4 font-semibold">Batch Cohort</th>
                    <th className="py-3 px-4 font-semibold">Attendance & Score</th>
                    <th className="py-3 px-4 font-semibold">M0 → M6 Income</th>
                    <th className="py-3 px-4 font-semibold">M6 Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {filteredBeneficiaries.map((b) => {
                    const lift = b.m6CalculatedProfit - b.m0BaselineIncome;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBeneficiary(b)}
                        className="hover:bg-[#F7F4ED]/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1C1917]">{b.name}</div>
                          <div className="text-[11px] text-[#6B655C]">{b.villageWard} · {b.age}y</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#1C1917]">{b.primaryTrade}</div>
                          <div className="text-[11px] text-[#8C8479] truncate max-w-[160px]">{b.cattleAssets}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#1C1917]">{b.batchId}</div>
                          <div className="text-[11px] text-[#8C8479] truncate max-w-[140px]">{b.batchName.split('·')[1]}</div>
                        </td>

                        <td className="py-3.5 px-4 tabular-nums">
                          <div className="font-semibold text-[#1C1917]">{b.attendancePct}% attendance</div>
                          <div className="text-[11px] text-[#6B655C]">Score: {b.practicalAssessmentScore}/100</div>
                        </td>

                        <td className="py-3.5 px-4 tabular-nums">
                          {b.m6SurveyStatus === 'Pending' ? (
                            <div>
                              <div className="font-semibold text-[#1C1917]">
                                ₹{b.m0BaselineIncome.toLocaleString('en-IN')} → <span className="text-[#8C8479] font-normal">Pending M6</span>
                              </div>
                              <div className="text-[11px] text-[#8C8479]">
                                Baseline verified · Survey pending
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-[#1C1917]">
                                ₹{b.m0BaselineIncome.toLocaleString('en-IN')} → ₹{b.m6CalculatedProfit.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[11px] text-[#2E6B4E] font-medium">
                                +₹{lift.toLocaleString('en-IN')} lift
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {b.m6SurveyStatus === 'Published to Bajaj' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
                              <CheckCircle2 size={11} /> Published
                            </span>
                          )}
                          {b.m6SurveyStatus === 'In QA' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A86414] bg-[#FEF6EE] px-2 py-0.5 rounded">
                              <Clock size={11} /> In QA Queue
                            </span>
                          )}
                          {b.m6SurveyStatus === 'Pending' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8C8479] bg-[#EAE6DD] px-2 py-0.5 rounded">
                              Pending M6
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBeneficiary(b);
                            }}
                            className="text-[11px] font-semibold text-[#2E6B4E] hover:underline cursor-pointer"
                          >
                            360° Profile →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Scannable Beneficiary Cards for Mobile (< md) */}
            <div className="md:hidden divide-y divide-[#E5DFD3]">
              {filteredBeneficiaries.map((b) => {
                const lift = b.m6CalculatedProfit - b.m0BaselineIncome;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBeneficiary(b)}
                    className="p-4 space-y-3 cursor-pointer hover:bg-[#F7F4ED]/60 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-sm text-[#1C1917]">{b.name}</div>
                        <div className="text-[11px] text-[#6B655C]">{b.villageWard} · {b.age}y</div>
                      </div>
                      <div>
                        {b.m6SurveyStatus === 'Published to Bajaj' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E6B4E] bg-[#E8F3EC] px-2 py-0.5 rounded">
                            <CheckCircle2 size={11} /> Published
                          </span>
                        )}
                        {b.m6SurveyStatus === 'In QA' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A86414] bg-[#FEF6EE] px-2 py-0.5 rounded">
                            <Clock size={11} /> In QA Queue
                          </span>
                        )}
                        {b.m6SurveyStatus === 'Pending' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8C8479] bg-[#EAE6DD] px-2 py-0.5 rounded">
                            Pending M6
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E5DFD3]/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C8479] block">Trade & Assets</span>
                        <span className="font-medium text-[#1C1917] block truncate">{b.primaryTrade}</span>
                        <span className="text-[10px] text-[#8C8479] truncate block">{b.cattleAssets}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C8479] block">Attendance & Score</span>
                        <span className="font-semibold text-[#1C1917] tabular-nums">{b.attendancePct}% attendance</span>
                        <span className="text-[10px] text-[#6B655C] block">Score: {b.practicalAssessmentScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E5DFD3]/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C8479] block">M0 → M6 Income</span>
                        {b.m6SurveyStatus === 'Pending' ? (
                          <span className="text-xs font-semibold text-[#1C1917]">
                            ₹{b.m0BaselineIncome.toLocaleString('en-IN')} → <span className="text-[#8C8479] font-normal">Pending M6</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-[#1C1917]">
                            ₹{b.m0BaselineIncome.toLocaleString('en-IN')} → ₹{b.m6CalculatedProfit.toLocaleString('en-IN')}{' '}
                            <span className="text-[#2E6B4E] font-bold">(+₹{lift.toLocaleString('en-IN')})</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#2E6B4E] hover:underline flex items-center gap-1">
                        <span>Profile</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB C: SURVEY QA & SYNC QUEUE ───────────────────────────────── */}
      {activeTab === 'qa_queue' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-narrative text-xl font-normal text-[#1C1917]">
                M6 Survey Verification Queue · The Governance Bridge to Bajaj
              </h2>
              <span className="text-xs text-[#8C8479] font-medium">
                {surveyQAQueue.length} Total Submissions Recorded
              </span>
            </div>
            <p className="text-xs text-[#6B655C]">
              Every field survey is quarantined in this staging queue for Team Leader verification before being cryptographically synced into Suman Bajaj's funder dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {surveyQAQueue.map((survey) => {
              const isApproved = survey.qaStatus === 'approved_synced';
              const isReturned = survey.qaStatus === 'returned_for_revision';
              const isPending = survey.qaStatus === 'pending_qa';

              return (
                <motion.div
                  key={survey.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.26 }}
                  className={`rounded-2xl border p-5 transition-colors space-y-4 ${
                    isApproved
                      ? 'bg-[#FCFBF8] border-[#2E6B4E]/40'
                      : isReturned
                      ? 'bg-[#FCFBF8] border-[#B42318]/30'
                      : 'bg-[#FCFBF8] border-[#E5DFD3] shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD3] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#E8F3EC] text-[#2E6B4E] font-bold text-xs flex items-center justify-center">
                        {survey.beneficiaryName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-sans text-xs font-semibold text-[#1C1917]">
                          {survey.beneficiaryName}
                        </h3>
                        <p className="text-[11px] text-[#6B655C]">
                          Officer: {survey.fieldOfficer} · {survey.batchId} · Submitted {survey.submissionTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {isApproved && (
                          <motion.span
                            key="approved"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs font-bold text-[#2E6B4E] bg-[#E8F3EC] px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} />
                            Synced to Bajaj ImpactOS
                          </motion.span>
                        )}
                        {isReturned && (
                          <motion.span
                            key="returned"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs font-bold text-[#B42318] bg-[#FCECEB] px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            <AlertTriangle size={13} />
                            Returned to Officer
                          </motion.span>
                        )}
                        {isPending && (
                          <motion.span
                            key="pending"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs font-bold text-[#A86414] bg-[#FEF6EE] px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            <Clock size={13} />
                            Awaiting Team Leader Sign-Off
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Operational Data Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-[#8C8479] uppercase block font-medium">Income Lift</span>
                      <div className="font-semibold text-[#1C1917] tabular-nums mt-0.5">
                        ₹{survey.m0BaselineIncome.toLocaleString('en-IN')} → ₹{survey.m6CalculatedProfit.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-[#2E6B4E] font-semibold">
                        +{survey.profitJumpPct}% lift
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#8C8479] uppercase block font-medium">GPS Geofence</span>
                      <div className="font-semibold text-[#2E6B4E] mt-0.5 flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{survey.gpsStatus}</span>
                      </div>
                      <span className="text-[10px] text-[#8C8479] truncate block">
                        {survey.gpsCoordinates}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#8C8479] uppercase block font-medium">Interview Duration</span>
                      <div className="font-semibold text-[#1C1917] mt-0.5 flex items-center gap-1">
                        <Clock size={12} />
                        <span>{survey.surveyDuration}</span>
                      </div>
                      <span className="text-[10px] text-[#6B655C]">
                        {survey.durationSeconds >= 60 ? '✓ Natural pacing verified' : '⚠️ Suspicious speedrun'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#8C8479] uppercase block font-medium">Triangulation Inputs</span>
                      <div className="text-[11px] text-[#1C1917] mt-0.5">
                        {survey.daysWorkedWeekly}d worked · ₹{survey.goodDayRevenue} / ₹{survey.slowDayRevenue}
                      </div>
                      <span className="text-[10px] text-[#6B655C]">
                        UPI: {survey.upiReceiptsCount} · Buffer: {survey.resilienceSource}
                      </span>
                    </div>
                  </div>

                  {/* Anomaly Callout (if flagged) */}
                  {survey.hasAnomaly && survey.anomalyNote && (
                    <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 flex items-start gap-2 text-xs">
                      <AlertTriangle size={15} className="text-[#B45309] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#92400E]">Automated Anomaly Audit Note:</strong>
                        <p className="text-[#78350F] text-[11px] mt-0.5">{survey.anomalyNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions for Pending QA */}
                  {isPending && (
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5DFD3]">
                      <button
                        type="button"
                        onClick={() => setReturnModalSurvey(survey)}
                        className="px-4 py-2 rounded-xl border border-[#D5CEC0] bg-[#FCFBF8] text-[#6B655C] hover:text-[#1C1917] hover:bg-[#EAE6DD] text-xs font-semibold cursor-pointer transition-transform duration-100 active:scale-[0.98]"
                      >
                        Return for Re-Survey
                      </button>

                      <button
                        type="button"
                        disabled={approvingSurveyId === survey.id}
                        onClick={() => handleApproveSurvey(survey)}
                        className="px-5 py-2 rounded-xl bg-[#2E6B4E] text-white hover:bg-[#24563E] text-xs font-semibold cursor-pointer transition-transform duration-100 active:scale-[0.98] shadow-2xs flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#2E6B4E]/25"
                      >
                        {approvingSurveyId === survey.id ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Syncing to Bajaj...</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            <span>Approve & Sync to Bajaj</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 360° BENEFICIARY DRAWER (460px Slide-over in AnimatePresence) ─────────────────── */}
      <AnimatePresence>
        {selectedBeneficiary && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedBeneficiary(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.26 }}
              className="relative z-10 w-full sm:max-w-[460px] max-h-[88dvh] sm:max-h-full sm:h-full bg-[#FCFBF8] rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-[#E5DFD3] p-5 sm:p-6 pb-safe overflow-y-auto overscroll-contain space-y-6 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD3]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2E6B4E] text-white font-bold text-sm flex items-center justify-center">
                  {selectedBeneficiary.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                    {selectedBeneficiary.name}
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Beneficiary 360° Identity Profile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBeneficiary(null)}
                className="p-1.5 rounded-lg text-[#8C8479] hover:text-[#1C1917] hover:bg-[#EAE6DD]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Demographics & KYC Badges */}
            <div className="rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] p-4 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                IDENTITY & STATUTORY KYC
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#8C8479] block">AGE & LOCATION</span>
                  <span className="font-semibold text-[#1C1917]">{selectedBeneficiary.age} years · {selectedBeneficiary.villageWard}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C8479] block">PRIMARY TRADE</span>
                  <span className="font-semibold text-[#2E6B4E]">{selectedBeneficiary.primaryTrade}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E6B4E] bg-white border border-[#2E6B4E]/30 px-2 py-0.5 rounded">
                  <ShieldCheck size={12} /> Aadhaar Masked ✓
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E6B4E] bg-white border border-[#2E6B4E]/30 px-2 py-0.5 rounded">
                  <Building size={12} /> Bank Linked ({selectedBeneficiary.kycStatus.accountNumberMasked})
                </span>
              </div>
            </div>

            {/* Assets & Livelihood Setup */}
            <div className="rounded-xl bg-[#FCFBF8] border border-[#E5DFD3] p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                PRODUCTIVE ASSETS & CAPITAL
              </span>
              <div className="text-xs text-[#1C1917] font-medium">
                {selectedBeneficiary.cattleAssets}
              </div>
              <p className="text-[11px] text-[#6B655C]">
                Verified by Pratham field officer inspection with GPS coordinates ({selectedBeneficiary.gpsLocation}).
              </p>
            </div>

            {/* Training Course Progress */}
            <div className="rounded-xl bg-[#FCFBF8] border border-[#E5DFD3] p-4 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                BAJAJ MICRO-SKILLING COURSE
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#8C8479] block">ATTENDANCE</span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">{selectedBeneficiary.attendancePct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C8479] block">PRACTICAL EXAM</span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">{selectedBeneficiary.practicalAssessmentScore} / 100</span>
                </div>
              </div>
              <div className="text-[11px] text-[#6B655C]">
                Enrolled in <strong>{selectedBeneficiary.batchName}</strong>
              </div>
            </div>

            {/* Longitudinal M0 to M6 Income Lift */}
            <div className="rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] p-4 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                LONGITUDINAL INCOME & DIGITAL ADOPTION
              </span>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#8C8479] block">M0 BASELINE</span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    ₹{selectedBeneficiary.m0BaselineIncome.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <ArrowRight size={14} className="text-[#8C8479]" />
                <div>
                  <span className="text-[10px] text-[#8C8479] block">M6 ESTIMATED</span>
                  {selectedBeneficiary.m6SurveyStatus === 'Pending' ? (
                    <span className="font-semibold text-[#8C8479]">
                      Pending M6
                    </span>
                  ) : (
                    <span className="font-semibold text-[#2E6B4E] tabular-nums">
                      ₹{selectedBeneficiary.m6CalculatedProfit.toLocaleString('en-IN')}/mo
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-[#8C8479] block">NET LIFT</span>
                  {selectedBeneficiary.m6SurveyStatus === 'Pending' ? (
                    <span className="font-medium text-[#8C8479]">
                      — (Awaiting M6)
                    </span>
                  ) : (
                    <span className="font-semibold text-[#2E6B4E] tabular-nums">
                      +₹{(selectedBeneficiary.m6CalculatedProfit - selectedBeneficiary.m0BaselineIncome).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-[#6B655C]">UPI Merchant QR:</span>
                <span className="font-semibold text-[#2E6B4E] flex items-center gap-1">
                  <QrCode size={12} /> {selectedBeneficiary.upiAdoption}
                </span>
              </div>
            </div>

            {/* Close Button with Tactile Feedback */}
            <button
              type="button"
              onClick={() => setSelectedBeneficiary(null)}
              className="w-full py-2.5 rounded-xl bg-[#2E6B4E] text-white text-xs font-semibold hover:bg-[#24563E] transition-transform duration-100 active:scale-[0.98] cursor-pointer shadow-2xs mt-4 focus-visible:ring-2 focus-visible:ring-[#2E6B4E]/25"
            >
              Done
            </button>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>

      {/* ── HOME VISIT MODAL ────────────────────────────────────────────── */}
      {homeVisitModalBen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setHomeVisitModalBen(null)}
        >
          <div
            className="w-full max-w-md bg-[#FCFBF8] border border-[#E5DFD3] rounded-2xl p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                Dispatch Home Visit Ticket
              </h3>
              <button
                type="button"
                onClick={() => setHomeVisitModalBen(null)}
                className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#6B655C]">
              Assign an immediate field outreach ticket for <strong>{homeVisitModalBen.name}</strong> ({homeVisitModalBen.villageWard}). This syncs directly to Mithun K.'s mobile app today schedule.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1C1917]">
                Instructions for Field Officer
              </label>
              <textarea
                rows={3}
                value={homeVisitNote}
                onChange={(e) => setHomeVisitNote(e.target.value)}
                placeholder="e.g. Check if sewing machine broke down, verify family support, or offer evening catch-up module..."
                className="w-full p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917] placeholder-[#8C8479] focus:border-[#2E6B4E]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setHomeVisitModalBen(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#6B655C] hover:bg-[#EAE6DD]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmHomeVisit}
                className="px-5 py-2 rounded-xl bg-[#2E6B4E] text-white text-xs font-semibold hover:bg-[#24563E] transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Dispatch Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOG ATTENDANCE MODAL ────────────────────────────────────────── */}
      {attendanceModalBatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setAttendanceModalBatch(null)}
        >
          <div
            className="w-full max-w-lg bg-[#FCFBF8] border border-[#E5DFD3] rounded-2xl p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                  Log GPS Attendance
                </h3>
                <p className="text-xs text-[#6B655C]">
                  {attendanceModalBatch.name} · {attendanceModalBatch.ward}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceModalBatch(null)}
                className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1C1917]">
                Curriculum Module Taught Today
              </label>
              <input
                type="text"
                value={lectureTopicInput}
                onChange={(e) => setLectureTopicInput(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#1C1917]">
                Beneficiary Roster Check-In ({attendanceCheckedIds.length} Present)
              </label>
              <div className="border border-[#E5DFD3] rounded-xl max-h-56 overflow-y-auto divide-y divide-[#E5DFD3]">
                {beneficiaries
                  .filter((b) => b.batchId === attendanceModalBatch.id)
                  .map((b) => {
                    const isChecked = attendanceCheckedIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setAttendanceCheckedIds((prev) =>
                            isChecked ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                          );
                        }}
                        className="p-2.5 flex items-center justify-between hover:bg-[#F7F4ED] cursor-pointer text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#1C1917]">{b.name}</div>
                          <div className="text-[10px] text-[#8C8479]">{b.primaryTrade}</div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isChecked
                              ? 'bg-[#2E6B4E] text-white'
                              : 'bg-[#EAE6DD] text-[#8C8479]'
                          }`}
                        >
                          {isChecked ? 'Present ✓' : 'Absent ✗'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD3]">
              <button
                type="button"
                onClick={() => setAttendanceModalBatch(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#6B655C] hover:bg-[#EAE6DD]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-5 py-2 rounded-xl bg-[#2E6B4E] text-white text-xs font-semibold hover:bg-[#24563E] transition-colors shadow-2xs"
              >
                Save & Synchronize Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RETURN SURVEY MODAL ─────────────────────────────────────────── */}
      {returnModalSurvey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setReturnModalSurvey(null)}
        >
          <div
            className="w-full max-w-md bg-[#FCFBF8] border border-[#E5DFD3] rounded-2xl p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                Return Survey to Field Officer
              </h3>
              <button
                type="button"
                onClick={() => setReturnModalSurvey(null)}
                className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#6B655C]">
              Return <strong>{returnModalSurvey.beneficiaryName}</strong>'s M6 submission to {returnModalSurvey.fieldOfficer} for physical re-verification.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1C1917]">
                Audit Correction Reason
              </label>
              <textarea
                rows={3}
                value={returnReasonInput}
                onChange={(e) => setReturnReasonInput(e.target.value)}
                placeholder="e.g. Please re-visit with bank passbook stamp to verify sudden revenue jump, or check geofence location..."
                className="w-full p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917] placeholder-[#8C8479] focus:border-[#B91C1C]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReturnModalSurvey(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#6B655C] hover:bg-[#EAE6DD]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturnSurvey}
                className="px-5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] transition-colors shadow-2xs"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RAISE ISSUE MODAL (TWO-SIDED PARTNER ACCOUNTABILITY LOOP) ── */}
      {raiseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setRaiseModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#FCFBF8] border border-[#E5DFD3] rounded-2xl p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#0B4A7D]">
                  Field Escalation Channel
                </span>
                <h3 className="font-narrative text-lg font-normal text-[#1C1917] mt-0.5">
                  Raise Operational Issue to Bajaj CSR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRaiseModalOpen(false)}
                className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#6B655C] leading-relaxed">
              Submit field blockers, government delays, or banking bottlenecks directly to Suman Bajaj. This creates an open ticket in the Bajaj <strong>NGO Health &amp; Trust</strong> console.
            </p>

            <form onSubmit={handleRaiseIssueSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1917]">
                  Category
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917]"
                >
                  <option value="Banking / Escrow">Banking / Escrow &amp; Merchant QR</option>
                  <option value="Government / Permits">Government / Municipal &amp; School Permits</option>
                  <option value="Field Geofencing">Field Telemetry &amp; GPS Geofencing</option>
                  <option value="Curriculum / Equipment">Curriculum / Equipment Delivery</option>
                  <option value="Other">Other Operational Blocker</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1917]">
                  Issue Summary Title
                </label>
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Bank branch manager delaying merchant QR onboarding in Hadapsar"
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1917]">
                  Field Context &amp; Specific Impact
                </label>
                <textarea
                  rows={2}
                  value={issueContext}
                  onChange={(e) => setIssueContext(e.target.value)}
                  placeholder="Explain what is happening on the ground and which cohorts are affected..."
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917] resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1C1917]">
                  Specific Help Needed from Bajaj CSR
                </label>
                <input
                  type="text"
                  value={issueHelpNeeded}
                  onChange={(e) => setIssueHelpNeeded(e.target.value)}
                  placeholder="e.g. Connect Bajaj Corporate Banking team with branch manager"
                  className="w-full p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DFD3]">
                <button
                  type="button"
                  onClick={() => setRaiseModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E5DFD3] text-xs font-medium text-[#6B655C] hover:bg-[#EAE6DD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!issueTitle.trim() || !issueContext.trim() || !issueHelpNeeded.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send to Bajaj CSR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
