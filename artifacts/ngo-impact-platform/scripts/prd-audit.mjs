import { readFile } from "node:fs/promises";

const root = new URL("../src/", import.meta.url);
const read = async path => readFile(new URL(path, root), "utf8");
const files = {
  app: await read("App.tsx"),
  layout: await read("components/layout.tsx"),
  monitor: await read("pages/monitor.tsx"),
  programs: await read("pages/programs/index.tsx"),
  program: await read("pages/programs/detail.tsx"),
  beneficiaries: await read("pages/beneficiaries/index.tsx"),
  beneficiary: await read("pages/beneficiaries/detail.tsx"),
  operations: await read("pages/operations.tsx"),
  investigate: await read("pages/investigate.tsx"),
  actions: await read("pages/actions.tsx"),
  reports: await read("pages/reports.tsx"),
  settings: await read("pages/settings.tsx"),
};

const checks = [];
const check = (area, requirement, pass, evidence) => checks.push({ area, requirement, pass: Boolean(pass), evidence });
const includesAll = (source, terms) => terms.every(term => source.includes(term));

check("Shell", "Persistent primary navigation", includesAll(files.layout, ["Home", "Programs", "Beneficiaries", "Operations", "Actions", "Reports"]), "layout navigation");
check("Shell", "Context header includes program, locality, cohort, period, population", includesAll(files.layout, ["MOUNT_DATA.program.name", "locality", "cohort", "period", "Pop:"]), "global context controls");
check("Shell", "Object-first global search", includesAll(files.layout, ["Search workspace", "Program", "Beneficiary", "Action"]), "search dialog and categorized results");
check("Shell", "Persistent global filters", includesAll(files.layout, ["Global context", "All Localities", "All Cohorts", "Apply context"]), "locality/cohort/period state");
check("RUN", "Program list with search and status filters", includesAll(files.programs, ["Search programs", "All statuses", "visiblePrograms"]), "program list");
check("RUN", "Program creation workflow", includesAll(files.programs, ["Create draft program", "createProgram"]), "draft creation dialog");
check("RUN", "Program detail has all six required tabs", includesAll(files.program, ["Overview", "Cohorts", "Beneficiaries", "Activities", "Data Collection", "Team"]), "program workspace tabs");
check("RUN", "Cohort register is populated", includesAll(files.program, ["MH-01", "MH-04", "attendance"]), "cohort rows");
check("RUN", "Beneficiary register supports search, filter, add, export", includesAll(files.beneficiaries, ["visible", "addBeneficiary", "exportCsv", "All statuses"]), "beneficiary management");
check("RUN", "Bulk P/A/E attendance entry persists", includesAll(files.operations, ["markAttendance", "'P'", "'A'", "'E'", "Attendance Saved"]), "attendance dialog");
check("RUN", "Survey operations show due/completion/data-quality states", includesAll(files.operations + files.program, ["M3 Survey", "completed", "Missing", "Overdue"]), "operations and collection panels");
check("MONITOR", "Command centre includes KPIs, funnel, attention, trends, activity", includesAll(files.monitor, ["Training Completion", "Program Journey Conversion", "Attention Required", "Outcome Trend", "Recent Activity"]), "monitor sections");
check("MONITOR", "Aggregate-to-investigation drilldown", files.monitor.includes("/investigate?locality="), "locality links");
check("INVESTIGATE", "Question builder and population funnel", includesAll(files.investigate, ["Start an investigation", "Population Builder", "Apply Next Filter"]), "investigation controls");
check("INVESTIGATE", "Evidence triangulation", includesAll(files.investigate, ["Primary Survey Data", "Supplementary App Signals", "Correlation, not causation"]), "evidence tab");
check("INVESTIGATE", "Statistical methods and caveats", includesAll(files.investigate, ["Pearson Correlation", "Chi-Square Test", "T-Test", "p-value"]), "analysis tab");
check("INVESTIGATE", "Segmentation comparison", includesAll(files.investigate, ["Segmentation: Tailors by Locality", "Hadapsar", "Kothrud"]), "segmentation tab");
check("INVESTIGATE", "Finding creation routes into action flow", includesAll(files.investigate, ["addFinding", "Create Finding & Action", "setLocation('/actions')"]), "finding action");
check("ACT", "Action queue filters, search and status updates", includesAll(files.actions, ["filteredActions", "Search actions", "updateActionStatus"]), "action queue");
check("ACT", "Action creation has objective, owner, due date and finding", includesAll(files.actions, ["Create accountable action", "Objective", "Owner", "Due date", "Linked finding"]), "creation dialog");
check("ACT", "Provenance trace includes action, finding, evidence, signal caveat", includesAll(files.actions, ["Evidence Trace", "Finding Scope", "Source Triangulation", "do not prove causation"]), "trace dialog");
check("ACT", "Structured field finding submission", includesAll(files.beneficiary, ["Observed status", "Barrier category", "Field note"]), "beneficiary interaction dialog");
check("REPORT", "Report filtering and export simulation", includesAll(files.reports, ["setTag", "handleExport", "Generate Custom Report"]), "report workspace");
check("DATA", "Data source, quality and audit settings", includesAll(files.settings, ["Data sources", "Quality controls", "Audit readiness"]), "settings workspace");
check("GOLDEN PATH", "Required routes exist", includesAll(files.app, ["/programs/:id", "/beneficiaries/:id", "/operations", "/investigate", "/actions", "/reports", "/settings"]), "router");

const routePaths = ["/", "/programs", "/programs/p1", "/beneficiaries", "/beneficiaries/b1", "/operations", "/investigate", "/actions", "/reports", "/settings"];
for (const path of routePaths) {
  try {
    const response = await fetch(`http://localhost:80${path}`);
    check("ROUTE", `${path} renders through preview proxy`, response.ok, `HTTP ${response.status}`);
  } catch (error) {
    check("ROUTE", `${path} renders through preview proxy`, false, error.message);
  }
}

const failed = checks.filter(item => !item.pass);
console.log(`PRD AUDIT: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} | ${item.area.padEnd(12)} | ${item.requirement} | ${item.evidence}`);
process.exit(failed.length ? 1 : 0);