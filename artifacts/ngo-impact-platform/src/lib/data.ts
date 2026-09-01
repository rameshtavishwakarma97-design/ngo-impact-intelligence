export interface Program {
  id: string;
  name: string;
  manager: string;
  totalBeneficiaries: number;
  status: 'active' | 'completed' | 'draft';
  cohorts: number;
  startDate: string;
  trainingCompletion?: number;
  businessActivity?: number;
  businessActivityBaseline?: number;
  digitalAdoption?: number;
  digitalAdoptionBaseline?: number;
}

export interface LocalityData {
  id: string;
  name: string;
  beneficiaries: number;
  businessActivity: number;
  digitalAdoption: number;
  attentionCases: number;
}

export interface Beneficiary {
  id: string;
  name: string;
  age: number;
  profession: string;
  localityId: string;
  status: 'active' | 'paused' | 'dropped';
  businessActivity: number; 
  digitalAdoption: number;
  attendance: number;
  journey: {
    month: string;
    stage: string;
    participation: number;
    intervention?: string;
    outcome?: string;
    evidenceType: 'primary_survey' | 'app_signal';
  }[];
}

export interface Action {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  relatedFindingId?: string;
  dateCreated: string;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  populationSize: number;
  populationFilter: string[];
  evidenceSource: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Program Manager' | 'Field Officer';
  localities: string[];
  cohorts: string[];
  workload: number;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "t1", name: "Priya Shah", role: "Program Manager", localities: ["l1", "l2", "l3"], cohorts: ["c1", "c2", "c3", "c4"], workload: 80 },
  { id: "t2", name: "Rahul Deshmukh", role: "Field Officer", localities: ["l1"], cohorts: ["c1", "c2"], workload: 45 },
  { id: "t3", name: "Sneha Patil", role: "Field Officer", localities: ["l2", "l3"], cohorts: ["c3", "c4"], workload: 60 },
];

export const MOUNT_DATA = {
  program: {
    id: "p1",
    name: "Bajaj Livelihood & Skill Development",
    manager: "Priya Shah",
    totalBeneficiaries: 180,
    status: "active" as const,
    cohorts: 4,
    startDate: "2024-01-15",
    trainingCompletion: 0.89,
    businessActivity: 0.76,
    businessActivityBaseline: 0.61,
    digitalAdoption: 0.58,
    digitalAdoptionBaseline: 0.31,
  },
  localities: [
    { id: "l1", name: "Hadapsar", beneficiaries: 75, businessActivity: 0.82, digitalAdoption: 0.61, attentionCases: 4 },
    { id: "l2", name: "Kothrud", beneficiaries: 52, businessActivity: 0.68, digitalAdoption: 0.53, attentionCases: 12 },
    { id: "l3", name: "Pimpri", beneficiaries: 53, businessActivity: 0.79, digitalAdoption: 0.59, attentionCases: 3 },
  ] as LocalityData[],
  beneficiaryMeena: {
    id: "b1",
    name: "Meena",
    age: 38,
    profession: "Home-based Tailor",
    localityId: "l2",
    status: "paused",
    businessActivity: 0.3,
    digitalAdoption: 0.2,
    attendance: 0.9,
    journey: [
      { month: "M0", stage: "Baseline", participation: 1.0, outcome: "Identified low customer reach", evidenceType: "primary_survey" },
      { month: "M3", stage: "Post-Training", participation: 0.9, outcome: "Adopted digital ledger", evidenceType: "app_signal" },
      { month: "M6", stage: "Follow-up", participation: 0.4, intervention: "Market-linkage session required", outcome: "Reported low customer demand", evidenceType: "primary_survey" },
    ]
  } as Beneficiary,
  otherBeneficiaries: [
    {
      id: "b2", name: "Sunita", age: 41, profession: "Weaver", localityId: "l1", status: "active",
      businessActivity: 0.8, digitalAdoption: 0.7, attendance: 0.95, journey: []
    },
    {
      id: "b3", name: "Anjali", age: 34, profession: "Home-based Tailor", localityId: "l2", status: "paused",
      businessActivity: 0.2, digitalAdoption: 0.3, attendance: 0.85, journey: []
    },
    {
      id: "b4", name: "Kavita", age: 29, profession: "Potter", localityId: "l3", status: "active",
      businessActivity: 0.9, digitalAdoption: 0.6, attendance: 1.0, journey: []
    },
    {
      id: "b5", name: "Rohini", age: 45, profession: "Home-based Tailor", localityId: "l2", status: "paused",
      businessActivity: 0.1, digitalAdoption: 0.4, attendance: 0.9, journey: []
    }
  ] as Beneficiary[],
  programs: [
    { id: "p1", name: "Bajaj Livelihood & Skill Development", manager: "Priya Shah", totalBeneficiaries: 180, status: "active", cohorts: 4, startDate: "2024-01-15" },
    { id: "p2", name: "Women Digital Literacy Initiative", manager: "Anand Joshi", totalBeneficiaries: 320, status: "active", cohorts: 8, startDate: "2023-11-01" },
    { id: "p3", name: "Urban Artisan Market Access", manager: "Meera Patel", totalBeneficiaries: 0, status: "draft", cohorts: 0, startDate: "2024-06-01" },
  ] as Program[]
};

export const INITIAL_ACTIONS: Action[] = [
  {
    id: "a1",
    title: "Market-linkage session for tailors in Kothrud",
    description: "Organize a session connecting local tailors to nearby boutique owners to increase customer demand.",
    assignee: "Rohan Kulkarni",
    status: "pending",
    relatedFindingId: "f1",
    dateCreated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "a2",
    title: "Follow up on missing M3 Surveys",
    description: "Contact 24 beneficiaries in Hadapsar to complete M3 Post-Training survey.",
    assignee: "Priya Shah",
    status: "in-progress",
    dateCreated: new Date(Date.now() - 172800000).toISOString(),
  }
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: "f1",
    title: "Low customer demand causing business pauses among tailors",
    description: "3 out of 17 tailors in Kothrud have paused their businesses. Primary surveys indicate a sharp drop in local customer walk-ins.",
    populationSize: 3,
    populationFilter: ["Locality: Kothrud", "Profession: Tailor", "Status: Paused"],
    evidenceSource: "M6 Primary Survey",
    confidence: "high"
  }
];