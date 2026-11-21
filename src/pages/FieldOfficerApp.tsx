import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Calendar,
  CheckSquare,
  FileText,
  MapPin,
  AlertTriangle,
  Check,
  PhoneCall,
  Send,
  Database,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { useImpactStore } from '../data/impactStore';
import { SonnerToast, type ToastItem } from '../components/SonnerToast';

type Lang = 'en' | 'hi' | 'mr';

interface LocalQueuedSurvey {
  beneficiaryId: string;
  beneficiaryName: string;
  calculatedProfit: number;
  daysWorkedWeekly: number;
  goodDayRevenue: number;
  slowDayRevenue: number;
  weeklyInputCost: number;
  upiReceiptsCount: '0' | '1–5' | '6–20' | '20+';
  resilienceSource: string;
  durationSeconds: number;
  anomalyNote?: string;
  timestamp: number;
}

const I18N = {
  en: {
    title: 'Field Officer App',
    officer: 'Mithun K. · Pune Urban & Peri-Urban Cluster',
    online: 'Online',
    offline: 'Offline Cache',
    todayTab: 'Today',
    attendanceTab: 'Attendance',
    surveyTab: 'M6 Survey',
    scheduledClasses: "Today's Schedule",
    homeVisits: 'Assigned Home Visits',
    surveysDue: 'M6 Surveys Due',
    selectBatch: 'Select Cohort Batch',
    topicTaught: 'Curriculum Topic Taught',
    present: 'Present',
    absent: 'Absent',
    saveAttendance: 'Save Attendance',
    selectBeneficiary: 'Select Beneficiary',
    lockedBaseline: 'Locked Baseline Income (M0)',
    daysEarned: 'Days worked in last 7 days',
    goodDay: 'Typical Good Day Revenue (₹)',
    slowDay: 'Typical Slow Day Revenue (₹)',
    weeklyCost: 'Weekly Business Expense (₹)',
    calculatedProfit: 'Estimated Monthly Net Profit',
    upiReceipts: 'UPI Transactions (Last 30 Days)',
    resilience: '₹3,000 Emergency Buffer Source',
    gpsLocked: 'GPS Geofence Locked',
    submitToTL: 'Submit to Team Leader',
    highJumpAlert: 'Unusually High Income Jump (>200%): Mandatory audit justification note required.',
    highJumpNotePlaceholder: 'Explain unusual spike (e.g., bulk wedding order, festive season demand, new machine output)...',
    pipelineTitle: 'Live Data Pipeline Architecture',
  },
  hi: {
    title: 'फ़ील्ड ऑफिसर ऐप',
    officer: 'मिथुन के. · पुणे क्लस्टर',
    online: 'ऑनलाइन',
    offline: 'ऑफ़लाइन कैश',
    todayTab: 'आज',
    attendanceTab: 'उपस्थिति',
    surveyTab: 'M6 सर्वे',
    scheduledClasses: 'आज का कार्यक्रम',
    homeVisits: 'आवंटित गृह भेंट (होम विजिट)',
    surveysDue: 'M6 सर्वे देय',
    selectBatch: 'बैच चुनें',
    topicTaught: 'सिखाया गया मॉड्यूल',
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    saveAttendance: 'उपस्थिति दर्ज करें',
    selectBeneficiary: 'लाभार्थी महिला चुनें',
    lockedBaseline: 'आधारभूत आय (M0 बेसलाइन)',
    daysEarned: 'पिछले 7 दिनों में काम के दिन',
    goodDay: 'अच्छे दिन की सामान्य बिक्री (₹)',
    slowDay: 'मंदे दिन की सामान्य बिक्री (₹)',
    weeklyCost: 'साप्ताहिक कच्चा माल खर्च (₹)',
    calculatedProfit: 'अनुमानित मासिक शुद्ध लाभ',
    upiReceipts: 'यूपीआई लेनदेन (पिछले 30 दिन)',
    resilience: '₹3,000 आपातकालीन निधि स्रोत',
    gpsLocked: 'जीपीएस जियोफेंस सत्यापित',
    submitToTL: 'टीम लीडर को भेजें',
    highJumpAlert: 'असामान्य आय वृद्धि (>200%): अनिवार्य ऑडिट स्पष्टीकरण टिप्पणी दर्ज करें।',
    highJumpNotePlaceholder: 'असामान्य आय वृद्धि का कारण बताएं (उदा. शादी का थोक आर्डर, त्योहारी बिक्री)...',
    pipelineTitle: 'लाइव डेटा पाइपलाइन आर्किटेक्चर',
  },
  mr: {
    title: 'फील्ड ऑफिसर ॲप',
    officer: 'मिथुन के. · पुणे क्लस्टर',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन कॅश',
    todayTab: 'आज',
    attendanceTab: 'हजेरी',
    surveyTab: 'M6 सर्वेक्षण',
    scheduledClasses: 'आजचे वेळापत्रक',
    homeVisits: 'नेमून दिलेल्या गृहभेटी',
    surveysDue: 'M6 सर्वेक्षण प्रलंबित',
    selectBatch: 'बॅच निवडा',
    topicTaught: 'शिकवलेला अभ्यासक्रम',
    present: 'हजर',
    absent: 'गैरहजर',
    saveAttendance: 'हजेरी नोंदवा',
    selectBeneficiary: 'महिला लाभार्थी निवडा',
    lockedBaseline: 'पायाभूत मासिक उत्पन्न (M0)',
    daysEarned: 'मागील ७ दिवसांत काम केलेले दिवस',
    goodDay: 'चांगल्या दिवसाची सरासरी कमाई (₹)',
    slowDay: 'कमी कमाईच्या दिवसाची कमाई (₹)',
    weeklyCost: 'साप्ताहिक कच्चा माल खर्च (₹)',
    calculatedProfit: 'अंदाजे मासिक निव्वळ नफा',
    upiReceipts: 'UPI व्यवहार (गेल्या ३० दिवसांत)',
    resilience: '₹३,००० आणीबाणी निधी स्रोत',
    gpsLocked: 'GPS जिओफेन्स प्रमाणित',
    submitToTL: 'टीम लीडरकडे पाठवा',
    highJumpAlert: 'उत्पन्नात अचानक मोठी वाढ (>२००%): अनिवार्य ऑडिट स्पष्टीकरण नोंदवा.',
    highJumpNotePlaceholder: 'उत्पन्नवाढीचे कारण स्पष्ट करा (उदा. लग्नसराईची घाऊक मागणी, सणासुदीची विक्री)...',
    pipelineTitle: 'थेट डेटा पाइपलाइन रचना',
  },
};

export const FieldOfficerApp: React.FC = () => {
  const {
    batches,
    beneficiaries,
    markBatchAttendance,
    submitFieldSurvey,
  } = useImpactStore();

  const [lang, setLang] = useState<Lang>('en');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'today' | 'attendance' | 'survey'>('today');
  const [pipelineSheetOpen, setPipelineSheetOpen] = useState<boolean>(false);

  // Offline local queue simulation
  const [localQueue, setLocalQueue] = useState<LocalQueuedSurvey[]>([]);
  const [flushingQueue, setFlushingQueue] = useState<boolean>(false);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  // Attendance tab state
  const [selectedBatchId, setSelectedBatchId] = useState<string>('BATCH-PN-01');
  const [topicInput, setTopicInput] = useState<string>('Module 8: UPI QR & Daily Bookkeeping');
  const [presentBeneficiaryIds, setPresentBeneficiaryIds] = useState<string[]>([]);

  // Survey tab state
  const [surveyBenId, setSurveyBenId] = useState<string>('BEN-004'); // default to Rekha Jadhav
  const [daysWorked, setDaysWorked] = useState<number>(6);
  const [goodDayRev, setGoodDayRev] = useState<number>(550);
  const [slowDayRev, setSlowDayRev] = useState<number>(250);
  const [weeklyCost, setWeeklyCost] = useState<number>(600);
  const [upiCount, setUpiCount] = useState<'0' | '1–5' | '6–20' | '20+'>('20+');
  const [resilienceSource, setResilienceSource] = useState<string>('Personal savings');
  const [anomalyNoteInput, setAnomalyNoteInput] = useState<string>('');
  const [surveyStartTime] = useState<number>(Date.now());

  // Stacked Toast
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (title: string, desc?: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, title, desc }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const t = I18N[lang];

  // Current batch
  const currentBatch = useMemo(() => {
    return batches.find((b) => b.id === selectedBatchId) || batches[0];
  }, [batches, selectedBatchId]);

  // Beneficiaries in current batch
  const batchBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => b.batchId === currentBatch.id);
  }, [beneficiaries, currentBatch]);

  // Initialize attendance with all batch members
  useEffect(() => {
    if (batchBeneficiaries.length > 0) {
      setPresentBeneficiaryIds(batchBeneficiaries.map((b) => b.id));
    }
  }, [selectedBatchId, batchBeneficiaries.length]);

  // Selected survey beneficiary
  const currentSurveyBen = useMemo(() => {
    return beneficiaries.find((b) => b.id === surveyBenId) || beneficiaries[0];
  }, [beneficiaries, surveyBenId]);

  // Triangulated Monthly Profit Calculation
  // Formula: (Good Days * Good Revenue + Slow Days * Slow Revenue) * 4.3 - (Weekly Expense * 4.3)
  const calculatedMonthlyProfit = useMemo(() => {
    const slowDays = Math.max(0, daysWorked - Math.min(daysWorked, 3));
    const goodDays = daysWorked - slowDays;
    const weeklyGross = goodDays * goodDayRev + slowDays * slowDayRev;
    const weeklyNet = Math.max(0, weeklyGross - weeklyCost);
    return Math.round(weeklyNet * 4.3);
  }, [daysWorked, goodDayRev, slowDayRev, weeklyCost]);

  // Jump % over baseline
  const profitJumpPct = useMemo(() => {
    if (!currentSurveyBen) return 0;
    const diff = calculatedMonthlyProfit - currentSurveyBen.m0BaselineIncome;
    return Number(((diff / currentSurveyBen.m0BaselineIncome) * 100).toFixed(1));
  }, [calculatedMonthlyProfit, currentSurveyBen]);

  const hasHighJump = profitJumpPct > 200;

  // Handle Online Toggle & Flush Local Queue with 450ms Morph
  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);

    if (nextState && localQueue.length > 0) {
      setFlushingQueue(true);
      setTimeout(() => {
        // Reconnected! Flush queue to store
        localQueue.forEach((item) => {
          submitFieldSurvey(item.beneficiaryId, {
            daysWorkedWeekly: item.daysWorkedWeekly,
            goodDayRevenue: item.goodDayRevenue,
            slowDayRevenue: item.slowDayRevenue,
            weeklyInputCost: item.weeklyInputCost,
            calculatedProfit: item.calculatedProfit,
            upiReceiptsCount: item.upiReceiptsCount,
            resilienceSource: item.resilienceSource,
            durationSeconds: item.durationSeconds,
            anomalyNote: item.anomalyNote,
          });
        });
        showToast(
          'Online Connection Restored',
          `Flushed ${localQueue.length} queued surveys to Pratham Team Leader QA Queue.`
        );
        setLocalQueue([]);
        setFlushingQueue(false);
      }, 450);
    } else if (!nextState) {
      showToast('Offline Mode Activated', 'Submissions will store in local SQLite cache until reconnect.');
    }
  };

  // Save Attendance Handler
  const handleSaveAttendance = () => {
    markBatchAttendance(currentBatch.id, presentBeneficiaryIds, topicInput);
    showToast(
      'Attendance Synchronized',
      `${presentBeneficiaryIds.length}/${currentBatch.enrolledCount} women marked present. Synced to Team Leader console.`
    );
  };

  // Submit Survey Handler with Stateful 320ms Morph
  const handleSubmitSurvey = () => {
    if (!currentSurveyBen || submitState !== 'idle') return;
    const durationSeconds = Math.max(75, Math.floor((Date.now() - surveyStartTime) / 1000));

    if (hasHighJump && !anomalyNoteInput.trim()) {
      showToast('Audit Note Mandatory', 'Please explain the unusual income jump (>200%) before submitting.');
      return;
    }

    setSubmitState('submitting');

    setTimeout(() => {
      if (!isOnline) {
        // Offline mode: push to local queue
        const queuedItem: LocalQueuedSurvey = {
          beneficiaryId: currentSurveyBen.id,
          beneficiaryName: currentSurveyBen.name,
          calculatedProfit: calculatedMonthlyProfit,
          daysWorkedWeekly: daysWorked,
          goodDayRevenue: goodDayRev,
          slowDayRevenue: slowDayRev,
          weeklyInputCost: weeklyCost,
          upiReceiptsCount: upiCount,
          resilienceSource,
          durationSeconds,
          anomalyNote: anomalyNoteInput.trim() || undefined,
          timestamp: Date.now(),
        };
        setLocalQueue((prev) => [...prev, queuedItem]);
        showToast('Cached Locally (Offline)', `Survey for ${currentSurveyBen.name} saved to SQLite queue. Will sync when online.`);
      } else {
        // Online mode: submit directly
        submitFieldSurvey(currentSurveyBen.id, {
          daysWorkedWeekly: daysWorked,
          goodDayRevenue: goodDayRev,
          slowDayRevenue: slowDayRev,
          weeklyInputCost: weeklyCost,
          calculatedProfit: calculatedMonthlyProfit,
          upiReceiptsCount: upiCount,
          resilienceSource,
          durationSeconds,
          anomalyNote: anomalyNoteInput.trim() || undefined,
        });
        showToast(
          'Survey Submitted to Team Leader',
          `M6 record for ${currentSurveyBen.name} (+₹${(calculatedMonthlyProfit - currentSurveyBen.m0BaselineIncome).toLocaleString('en-IN')}) queued in QA.`
        );
      }

      setSubmitState('submitted');
      setAnomalyNoteInput('');

      setTimeout(() => {
        setSubmitState('idle');
      }, 1500);
    }, 320);
  };

  // Home visits assigned from Team Leader
  const assignedHomeVisits = useMemo(() => {
    return beneficiaries.filter((b) => b.homeVisitScheduled);
  }, [beneficiaries]);

  return (
    <div className="flex flex-col xl:flex-row items-start justify-center gap-8 pb-16">
      {/* ── PHONE SHELL CONTAINER (Desktop: 390px Mobile Frame · Mobile: Native Full-Bleed) ── */}
      <div className="w-full md:max-w-[390px] mx-auto xl:mx-0 md:bg-[#1E293B] md:p-3 md:rounded-[40px] md:shadow-2xl md:border-4 md:border-[#334155] flex-shrink-0">
        {/* Device Bezel & Screen Wrapper */}
        <div className="w-full bg-[#FCFBF8] rounded-2xl md:rounded-[32px] overflow-hidden flex flex-col min-h-[calc(100dvh-5rem)] md:h-[780px] border border-[#E5DFD3] text-[#1C1917]">
          {/* Mobile Top Status Bar (Desktop only: Time, Notch, Battery) */}
          <div className="hidden md:flex h-6 bg-[#EFECE4] px-5 items-center justify-between text-[11px] font-semibold text-[#6B655C] border-b border-[#E5DFD3]/80 select-none">
            <span>09:41</span>
            <div className="w-16 h-3 bg-[#1C1917] rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-[10px]">
              {isOnline ? <Wifi size={11} className="text-[#2E6B4E]" /> : <WifiOff size={11} className="text-[#B42318]" />}
              <span>100%</span>
            </div>
          </div>

          {/* App Header (Officer Profile + Online/Offline + Language + Mobile Pipeline Sheet Trigger) */}
          <div className="p-3.5 bg-[#F7F4ED] border-b border-[#E5DFD3] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E6B4E]">
                    {t.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPipelineSheetOpen(true)}
                    className="md:hidden flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E7F0F7] border border-[#0B4A7D]/20 text-[#0B4A7D] text-[10px] font-bold cursor-pointer"
                  >
                    <Sparkles size={10} />
                    <span>Pipeline ▾</span>
                  </button>
                </div>
                <h2 className="text-xs font-semibold text-[#1C1917] truncate">
                  {t.officer}
                </h2>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-[#EAE6DD] p-0.5 rounded-lg text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-1.5 py-0.5 rounded ${lang === 'en' ? 'bg-white text-[#2E6B4E] shadow-2xs' : 'text-[#8C8479]'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`px-1.5 py-0.5 rounded ${lang === 'hi' ? 'bg-white text-[#2E6B4E] shadow-2xs' : 'text-[#8C8479]'}`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setLang('mr')}
                  className={`px-1.5 py-0.5 rounded ${lang === 'mr' ? 'bg-white text-[#2E6B4E] shadow-2xs' : 'text-[#8C8479]'}`}
                >
                  मराठी
                </button>
              </div>
            </div>

            {/* Online / Offline Cache Toggle Bar */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleToggleOnline}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform duration-100 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2E6B4E]/25 ${
                  isOnline
                    ? 'bg-[#E8F3EC] text-[#2E6B4E] border border-[#2E6B4E]/30'
                    : 'bg-[#FCECEB] text-[#B42318] border border-[#B42318]/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#2E6B4E] animate-pulse' : 'bg-[#B42318]'}`} />
                <span>{isOnline ? t.online : t.offline}</span>
              </button>

              <AnimatePresence mode="wait">
                {flushingQueue ? (
                  <motion.span
                    key="flushing"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px] font-bold text-[#2E6B4E] bg-[#E8F3EC] px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  >
                    <div className="w-2.5 h-2.5 border-2 border-[#2E6B4E] border-t-transparent rounded-full animate-spin" />
                    <span>Flushing local queue → Synced ✓</span>
                  </motion.span>
                ) : localQueue.length > 0 ? (
                  <motion.span
                    key="queued"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px] font-semibold text-[#A86414] bg-[#FEF6EE] px-2 py-0.5 rounded-full border border-[#A86414]/30 flex items-center gap-1"
                  >
                    <Database size={10} />
                    <span>{localQueue.length} Pending Local Sync</span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Offline Warning Banner */}
          {!isOnline && (
            <div className="bg-[#FEF6EE] px-3.5 py-1.5 border-b border-[#A86414]/30 flex items-center justify-between text-[10px] text-[#A86414]">
              <span className="flex items-center gap-1">
                <WifiOff size={11} /> Offline: storing in SQLite local cache
              </span>
              <span className="font-bold">{localQueue.length} queued</span>
            </div>
          )}

          {/* Mobile Screen Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ── TAB 1: TODAY ── */}
            {mobileTab === 'today' && (
              <div className="space-y-4">
                {/* Scheduled Class Card */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FCFBF8] p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E6B4E]">
                      {t.scheduledClasses}
                    </span>
                    <span className="text-[10px] text-[#8C8479]">10:00 AM Today</span>
                  </div>
                  <h3 className="text-xs font-semibold text-[#1C1917]">
                    {currentBatch.name}
                  </h3>
                  <p className="text-[11px] text-[#6B655C] flex items-center gap-1">
                    <MapPin size={11} className="text-[#8C8479]" /> {currentBatch.ward}
                  </p>
                  <div className="pt-2 border-t border-[#E5DFD3] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#8C8479]">{currentBatch.currentModule}</span>
                    <button
                      type="button"
                      onClick={() => setMobileTab('attendance')}
                      className="px-2.5 py-1 rounded-lg bg-[#2E6B4E] text-white text-[11px] font-semibold"
                    >
                      Take Attendance →
                    </button>
                  </div>
                </div>

                {/* Assigned Home Visits (Dispatched from ERP) */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FCFBF8] p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B91C1C] flex items-center gap-1">
                      <PhoneCall size={11} /> {t.homeVisits} ({assignedHomeVisits.length})
                    </span>
                    <span className="text-[10px] text-[#8C8479]">High Priority</span>
                  </div>

                  {assignedHomeVisits.length === 0 ? (
                    <p className="text-xs text-[#8C8479] py-2 text-center">
                      Zero home visit tickets pending today.
                    </p>
                  ) : (
                    assignedHomeVisits.map((woman) => (
                      <div
                        key={woman.id}
                        className="p-2.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-[#1C1917]">
                          <span>{woman.name}</span>
                          <span className="text-[10px] text-[#B91C1C]">2 Consecutive Absences</span>
                        </div>
                        <p className="text-[11px] text-[#6B655C]">{woman.villageWard} · {woman.primaryTrade}</p>
                        {woman.homeVisitNotes && (
                          <p className="text-[10px] text-[#8C8479] italic bg-white p-1 rounded border border-[#E5DFD3]">
                            Note: "{woman.homeVisitNotes}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Surveys Due Section */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FCFBF8] p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                      {t.surveysDue}
                    </span>
                    <span className="text-[10px] text-[#2E6B4E] font-semibold">Endline Wave</span>
                  </div>

                  <div className="divide-y divide-[#E5DFD3]">
                    {beneficiaries.filter((b) => b.m6SurveyStatus === 'Pending').slice(0, 3).map((b) => (
                      <div key={b.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-[#1C1917]">{b.name}</div>
                          <div className="text-[10px] text-[#8C8479]">{b.primaryTrade} · M0: ₹{b.m0BaselineIncome}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSurveyBenId(b.id);
                            setMobileTab('survey');
                          }}
                          className="px-2 py-1 rounded-md bg-[#F7F4ED] border border-[#2E6B4E] text-[#2E6B4E] text-[10px] font-bold"
                        >
                          Start M6 →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: ATTENDANCE ── */}
            {mobileTab === 'attendance' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                    {t.selectBatch}
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917]"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} · {b.ward}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                    {t.topicTaught}
                  </label>
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917]"
                  />
                </div>

                {/* Roster List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#6B655C]">
                    <span>Roster ({batchBeneficiaries.length} Enrolled)</span>
                    <span className="font-semibold text-[#2E6B4E] tabular-nums">
                      {presentBeneficiaryIds.length} Present ({Math.round((presentBeneficiaryIds.length / (batchBeneficiaries.length || 1)) * 100)}%)
                    </span>
                  </div>

                  <div className="border border-[#E5DFD3] rounded-xl bg-[#FCFBF8] divide-y divide-[#E5DFD3] max-h-[300px] overflow-y-auto">
                    {batchBeneficiaries.map((b) => {
                      const isPresent = presentBeneficiaryIds.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            setPresentBeneficiaryIds((prev) =>
                              isPresent ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                            );
                          }}
                          className="p-2.5 flex items-center justify-between hover:bg-[#F7F4ED] cursor-pointer text-xs"
                        >
                          <div>
                            <div className="font-semibold text-[#1C1917]">{b.name}</div>
                            <div className="text-[10px] text-[#8C8479]">{b.primaryTrade}</div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              isPresent
                                ? 'bg-[#2E6B4E] text-white'
                                : 'bg-[#EAE6DD] text-[#8C8479]'
                            }`}
                          >
                            {isPresent ? t.present : t.absent}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="w-full py-2.5 rounded-xl bg-[#2E6B4E] text-white text-xs font-semibold hover:bg-[#24563E] transition-colors shadow-2xs"
                >
                  {t.saveAttendance}
                </button>
              </div>
            )}

            {/* ── TAB 3: M6 SURVEY (TRIANGULATED ANTI-BIAS) ── */}
            {mobileTab === 'survey' && (
              <div className="space-y-3.5">
                {/* Beneficiary Picker */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                    {t.selectBeneficiary}
                  </label>
                  <select
                    value={surveyBenId}
                    onChange={(e) => setSurveyBenId(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] outline-none text-[#1C1917]"
                  >
                    {beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.villageWard}) · M0: ₹{b.m0BaselineIncome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Locked Baseline Badge */}
                <div className="p-2.5 rounded-xl bg-[#EFECE4] border border-[#E5DFD3] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#6B655C]">{t.lockedBaseline}:</span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    ₹{currentSurveyBen.m0BaselineIncome.toLocaleString('en-IN')} / mo
                  </span>
                </div>

                {/* Triangulation Inputs */}
                <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFBF8] p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-[#6B655C]">{t.daysEarned}</label>
                    <span className="font-semibold text-xs tabular-nums text-[#2E6B4E]">{daysWorked} days</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={7}
                    value={daysWorked}
                    onChange={(e) => setDaysWorked(Number(e.target.value))}
                    className="w-full accent-[#2E6B4E] cursor-pointer"
                  />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[#8C8479] block">{t.goodDay}</label>
                      <input
                        type="number"
                        value={goodDayRev}
                        onChange={(e) => setGoodDayRev(Number(e.target.value))}
                        className="w-full p-1.5 text-xs rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] outline-none tabular-nums font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8C8479] block">{t.slowDay}</label>
                      <input
                        type="number"
                        value={slowDayRev}
                        onChange={(e) => setSlowDayRev(Number(e.target.value))}
                        className="w-full p-1.5 text-xs rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] outline-none tabular-nums font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8C8479] block">{t.weeklyCost}</label>
                    <input
                      type="number"
                      value={weeklyCost}
                      onChange={(e) => setWeeklyCost(Number(e.target.value))}
                      className="w-full p-1.5 text-xs rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] outline-none tabular-nums font-semibold"
                    />
                  </div>
                </div>

                {/* Dynamic Calculated Net Monthly Profit Card */}
                <div className="rounded-xl bg-[#F7F4ED] border border-[#2E6B4E]/40 p-3 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E6B4E]">
                      {t.calculatedProfit}
                    </span>
                    <span className="text-xs font-semibold text-[#2E6B4E] tabular-nums">
                      +{profitJumpPct}% lift
                    </span>
                  </div>
                  <div className="font-sans font-semibold text-lg text-[#1C1917] tabular-nums">
                    ₹{calculatedMonthlyProfit.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-[#8C8479]">/ month</span>
                  </div>
                  <p className="text-[10px] text-[#6B655C]">
                    Calculated from ({daysWorked} days × revenue) - expenses × 4.3 wks
                  </p>
                </div>

                {/* Anti-Fraud Sanity Trigger (Jump > 200%) */}
                {hasHighJump && (
                  <div className="rounded-xl bg-[#FEF6EE] border border-[#A86414]/40 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#A86414] font-bold text-[11px]">
                      <AlertTriangle size={13} />
                      <span>{t.highJumpAlert}</span>
                    </div>
                    <textarea
                      rows={2}
                      value={anomalyNoteInput}
                      onChange={(e) => setAnomalyNoteInput(e.target.value)}
                      placeholder={t.highJumpNotePlaceholder}
                      className="w-full p-1.5 text-[11px] rounded-lg bg-white border border-[#A86414]/40 outline-none text-[#1C1917]"
                    />
                  </div>
                )}

                {/* Quick Toggles: UPI & Resilience */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-[#8C8479] block">{t.upiReceipts}</label>
                    <select
                      value={upiCount}
                      onChange={(e) => setUpiCount(e.target.value as any)}
                      className="w-full p-1.5 text-xs rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] outline-none"
                    >
                      <option value="0">0 (Cash only)</option>
                      <option value="1–5">1–5 transactions</option>
                      <option value="6–20">6–20 transactions</option>
                      <option value="20+">20+ transactions</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8C8479] block">{t.resilience}</label>
                    <select
                      value={resilienceSource}
                      onChange={(e) => setResilienceSource(e.target.value)}
                      className="w-full p-1.5 text-xs rounded-lg bg-[#F7F4ED] border border-[#E5DFD3] outline-none"
                    >
                      <option value="Personal savings">Personal savings</option>
                      <option value="SHG emergency fund">SHG emergency fund</option>
                      <option value="Moneylender / Debt">Moneylender / Debt</option>
                      <option value="Family support">Family support</option>
                    </select>
                  </div>
                </div>

                {/* Simulated GPS Geofence Lock */}
                <div className="p-2 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-semibold text-[#2E6B4E]">
                    <MapPin size={12} /> {t.gpsLocked}
                  </span>
                  <span className="text-[10px] text-[#8C8479] tabular-nums font-sans font-semibold">
                    {currentSurveyBen.gpsLocation.split('·')[0]}
                  </span>
                </div>

                {/* Submit Button with Stateful Morph */}
                <button
                  type="button"
                  disabled={submitState !== 'idle'}
                  onClick={handleSubmitSurvey}
                  className={`w-full py-2.5 rounded-xl text-white text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 transition-all duration-100 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2E6B4E]/25 ${
                    submitState === 'submitted'
                      ? 'bg-[#2E6B4E]'
                      : 'bg-[#2E6B4E] hover:bg-[#24563E]'
                  }`}
                >
                  {submitState === 'submitting' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isOnline ? 'Submitting to TL...' : 'Saving to Local Queue...'}</span>
                    </>
                  ) : submitState === 'submitted' ? (
                    <>
                      <Check size={14} />
                      <span>{isOnline ? 'Synced to TL ✓' : 'Cached Locally ✓'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>{t.submitToTL}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Bottom Mobile Tab Bar (Today / Attendance / Survey) */}
          <div className="h-14 bg-[#EFECE4] border-t border-[#E5DFD3] grid grid-cols-3 text-center select-none flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab('today')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                mobileTab === 'today' ? 'text-[#2E6B4E]' : 'text-[#8C8479]'
              }`}
            >
              <Calendar size={15} />
              <span>{t.todayTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('attendance')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                mobileTab === 'attendance' ? 'text-[#2E6B4E]' : 'text-[#8C8479]'
              }`}
            >
              <CheckSquare size={15} />
              <span>{t.attendanceTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('survey')}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                mobileTab === 'survey' ? 'text-[#2E6B4E]' : 'text-[#8C8479]'
              }`}
            >
              <FileText size={15} />
              <span>{t.surveyTab}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT-HAND PANEL: LIVE DATA PIPELINE EXPLAINED (Desktop) ─────────────── */}
      <div className="hidden xl:block flex-1 w-full max-w-xl space-y-6">
        <div className="rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#0B4A7D]" />
            <h3 className="font-narrative text-xl font-normal text-[#1C1917]">
              {t.pipelineTitle}
            </h3>
          </div>
          <p className="text-xs text-[#6B655C]">
            Live Offline-First Sync Pipeline: Local Device Queue → NGO Quality Gate → Bajaj Executive Console.
          </p>

          {/* Architectural 3-Tier Pipeline Flow */}
          <div className="space-y-4 pt-3">
            {/* Step 1: Frontline Field Officer */}
            <div className="p-4 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2E6B4E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#1C1917]">
                    Frontline Mobile Client (Offline-First Device Cache)
                  </h4>
                  <span className="text-[10px] text-[#2E6B4E] font-semibold">Frontline App</span>
                </div>
                <p className="text-[#6B655C] text-[11px]">
                  Field Officer records GPS-verified attendance and triangulates M6 net profit via good/slow day earnings. If internet cuts out in rural clusters, records queue locally in offline device storage with zero data loss.
                </p>
              </div>
            </div>

            <div className="flex justify-center -my-2 text-[#8C8479]">
              <ArrowRight size={16} className="rotate-90" />
            </div>

            {/* Step 2: NGO Operations ERP */}
            <div className="p-4 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#B5532A] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#1C1917]">
                    NGO Team Leader Console (Pratham Operations QA)
                  </h4>
                  <span className="text-[10px] text-[#B5532A] font-semibold">Governance Gate</span>
                </div>
                <p className="text-[#6B655C] text-[11px]">
                  Surveys quarantine in the QA Queue. Automatic algorithms verify geofences, natural survey duration (≥60s), and flag spikes &gt;200%. Team Leader Rajesh Gaikwad reviews photo evidence before audit-locking.
                </p>
              </div>
            </div>

            <div className="flex justify-center -my-2 text-[#8C8479]">
              <ArrowRight size={16} className="rotate-90" />
            </div>

            {/* Step 3: Funder Executive Overview */}
            <div className="p-4 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0B4A7D] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#1C1917]">
                    Funder Executive Boardroom (Suman Bajaj ImpactOS)
                  </h4>
                  <span className="text-[10px] text-[#0B4A7D] font-semibold">Statutory Board Pack</span>
                </div>
                <p className="text-[#6B655C] text-[11px]">
                  The moment a survey is approved, Suman Bajaj's Funder Overview increments its synced verification counter (e.g. 3,410 → 3,411), logs a verified audit event, and updates the milestone tranche readiness score for CSR compliance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Live Simulation Guide Drawer */}
        <details className="group rounded-2xl bg-[#FCFBF8] border border-[#E5DFD3] p-5 space-y-3 cursor-pointer">
          <summary className="font-sans text-xs font-semibold text-[#1C1917] flex items-center justify-between list-none">
            <span className="flex items-center gap-2">
              <span>Interactive Demo Guide</span>
              <span className="text-[10px] text-[#0B4A7D] font-normal bg-[#E7F0F7] px-2 py-0.5 rounded">Click to expand</span>
            </span>
            <span className="text-xs text-[#8C8479] group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#6B655C] pt-2 border-t border-[#E5DFD3] mt-2">
            <li>Select <strong>Rekha Jadhav</strong> in the phone's <em>M6 Survey</em> tab.</li>
            <li>Adjust Good Day revenue to ₹550 and tap <strong>Submit to Team Leader</strong>.</li>
            <li>Use the left sidebar perspective switcher to jump to <strong>NGO ERP · Pratham Pune</strong>.</li>
            <li>In the <em>Survey QA & Sync Queue</em> tab, click <strong>✓ Approve & Sync to Bajaj</strong>.</li>
            <li>Switch back to <strong>Funder · Bajaj CSR</strong> and verify the Synced Surveys counter increments live!</li>
          </ol>
        </details>
      </div>

      {/* ── MOBILE PIPELINE ARCHITECTURE BOTTOM SHEET (< xl) ─────────────── */}
      <AnimatePresence>
        {pipelineSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end xl:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setPipelineSheetOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.24 }}
              className="relative z-10 w-full max-h-[88dvh] bg-[#FCFBF8] rounded-t-2xl border-t border-[#E5DFD3] p-5 pb-safe overflow-y-auto overscroll-contain space-y-4 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-[#D6CFC2] mx-auto mb-1 flex-shrink-0" />

              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0B4A7D]" />
                  <h3 className="font-narrative text-lg font-normal text-[#1C1917]">
                    {t.pipelineTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPipelineSheetOpen(false)}
                  className="p-1 rounded-md text-[#8C8479] hover:text-[#1C1917] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-[#6B655C]">
                Live Offline-First Sync Pipeline: Local Device Queue → NGO Quality Gate → Bajaj Executive Console.
              </p>

              {/* 3 Pipeline Steps */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#2E6B4E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-semibold text-[#1C1917]">
                      Frontline Mobile Client (Offline-First Cache)
                    </h4>
                    <p className="text-[#6B655C] text-[11px]">
                      Field Officer records attendance and triangulates M6 net profit. If internet drops, records store safely in offline cache.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#B5532A] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-semibold text-[#1C1917]">
                      NGO Team Leader Console (QA Gate)
                    </h4>
                    <p className="text-[#6B655C] text-[11px]">
                      Surveys quarantine for audit. Algorithms check GPS proximity and duration before Rajesh Gaikwad locks and publishes.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F4ED] border border-[#E5DFD3] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0B4A7D] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-semibold text-[#1C1917]">
                      Funder Executive Boardroom (ImpactOS)
                    </h4>
                    <p className="text-[#6B655C] text-[11px]">
                      Once approved, Suman Bajaj's dashboard increments verification counters, updates audit trails, and unlocks milestone tranches.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#E7F0F7] border border-[#0B4A7D]/20 space-y-1 text-xs">
                <span className="font-bold text-[#0B4A7D] block">Interactive Walkthrough Tip:</span>
                <p className="text-[#6B655C] text-[11px]">
                  Submit an M6 survey on this screen, then tap <strong>ERP</strong> in the top bar to review and approve it!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPipelineSheetOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-semibold hover:bg-[#333] transition-colors mt-2"
              >
                Close Pipeline View
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Sonner-Style Stacked Toasts */}
      <SonnerToast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};
