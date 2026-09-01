import { useState, useCallback, useEffect } from 'react';
import { 
  INITIAL_ACTIONS, Action, 
  INITIAL_FINDINGS, Finding,
  MOUNT_DATA, Program, LocalityData, Beneficiary
} from './data';

import { TEAM_MEMBERS } from './data';

// Singleton for naive local state sharing across components
let globalActions = [...INITIAL_ACTIONS];
let globalFindings = [...INITIAL_FINDINGS];
let globalBeneficiaries = [MOUNT_DATA.beneficiaryMeena, ...MOUNT_DATA.otherBeneficiaries];
let globalAttendance: Record<string, string> = {};

const STORAGE_KEY = 'ngo-impact-prototype-state';

if (typeof window !== 'undefined') {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as {
        actions?: Action[];
        findings?: Finding[];
        beneficiaries?: Beneficiary[];
        attendance?: Record<string, string>;
      };
      globalActions = parsed.actions ?? globalActions;
      globalFindings = parsed.findings ?? globalFindings;
      globalBeneficiaries = parsed.beneficiaries ?? globalBeneficiaries;
      globalAttendance = parsed.attendance ?? globalAttendance;
    }
  } catch {
    // A corrupt prototype snapshot should not prevent the demo from loading.
  }
}

const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      actions: globalActions,
      findings: globalFindings,
      beneficiaries: globalBeneficiaries,
      attendance: globalAttendance,
    }));
  }
  listeners.forEach((listener) => listener());
}

export function useDataStore() {
  const [actions, setActions] = useState<Action[]>(globalActions);
  const [findings, setFindings] = useState<Finding[]>(globalFindings);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(globalBeneficiaries);
  const [attendanceLog, setAttendanceLog] = useState<Record<string, string>>(globalAttendance);

  // Subscribe to changes
  useEffect(() => {
    const listener = () => {
      setActions([...globalActions]);
      setFindings([...globalFindings]);
      setBeneficiaries([...globalBeneficiaries]);
      setAttendanceLog({ ...globalAttendance });
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateActionStatus = useCallback((id: string, status: Action['status']) => {
    globalActions = globalActions.map(a => a.id === id ? { ...a, status } : a);
    notify();
  }, []);

  const addAction = useCallback((action: Omit<Action, 'id' | 'dateCreated'>) => {
    const newAction: Action = {
      ...action,
      id: `a${Date.now()}`,
      dateCreated: new Date().toISOString(),
    };
    globalActions = [newAction, ...globalActions];
    notify();
  }, []);

  const addFinding = useCallback((finding: Omit<Finding, 'id'>) => {
    const newFinding: Finding = {
      ...finding,
      id: `f${Date.now()}`,
    };
    globalFindings = [newFinding, ...globalFindings];
    notify();
    return newFinding;
  }, []);

  const updateBeneficiaryStatus = useCallback((id: string, status: Beneficiary['status']) => {
    globalBeneficiaries = globalBeneficiaries.map(b => b.id === id ? { ...b, status } : b);
    notify();
  }, []);

  const addBeneficiary = useCallback((beneficiary: Omit<Beneficiary, 'id' | 'journey'>) => {
    globalBeneficiaries = [{
      ...beneficiary,
      id: `b${Date.now()}`,
      journey: [],
    }, ...globalBeneficiaries];
    notify();
  }, []);

  const markAttendance = useCallback((records: Record<string, string>) => {
    globalAttendance = { ...globalAttendance, ...records };
    notify();
  }, []);

  return {
    actions,
    findings,
    beneficiaries,
    attendanceLog,
    team: TEAM_MEMBERS,
    updateActionStatus,
    addAction,
    addFinding,
    updateBeneficiaryStatus,
    addBeneficiary,
    markAttendance
  };
}