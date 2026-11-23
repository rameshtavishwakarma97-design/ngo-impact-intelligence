import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  Send,
  MapPin,
  Unlock,
  Check,
  Filter,
  Inbox,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useImpactStore, getNgoColor } from '../data/impactStore';
import { SonnerToast, type ToastItem } from '../components/SonnerToast';

export const OperationsAudits: React.FC = () => {
  const {
    ngos,
    portfolio,
    auditCases,
    addCaseMessage,
    orderReAudit,
    clearAuditHold,
    approveTranche,
    ngoIssues,
    openIssuesCount,
    resolveNgoIssue,
  } = useImpactStore();

  const [activeTab, setActiveTab] = useState<'audit_cases' | 'tranche_ledger'>('audit_cases');
  const [subTab, setSubTab] = useState<'audit_hold' | 'help_requests' | 'tranche_ledger'>('audit_hold');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('AUD-2025-04');
  const [replyInput, setReplyInput] = useState<string>('');
  const [reAuditModal, setReAuditModal] = useState<boolean>(false);
  const [reAuditInstructions, setReAuditInstructions] = useState<string>(
    'Deploy KPMG 3-person taskforce for 20 physical beneficiary home spot-audits in Kalwa & Mumbra.'
  );
  const [ucFilter, setUcFilter] = useState<'all' | 'pending' | 'flagged' | 'verified'>('all');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [approvingNgoId, setApprovingNgoId] = useState<string | null>(null);

  // 2-Step Ethical Friction Checkboxes
  const [reAuditConfirmed, setReAuditConfirmed] = useState<boolean>(false);
  const [overheadPlanConfirmed, setOverheadPlanConfirmed] = useState<boolean>(false);

  const selectedCase = auditCases.find((c) => c.id === selectedCaseId) || auditCases[0];
  const magicBusNgo = ngos.find((n) => n.ngoId === 'magic-bus');

  // Sorted Worst-First: flagged -> needs_help -> slow_spend -> healthy
  const triageNgos = useMemo(() => {
    const order: Record<string, number> = {
      flagged: 1,
      needs_help: 2,
      slow_spend: 3,
      healthy: 4,
    };
    return [...ngos].sort((a, b) => {
      const scoreA = order[a.healthStatus || 'healthy'] || 5;
      const scoreB = order[b.healthStatus || 'healthy'] || 5;
      return scoreA - scoreB;
    });
  }, [ngos]);

  const showToast = (title: string, desc?: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, title, desc }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const handleSendMessage = () => {
    if (!replyInput.trim() || !selectedCase) return;
    addCaseMessage(
      selectedCase.id,
      'Suman Bajaj',
      'Head of CSR, Bajaj Finserv',
      replyInput.trim(),
      true
    );
    setReplyInput('');
    showToast('Case Note Recorded', 'Official audit response logged to case docket.');
  };

  const handleOrderReAuditConfirm = () => {
    if (!selectedCase) return;
    orderReAudit(selectedCase.id, reAuditInstructions);
    setReAuditModal(false);
    showToast('Independent Spot Re-Audit Ordered', 'KPMG forensic field taskforce dispatched.');
  };

  const handleClearHoldConfirm = () => {
    if (!selectedCase) return;
    clearAuditHold(selectedCase.ngoId, 'Physical registries matched against municipal rolls. ₹35 L unlocked.');
    showToast('Audit Hold Cleared · ₹35 L Unlocked', 'Tranche released to Magic Bus CSR escrow.');
  };

  const handleResolveIssue = (issueId: string, actionNote: string) => {
    resolveNgoIssue(issueId, actionNote);
    showToast('Partner Issue Resolved ✓', actionNote);
  };

  const handleApproveGrantTranche = (ngoId: string, ngoName: string, amountFormatted: string) => {
    setApprovingNgoId(ngoId);
    setTimeout(() => {
      approveTranche(ngoId);
      setApprovingNgoId(null);
      showToast('Tranche Approved', `${amountFormatted} released to ${ngoName} CSR escrow.`);
    }, 320);
  };

  // Filtered UCs
  const filteredNgos = ngos.filter((ngo) => {
    if (ucFilter === 'pending') return ngo.pendingTranche > 0 && !ngo.trancheApproved;
    if (ucFilter === 'flagged') return ngo.auditStatus === 'flagged' || ngo.trancheHeld;
    if (ucFilter === 'verified') return ngo.auditStatus === 'verified' && !ngo.trancheHeld;
    return true;
  });

  return (
    <div className="space-y-6 pb-24 text-[#1C1917]">
      {/* Sonner-Style Action Toasts */}
      <SonnerToast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* ── HEADER BANNER ── */}
      <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#0B4A7D]">
                Statutory Governance & Compliance
              </span>
              <span className="text-xs text-[#8C8479]">·</span>
              <span className="text-xs font-medium text-[#0B4A7D] flex items-center gap-1">
                <ShieldCheck size={14} />
                Independent KPMG Oversight
              </span>
            </div>
            <h1 className="font-narrative text-2xl sm:text-3xl font-normal text-[#1C1917]">
              Operations & Audit Governance Console
            </h1>
            <p className="text-xs text-[#6B655C] mt-1 max-w-2xl leading-relaxed">
              Forensic audit case investigations, GPS-verified attendance logs, and milestone grant tranche release governance under Bajaj CSR Norms 2021.
            </p>
          </div>

          {/* Honest Top KPI Strip matching 6 NGOs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] text-[#1C1917] font-semibold tabular-nums">
              <span className="text-[#8C8479] font-normal mr-1.5">Portfolio Health:</span>
              <span>2 Healthy · 1 Flagged (₹35 L) · 2 Need Help · 1 Slow Spend</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] text-[#2E6B4E] font-semibold tabular-nums">
              <span className="text-[#8C8479] font-normal mr-1.5">Geofence Pass:</span>
              {portfolio.auditGeofenceAvgPct}%
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] text-[#B42318] font-semibold tabular-nums">
              <span className="text-[#8C8479] font-normal mr-1.5">Held in Escrow:</span>
              ₹35 L
            </div>
          </div>
        </div>

        {/* Top-Level Tabs */}
        <div className="flex items-center gap-2 border-t border-[#E5DFD3] pt-4 mt-5">
          <button
            type="button"
            onClick={() => setActiveTab('audit_cases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'audit_cases'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#6B655C] hover:text-[#1C1917] hover:bg-[#EAE6DD]'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Audit Cases & Tranche Governance</span>
            {selectedCase?.status !== 'resolved' && (
              <span className="text-[10px] bg-[#B42318] text-white px-1.5 py-0.2 rounded-full font-bold ml-1">
                1 Case
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tranche_ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tranche_ledger'
                ? 'bg-[#0B4A7D] text-white shadow-2xs'
                : 'text-[#6B655C] hover:text-[#1C1917] hover:bg-[#EAE6DD]'
            }`}
          >
            <FileCheck size={14} />
            <span>Grant Tranches & Utilization Certificates (UCs)</span>
            <span className="text-[10px] bg-black/5 px-1.5 py-0.2 rounded-full font-medium ml-1">
              6 Partners
            </span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: AUDIT CASES & TRANCHE GOVERNANCE (Upgraded with 6-NGO Triage & Help Inbox) ── */}
      {activeTab === 'audit_cases' && (
        <div className="space-y-6">
          {/* ── 1. ALL-6 NGO HEALTH TRIAGE TABLE (Sorted Worst-First) ── */}
          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD3] pb-3">
              <div>
                <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                  NGO Health & Governance Triage
                </h3>
                <p className="text-xs text-[#6B655C]">
                  6 Portfolio Partners ranked worst-first by operational health, spending pace, and field telemetry audit integrity.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#8C8479]">
                Live Status: 2 Healthy · 1 Flagged · 2 Need Help · 1 Slow Spend
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DFD3] bg-[#F7F4ED] text-[#8C8479] text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Partner &amp; Area</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Money Used on Time</th>
                    <th className="py-2.5 px-3">Reached Women vs. Office</th>
                    <th className="py-2.5 px-3">Field Proof</th>
                    <th className="py-2.5 px-3 text-right">Open Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {triageNgos.map((ngo) => {
                    const color = getNgoColor(ngo.ngoId, ngo.district);
                    const partnerIssues = ngoIssues.filter((i) => i.ngoId === ngo.ngoId && i.status === 'open');

                    // Dynamically derive health status (resolving an issue flips needs_help to healthy)
                    let effectiveHealthStatus = ngo.healthStatus;
                    if (ngo.healthStatus === 'needs_help' && partnerIssues.length === 0) {
                      effectiveHealthStatus = 'healthy';
                    }

                    let statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3EC] text-[#2E6B4E] border border-[#2E6B4E]/30 whitespace-nowrap">
                        Healthy ✓
                      </span>
                    );
                    if (effectiveHealthStatus === 'flagged') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCECEB] text-[#B42318] border border-[#B42318]/30 whitespace-nowrap">
                          Flagged · Paused
                        </span>
                      );
                    } else if (effectiveHealthStatus === 'needs_help') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF4E3] text-[#A86414] border border-[#A86414]/30 whitespace-nowrap">
                          Needs Help
                        </span>
                      );
                    } else if (effectiveHealthStatus === 'slow_spend') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF6EE] text-[#B5532A] border border-[#B5532A]/30 whitespace-nowrap">
                          Slow Spend
                        </span>
                      );
                    }

                    // Money Used Text
                    let moneyText = `₹${(ngo.grantDisbursed / 10000000).toFixed(2)} / ₹${(ngo.grantAllocated / 10000000).toFixed(2)} Cr · On Schedule`;
                    let isMoneyOchre = false;
                    let isMoneyCrimson = false;

                    if (ngo.ngoId === 'magic-bus') {
                      moneyText = `₹${(ngo.grantDisbursed / 10000000).toFixed(2)} / ₹${(ngo.grantAllocated / 10000000).toFixed(2)} Cr · ₹35 L Frozen`;
                      isMoneyCrimson = true;
                    } else if (ngo.ngoId === 'educate-girls') {
                      moneyText = `₹${(ngo.grantDisbursed / 10000000).toFixed(2)} / ₹${(ngo.grantAllocated / 10000000).toFixed(2)} Cr · ₹1.0 Cr idle`;
                      isMoneyOchre = true;
                    } else if (ngo.ngoId === 'room-to-read') {
                      moneyText = `₹${(ngo.grantDisbursed / 10000000).toFixed(2)} / ₹${(ngo.grantAllocated / 10000000).toFixed(2)} Cr · ₹1.0 Cr Q4 Pending`;
                    } else if (ngo.ngoId === 'pratham') {
                      const isFull = (ngo.grantDisbursed >= ngo.grantAllocated) || (ngo.grantDisbursed >= 82000000);
                      moneyText = isFull
                        ? `₹${(ngo.grantDisbursed / 10000000).toFixed(2)} / ₹${(ngo.grantAllocated / 10000000).toFixed(2)} Cr · 100% Disbursed`
                        : `₹${(ngo.grantDisbursed / 10000000).toFixed(2)} / ₹${(ngo.grantAllocated / 10000000).toFixed(2)} Cr · Tranche 2 Ready`;
                    } else if (ngo.ngoId === 'goonj') {
                      moneyText = `₹${(ngo.grantDisbursed / 10000000).toFixed(2)} / ₹${(ngo.grantAllocated / 10000000).toFixed(2)} Cr · ₹30 L Reserve Held`;
                    }

                    return (
                      <tr key={ngo.ngoId} className="hover:bg-[#F7F4ED]/50 transition-colors">
                        {/* Partner & Area */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <div>
                              <div className="font-semibold text-[#1C1917]">{ngo.ngoName}</div>
                              <div className="flex items-center gap-1.5 text-[10px] text-[#8C8479]">
                                <span>{ngo.district}</span>
                                <span>·</span>
                                <span className="px-1.5 py-0.2 rounded bg-[#EFECE4] text-[#1C1917] font-medium">
                                  {ngo.areaDifficulty || 'Mid-Size Town'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">{statusBadge}</td>

                        {/* Money Used on Time */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block text-[11px] font-semibold tabular-nums ${
                              isMoneyCrimson
                                ? 'text-[#B42318] bg-[#FCECEB] px-1.5 py-0.5 rounded'
                                : isMoneyOchre
                                ? 'text-[#A86414] bg-[#FDF4E3] px-1.5 py-0.5 rounded'
                                : 'text-[#1C1917]'
                            }`}
                          >
                            {moneyText}
                          </span>
                        </td>

                        {/* Reached Women vs. Office */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-semibold text-[#1C1917]">
                              {ngo.paiseToWomen ?? 85}p to women · {ngo.paiseOffice ?? 15}p office
                            </div>
                            {ngo.ngoId === 'magic-bus' ? (
                              <span className="text-[9px] font-bold text-[#B42318] bg-[#FCECEB] px-1 py-0.2 rounded">
                                High Overhead Alert
                              </span>
                            ) : (
                              <span className="text-[9px] text-[#8C8479]">Efficient delivery</span>
                            )}
                          </div>
                        </td>

                        {/* Field Proof */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {ngo.ngoId === 'magic-bus' ? (
                              <span className="text-[#B42318] font-semibold flex items-center gap-1">
                                <AlertCircle size={13} />
                                {ngo.fieldProofSummary || '142 forms in 1 cyber cafe'}
                              </span>
                            ) : (
                              <span className="text-[#2E6B4E] font-medium flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                {ngo.fieldProofSummary || '99 of 100 real visits ✓'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Open Issues */}
                        <td className="py-3 px-3 text-right">
                          {partnerIssues.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setSubTab('help_requests')}
                              className="px-2 py-0.5 rounded-lg bg-[#FEF6EE] border border-[#A86414]/40 text-[#A86414] hover:bg-[#FDEEDC] text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>{partnerIssues.length} waiting · {partnerIssues[0].waitingDays}d</span>
                              <ArrowRight size={10} />
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#8C8479]">None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 2. SUB-TOGGLE: Red Flags & Audit Hold | Partner Help Requests | Cheques & Receipts ── */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DFD3] pb-3">
            <button
              type="button"
              onClick={() => setSubTab('audit_hold')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'audit_hold'
                  ? 'bg-[#0B4A7D] text-white shadow-2xs'
                  : 'bg-[#FCFBF8] border border-[#E5DFD3] text-[#6B655C] hover:text-[#1C1917]'
              }`}
            >
              <AlertTriangle size={13} />
              <span>Red Flags &amp; Audit Hold (1)</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('help_requests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'help_requests'
                  ? 'bg-[#0B4A7D] text-white shadow-2xs'
                  : 'bg-[#FCFBF8] border border-[#E5DFD3] text-[#6B655C] hover:text-[#1C1917]'
              }`}
            >
              <Inbox size={13} />
              <span>Partner Help Requests ({openIssuesCount})</span>
              {openIssuesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#B5532A] animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSubTab('tranche_ledger')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'tranche_ledger'
                  ? 'bg-[#0B4A7D] text-white shadow-2xs'
                  : 'bg-[#FCFBF8] border border-[#E5DFD3] text-[#6B655C] hover:text-[#1C1917]'
              }`}
            >
              <FileCheck size={13} />
              <span>Cheques &amp; Receipts (6)</span>
            </button>
          </div>

          {/* ── SUB-VIEW A: RED FLAGS & AUDIT HOLD (MAGIC BUS FORENSIC DOCKET WITH 2-STEP FRICTION) ── */}
          {subTab === 'audit_hold' && selectedCase && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Case Dossier & Forensic Findings (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between gap-2 border-b border-[#E5DFD3] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#B42318] bg-[#FCECEB] px-2 py-0.5 rounded">
                          Case #{selectedCase.id}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            selectedCase.status === 'resolved'
                              ? 'bg-[#E8F3EC] text-[#2E6B4E]'
                              : selectedCase.status === 're_audit_ordered'
                              ? 'bg-[#FEF6EE] text-[#A86414]'
                              : 'bg-[#FCECEB] text-[#B42318]'
                          }`}
                        >
                          {selectedCase.status === 'resolved'
                            ? 'Resolved & Cleared ✓'
                            : selectedCase.status === 're_audit_ordered'
                            ? 'Spot Re-Audit Ordered'
                            : 'Under Investigation'}
                        </span>
                      </div>
                      <h3 className="font-narrative text-lg font-normal text-[#1C1917] mt-1.5">
                        {selectedCase.ngoName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#8C8479]">
                        <MapPin size={12} />
                        <span>{selectedCase.location}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#8C8479] tracking-wider block">
                        Held Tranche
                      </span>
                      <div className="text-xl font-semibold text-[#B42318] tabular-nums">
                        ₹35 L
                      </div>
                    </div>
                  </div>

                  {/* Forensic Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-center space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">
                        Audit Score
                      </span>
                      <div className="text-lg font-semibold text-[#B42318] tabular-nums">
                        {magicBusNgo?.auditIntegrityScore ?? 74}/100
                      </div>
                      <span className="text-[10px] text-[#B42318] block">Flagged Caution</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-center space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">
                        GPS Cluster Dups
                      </span>
                      <div className="text-lg font-semibold text-[#B42318] tabular-nums">
                        {selectedCase.flags.gpsAnomaliesCount}
                      </div>
                      <span className="text-[10px] text-[#8C8479] block">Kalwa Hub</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] text-center space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#8C8479] tracking-wider block">
                        Drop-out Rate
                      </span>
                      <div className="text-lg font-semibold text-[#B42318] tabular-nums">
                        {selectedCase.flags.dropoutPct}%
                      </div>
                      <span className="text-[10px] text-[#8C8479] block">Tailoring hubs</span>
                    </div>
                  </div>

                  {/* Forensic Summary */}
                  <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1.5 text-xs">
                    <span className="font-semibold text-[#1C1917] block">
                      Forensic Telemetry Findings:
                    </span>
                    <ul className="space-y-1 text-[#6B655C] text-[11px] list-disc list-inside">
                      <li><strong>142 surveys</strong> mapped within 4 meters of a commercial cyber cafe in Kalwa.</li>
                      <li><strong>89 surveys</strong> recorded duration &lt;45s (indicative of bulk offline entry).</li>
                      <li><strong>8.2% drop-out</strong> in tailoring batches vs 4.8% portfolio average.</li>
                    </ul>
                  </div>

                  {/* Resolution Action Buttons with 2-Step Ethical Friction */}
                  <div className="pt-2 space-y-3 border-t border-[#E5DFD3]">
                    {selectedCase.status !== 'resolved' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setReAuditModal(true)}
                          className="w-full py-2.5 rounded-xl border border-[#A86414] bg-[#FEF6EE] text-[#A86414] text-xs font-semibold hover:bg-[#FDEEDC] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Clock size={14} />
                          <span>Order Independent Spot Re-Audit (KPMG)</span>
                        </button>

                        {/* 2-Step Ethical Friction Checkboxes */}
                        <div className="p-3 rounded-xl bg-[#FEF6EE] border border-[#A86414]/30 space-y-2 text-xs">
                          <span className="text-[10px] uppercase font-bold text-[#A86414] tracking-wider block">
                            2-STEP RELEASE VERIFICATION
                          </span>
                          <label className="flex items-start gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={reAuditConfirmed}
                              onChange={(e) => setReAuditConfirmed(e.target.checked)}
                              className="mt-0.5 rounded border-[#A86414] text-[#0B4A7D] focus:ring-[#0B4A7D] cursor-pointer"
                            />
                            <span className="text-[11px] font-medium text-[#1C1917]">
                              Spot re-audit confirmed real village visits (KPMG signed physical verification log)
                            </span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={overheadPlanConfirmed}
                              onChange={(e) => setOverheadPlanConfirmed(e.target.checked)}
                              className="mt-0.5 rounded border-[#A86414] text-[#0B4A7D] focus:ring-[#0B4A7D] cursor-pointer"
                            />
                            <span className="text-[11px] font-medium text-[#1C1917]">
                              Overhead reduction plan approved (Office overhead capped to ≤ 15p per ₹1 funded)
                            </span>
                          </label>
                        </div>

                        <button
                          type="button"
                          disabled={!reAuditConfirmed || !overheadPlanConfirmed}
                          onClick={handleClearHoldConfirm}
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                            reAuditConfirmed && overheadPlanConfirmed
                              ? 'bg-[#0B4A7D] text-white opacity-100 shadow-md hover:bg-[#083A63] cursor-pointer active:scale-[0.99]'
                              : 'bg-[#0B4A7D]/40 text-white/70 cursor-not-allowed opacity-40'
                          }`}
                        >
                          <Unlock size={14} />
                          <span>Clear Audit Hold &amp; Unlock ₹35 L Tranche</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#E8F3EC] border border-[#2E6B4E]/30 flex items-center gap-2 text-xs text-[#2E6B4E] font-semibold">
                        <CheckCircle2 size={16} />
                        <span>Case Resolved: ₹35 L Tranche Unlocked &amp; Disbursed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Interactive 2-Way Resolution Thread (lg:col-span-7) */}
              <div className="lg:col-span-7 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                  <div>
                    <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                      Forensic Resolution &amp; Compliance Thread
                    </h3>
                    <p className="text-xs text-[#6B655C]">
                      Official dispute dialogue between Bajaj CSR Leadership, KPMG Forensic Lead, and Magic Bus Executive Team.
                    </p>
                  </div>
                  <span className="text-[10px] text-[#8C8479]">Audit Docket Immutable</span>
                </div>

                {/* Message Thread List */}
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  {selectedCase.thread.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        msg.isFunder
                          ? 'bg-[#F7F4ED] border-[#0B4A7D]/30 ml-4 sm:ml-8'
                          : 'bg-white border-[#E5DFD3] mr-4 sm:mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1C1917]">{msg.author}</span>
                          <span className="text-[10px] text-[#8C8479]">({msg.role})</span>
                        </div>
                        <span className="text-[10px] text-[#8C8479] tabular-nums">{msg.timestamp}</span>
                      </div>
                      <p className="text-[#44403C] leading-relaxed text-[11px] whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Reply Input Box */}
                <div className="pt-3 border-t border-[#E5DFD3] space-y-2">
                  <label className="text-[11px] font-semibold text-[#1C1917] block">
                    Post Formal Directive to Magic Bus Docket (as Suman Bajaj)
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder="Enter formal inquiry, condition for tranche release, or evidence request..."
                      className="flex-1 p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917] focus:border-[#0B4A7D] focus:bg-white transition-all resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!replyInput.trim()}
                      className="px-4 rounded-xl bg-[#0B4A7D] text-white hover:bg-[#083A63] transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUB-VIEW B: PARTNER HELP REQUESTS INBOX (TWO-SIDED TICKET RESOLUTION) ── */}
          {subTab === 'help_requests' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3 mb-4">
                  <div>
                    <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                      Partner Help Requests &amp; Field Blockers
                    </h3>
                    <p className="text-xs text-[#6B655C]">
                      Operational bottlenecks escalated directly from NGO field teams to Suman Bajaj for leadership resolution.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FDF4E3] text-[#A86414] border border-[#A86414]/30">
                    {openIssuesCount} Open Tickets
                  </span>
                </div>

                <div className="space-y-3">
                  {ngoIssues.map((issue) => {
                    const ngoColor = getNgoColor(issue.ngoId, issue.district);
                    const isOpen = issue.status === 'open';

                    return (
                      <div
                        key={issue.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isOpen
                            ? 'bg-white border-[#E5DFD3] shadow-2xs'
                            : 'bg-[#F7F4ED]/50 border-[#E5DFD3]/60 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ngoColor }} />
                              <span className="font-semibold text-xs text-[#1C1917]">{issue.ngoName}</span>
                              <span className="text-[10px] text-[#8C8479]">({issue.district})</span>
                              <span className="px-2 py-0.2 rounded-full bg-[#EFECE4] text-[#1C1917] text-[10px] font-medium">
                                {issue.category}
                              </span>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                  isOpen
                                    ? 'bg-[#FDF4E3] text-[#A86414] border border-[#A86414]/30'
                                    : 'bg-[#E8F3EC] text-[#2E6B4E]'
                                }`}
                              >
                                {isOpen ? `${issue.waitingDays}d waiting` : 'Resolved ✓'}
                              </span>
                            </div>

                            <h4 className="font-sans font-bold text-sm text-[#1C1917]">
                              {issue.title}
                            </h4>

                            <p className="text-xs text-[#44403C] leading-relaxed">
                              {issue.details}
                            </p>

                            <div className="text-[11px] text-[#646058] flex items-center gap-1.5 pt-1">
                              <span className="font-semibold text-[#1C1917]">Reported Impact:</span>
                              <span className="text-[#B5532A] font-medium">{issue.impact}</span>
                            </div>

                            {issue.resolutionNote && (
                              <div className="p-2 rounded-lg bg-[#E8F3EC] text-[#2E6B4E] text-[11px] font-medium flex items-center gap-1.5 mt-2">
                                <Check size={13} strokeWidth={2.5} />
                                <span>Resolution Note: {issue.resolutionNote} ({issue.resolvedAt})</span>
                              </div>
                            )}
                          </div>

                          {/* 1-Click Action Buttons */}
                          {isOpen && (
                            <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0">
                              {issue.ngoId === 'smile' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleResolveIssue(
                                      issue.id,
                                      'Bajaj Corporate Banking team connected with Coimbatore HDFC & Canara branch managers.'
                                    )
                                  }
                                  className="px-3.5 py-1.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  Connect Bajaj Banking Team
                                </button>
                              ) : issue.ngoId === 'room-to-read' ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleResolveIssue(
                                      issue.id,
                                      '30-Day milestone extension granted for Nashik Zilla Parishad school library handover.'
                                    )
                                  }
                                  className="px-3.5 py-1.5 rounded-xl bg-[#2E6B4E] text-white text-xs font-semibold hover:bg-[#25573E] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  Approve 30-Day Extension
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleResolveIssue(
                                      issue.id,
                                      'Action confirmed and verified by Suman Bajaj CSR desk.'
                                    )
                                  }
                                  className="px-3.5 py-1.5 rounded-xl bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                                >
                                  Mark Resolved ✓
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── SUB-VIEW C: CHEQUES & RECEIPTS (EXACT EXISTING LEDGER INTACT) ── */}
          {subTab === 'tranche_ledger' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3]">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-[#8C8479]" />
                  <span className="text-xs font-semibold text-[#1C1917]">Filter Portfolio Grants:</span>
                  <div className="flex items-center gap-1.5">
                    {(['all', 'pending', 'flagged', 'verified'] as const).map((filterKey) => (
                      <button
                        key={filterKey}
                        type="button"
                        onClick={() => setUcFilter(filterKey)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                          ucFilter === filterKey
                            ? 'bg-[#0B4A7D] text-white shadow-2xs'
                            : 'text-[#6B655C] hover:bg-[#EAE6DD]'
                        }`}
                      >
                        {filterKey}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs text-[#8C8479]">
                  Showing {filteredNgos.length} of {ngos.length} CSR partner grants
                </span>
              </div>

              {/* Governance Ledger Table */}
              <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] overflow-hidden shadow-xs">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5DFD3] bg-[#F7F4ED] text-[#8C8479] text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">NGO Partner &amp; Geography</th>
                        <th className="py-3 px-4">Programme</th>
                        <th className="py-3 px-4 text-right">Committed</th>
                        <th className="py-3 px-4 text-right">Disbursed</th>
                        <th className="py-3 px-4 text-center">Audit Score</th>
                        <th className="py-3 px-4">UC Audit Status</th>
                        <th className="py-3 px-4">Next Milestone Gate</th>
                        <th className="py-3 px-4 text-right">Tranche Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD3]">
                      {filteredNgos.map((ngo) => {
                        const isHeld = ngo.trancheHeld || (ngo.ngoId === 'magic-bus' && selectedCase?.status !== 'resolved');
                        const isFullyDisbursed = ngo.pendingTranche === 0;

                        return (
                          <tr key={ngo.ngoId} className="hover:bg-[#F7F4ED]/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-[#1C1917]">{ngo.ngoName}</div>
                              <div className="text-[10px] text-[#8C8479]">{ngo.district}, {ngo.state}</div>
                            </td>

                            <td className="py-3.5 px-4 text-[11px] text-[#6B655C]">
                              {ngo.program === 'micro-skilling' ? 'Micro-Skilling' : "Women's Literacy"}
                            </td>

                            <td className="py-3.5 px-4 text-right font-semibold text-[#1C1917] tabular-nums">
                              ₹{(ngo.grantAllocated / 10000000).toFixed(2)} Cr
                            </td>

                            <td className="py-3.5 px-4 text-right font-semibold text-[#0B4A7D] tabular-nums">
                              ₹{(ngo.grantDisbursed / 10000000).toFixed(2)} Cr
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                                  ngo.auditIntegrityScore >= 90
                                    ? 'bg-[#E8F3EC] text-[#2E6B4E]'
                                    : ngo.auditIntegrityScore >= 80
                                    ? 'bg-[#FEF6EE] text-[#A86414]'
                                    : 'bg-[#FCECEB] text-[#B42318]'
                                }`}
                              >
                                {ngo.auditIntegrityScore}/100
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {isHeld ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42318]">
                                  <AlertTriangle size={12} />
                                  Audit Hold (#AUD-2025-04)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E6B4E]">
                                  <CheckCircle2 size={12} />
                                  CA-Audited UC Verified
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-[11px] text-[#6B655C]">
                              {ngo.pendingTrancheAction}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              {isHeld ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSubTab('audit_hold');
                                    setSelectedCaseId('AUD-2025-04');
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-[#FCECEB] border border-[#B42318] text-[#B42318] text-[11px] font-semibold hover:bg-[#B42318] hover:text-white transition-all cursor-pointer whitespace-nowrap"
                                >
                                  Review Hold
                                </button>
                              ) : ngo.pendingTranche === 0 && ngo.grantAllocated > ngo.grantDisbursed ? (
                                <span className="text-[11px] font-semibold text-[#8C8479] whitespace-nowrap">
                                  ₹{((ngo.grantAllocated - ngo.grantDisbursed) / 100000).toFixed(0)} L Reserve Held
                                </span>
                              ) : isFullyDisbursed ? (
                                <span className="text-[11px] font-semibold text-[#2E6B4E] flex items-center justify-end gap-1 whitespace-nowrap">
                                  <Check size={12} /> 100% Disbursed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={approvingNgoId === ngo.ngoId}
                                  onClick={() =>
                                    handleApproveGrantTranche(
                                      ngo.ngoId,
                                      ngo.ngoName,
                                      ngo.pendingTranche >= 10000000
                                        ? `₹${(ngo.pendingTranche / 10000000).toFixed(1)} Cr`
                                        : `₹${(ngo.pendingTranche / 100000).toFixed(0)} L`
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-md bg-[#0B4A7D] text-white text-[11px] font-semibold hover:bg-[#083A63] transition-transform duration-100 active:scale-[0.98] shadow-2xs cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 flex items-center justify-end gap-1 ml-auto"
                                >
                                  {approvingNgoId === ngo.ngoId ? (
                                    <>
                                      <div className="w-2.5 h-2.5 border-1.5 border-white border-t-transparent rounded-full animate-spin" />
                                      <span>Releasing...</span>
                                    </>
                                  ) : (
                                    <>
                                      Approve{' '}
                                      {ngo.pendingTranche >= 10000000
                                        ? `₹${(ngo.pendingTranche / 10000000).toFixed(1)} Cr`
                                        : `₹${(ngo.pendingTranche / 100000).toFixed(0)} L`}
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Scannable Cards View for Mobile (< md) */}
                <div className="md:hidden divide-y divide-[#E5DFD3]">
                  {filteredNgos.map((ngo) => {
                    const isHeld = ngo.trancheHeld || (ngo.ngoId === 'magic-bus' && selectedCase?.status !== 'resolved');
                    const isFullyDisbursed = ngo.pendingTranche === 0;

                    return (
                      <div key={ngo.ngoId} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-sm text-[#1C1917]">{ngo.ngoName}</div>
                            <div className="text-[10px] text-[#8C8479]">{ngo.district}, {ngo.state}</div>
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                              ngo.auditIntegrityScore >= 90
                                ? 'bg-[#E8F3EC] text-[#2E6B4E]'
                                : ngo.auditIntegrityScore >= 80
                                ? 'bg-[#FEF6EE] text-[#A86414]'
                                : 'bg-[#FCECEB] text-[#B42318]'
                            }`}
                          >
                            {ngo.auditIntegrityScore}/100 Audit
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E5DFD3]/60">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#8C8479] block">Programme</span>
                            <span className="text-xs text-[#6B655C]">
                              {ngo.program === 'micro-skilling' ? 'Micro-Skilling' : "Women's Literacy"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#8C8479] block">Committed / Disbursed</span>
                            <span className="font-semibold text-[#1C1917] tabular-nums">
                              ₹{(ngo.grantAllocated / 10000000).toFixed(2)} Cr
                            </span>
                            <span className="text-[10px] text-[#0B4A7D] block font-semibold">
                              ₹{(ngo.grantDisbursed / 10000000).toFixed(2)} Cr disbursed
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs pt-1 border-t border-[#E5DFD3]/60">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-[#8C8479]">UC Audit Status</span>
                            {isHeld ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42318]">
                                <AlertTriangle size={12} />
                                Audit Hold (#AUD-2025-04)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E6B4E]">
                                <CheckCircle2 size={12} />
                                CA-Audited UC Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[#6B655C]">
                            <span>Milestone:</span>
                            <span>{ngo.pendingTrancheAction}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E5DFD3]/60 flex justify-end">
                          {isHeld ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSubTab('audit_hold');
                                setSelectedCaseId('AUD-2025-04');
                              }}
                              className="w-full sm:w-auto px-3 py-1.5 rounded-md bg-[#FCECEB] border border-[#B42318] text-[#B42318] text-xs font-semibold hover:bg-[#B42318] hover:text-white transition-all cursor-pointer text-center"
                            >
                              Review Hold
                            </button>
                          ) : ngo.pendingTranche === 0 && ngo.grantAllocated > ngo.grantDisbursed ? (
                            <span className="text-xs font-semibold text-[#8C8479]">
                              ₹{((ngo.grantAllocated - ngo.grantDisbursed) / 100000).toFixed(0)} L Reserve Held
                            </span>
                          ) : isFullyDisbursed ? (
                            <span className="text-xs font-semibold text-[#2E6B4E] flex items-center gap-1">
                              <Check size={14} /> 100% Disbursed
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={approvingNgoId === ngo.ngoId}
                              onClick={() =>
                                handleApproveGrantTranche(
                                  ngo.ngoId,
                                  ngo.ngoName,
                                  ngo.pendingTranche >= 10000000
                                    ? `₹${(ngo.pendingTranche / 10000000).toFixed(1)} Cr`
                                    : `₹${(ngo.pendingTranche / 100000).toFixed(0)} L`
                                )
                              }
                              className="w-full sm:w-auto px-4 py-1.5 rounded-md bg-[#0B4A7D] text-white text-xs font-semibold hover:bg-[#083A63] transition-transform duration-100 active:scale-[0.98] shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 flex items-center justify-center gap-1"
                            >
                              {approvingNgoId === ngo.ngoId ? (
                                <>
                                  <div className="w-3 h-3 border-1.5 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Releasing...</span>
                                </>
                              ) : (
                                <>
                                  Approve{' '}
                                  {ngo.pendingTranche >= 10000000
                                    ? `₹${(ngo.pendingTranche / 10000000).toFixed(1)} Cr`
                                    : `₹${(ngo.pendingTranche / 100000).toFixed(0)} L`}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: GRANT TRANCHES & UTILIZATION CERTIFICATES (DIRECT TAB ACCESS) ── */}
      {activeTab === 'tranche_ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3]">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#8C8479]" />
              <span className="text-xs font-semibold text-[#1C1917]">Filter Portfolio Grants:</span>
              <div className="flex items-center gap-1.5">
                {(['all', 'pending', 'flagged', 'verified'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setUcFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                      ucFilter === filterKey
                        ? 'bg-[#0B4A7D] text-white shadow-2xs'
                        : 'text-[#6B655C] hover:bg-[#EAE6DD]'
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-[#8C8479]">
              Showing {filteredNgos.length} of {ngos.length} CSR partner grants
            </span>
          </div>

          <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] overflow-hidden shadow-xs">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DFD3] bg-[#F7F4ED] text-[#8C8479] text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">NGO Partner &amp; Geography</th>
                    <th className="py-3 px-4">Programme</th>
                    <th className="py-3 px-4 text-right">Committed</th>
                    <th className="py-3 px-4 text-right">Disbursed</th>
                    <th className="py-3 px-4 text-center">Audit Score</th>
                    <th className="py-3 px-4">UC Audit Status</th>
                    <th className="py-3 px-4">Next Milestone Gate</th>
                    <th className="py-3 px-4 text-right">Tranche Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3]">
                  {filteredNgos.map((ngo) => {
                    const isHeld = ngo.trancheHeld || (ngo.ngoId === 'magic-bus' && selectedCase?.status !== 'resolved');
                    const isFullyDisbursed = ngo.pendingTranche === 0;

                    return (
                      <tr key={ngo.ngoId} className="hover:bg-[#F7F4ED]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#1C1917]">{ngo.ngoName}</div>
                          <div className="text-[10px] text-[#8C8479]">{ngo.district}, {ngo.state}</div>
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-[#6B655C]">
                          {ngo.program === 'micro-skilling' ? 'Micro-Skilling' : "Women's Literacy"}
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold text-[#1C1917] tabular-nums">
                          ₹{(ngo.grantAllocated / 10000000).toFixed(2)} Cr
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold text-[#0B4A7D] tabular-nums">
                          ₹{(ngo.grantDisbursed / 10000000).toFixed(2)} Cr
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                              ngo.auditIntegrityScore >= 90
                                ? 'bg-[#E8F3EC] text-[#2E6B4E]'
                                : ngo.auditIntegrityScore >= 80
                                ? 'bg-[#FEF6EE] text-[#A86414]'
                                : 'bg-[#FCECEB] text-[#B42318]'
                            }`}
                          >
                            {ngo.auditIntegrityScore}/100
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isHeld ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42318]">
                              <AlertTriangle size={12} />
                              Audit Hold (#AUD-2025-04)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E6B4E]">
                              <CheckCircle2 size={12} />
                              CA-Audited UC Verified
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-[#6B655C]">
                          {ngo.pendingTrancheAction}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isHeld ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('audit_cases');
                                setSubTab('audit_hold');
                                setSelectedCaseId('AUD-2025-04');
                              }}
                              className="px-2.5 py-1 rounded-md bg-[#FCECEB] border border-[#B42318] text-[#B42318] text-[11px] font-semibold hover:bg-[#B42318] hover:text-white transition-all cursor-pointer whitespace-nowrap"
                            >
                              Review Hold
                            </button>
                          ) : ngo.pendingTranche === 0 && ngo.grantAllocated > ngo.grantDisbursed ? (
                            <span className="text-[11px] font-semibold text-[#8C8479] whitespace-nowrap">
                              ₹{((ngo.grantAllocated - ngo.grantDisbursed) / 100000).toFixed(0)} L Reserve Held
                            </span>
                          ) : isFullyDisbursed ? (
                            <span className="text-[11px] font-semibold text-[#2E6B4E] flex items-center justify-end gap-1 whitespace-nowrap">
                              <Check size={12} /> 100% Disbursed
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={approvingNgoId === ngo.ngoId}
                              onClick={() =>
                                handleApproveGrantTranche(
                                  ngo.ngoId,
                                  ngo.ngoName,
                                  ngo.pendingTranche >= 10000000
                                    ? `₹${(ngo.pendingTranche / 10000000).toFixed(1)} Cr`
                                    : `₹${(ngo.pendingTranche / 100000).toFixed(0)} L`
                                )
                              }
                              className="px-2.5 py-1 rounded-md bg-[#0B4A7D] text-white text-[11px] font-semibold hover:bg-[#083A63] transition-transform duration-100 active:scale-[0.98] shadow-2xs cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#0B4A7D]/25 flex items-center justify-end gap-1 ml-auto"
                            >
                              {approvingNgoId === ngo.ngoId ? (
                                <>
                                  <div className="w-2.5 h-2.5 border-1.5 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Releasing...</span>
                                </>
                              ) : (
                                <>
                                  Approve{' '}
                                  {ngo.pendingTranche >= 10000000
                                    ? `₹${(ngo.pendingTranche / 10000000).toFixed(1)} Cr`
                                    : `₹${(ngo.pendingTranche / 100000).toFixed(0)} L`}
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ORDER RE-AUDIT ── */}
      {reAuditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setReAuditModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#FCFBF8] border border-[#E5DFD3] rounded-2xl p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                Commission Independent KPMG Spot Re-Audit
              </h3>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Orders unannounced physical home visits to 20 sampled beneficiaries in Kalwa &amp; Mumbra.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C1917]">
                Forensic Scope &amp; Terms of Reference
              </label>
              <textarea
                rows={3}
                value={reAuditInstructions}
                onChange={(e) => setReAuditInstructions(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReAuditModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[#E5DFD3] text-xs font-medium text-[#6B655C] hover:bg-[#EAE6DD]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOrderReAuditConfirm}
                className="px-4 py-1.5 rounded-lg bg-[#B45309] text-white text-xs font-semibold hover:bg-[#92400E] shadow-2xs"
              >
                Dispatch KPMG Taskforce
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
