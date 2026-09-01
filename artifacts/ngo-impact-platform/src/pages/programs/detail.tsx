import { useLocation, useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOUNT_DATA } from "@/lib/data";
import { useDataStore } from "@/lib/store";
import { ChevronRight, Users, PlayCircle, BarChart, Settings, Search, Plus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const program = MOUNT_DATA.programs.find(p => p.id === id) || MOUNT_DATA.program;
  const { team } = useDataStore();
  const { toast } = useToast();
  const acknowledge = (title: string, description: string) => toast({ title, description });

  return (
    <div className="max-w-[1400px] mx-auto p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-6 uppercase tracking-widest">
        <span>Programs</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{program.name}</span>
      </div>

      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight mb-3">{program.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-mono uppercase text-[10px]">{program.status}</Badge>
            <span>Manager: <strong className="text-foreground font-medium">{program.manager}</strong></span>
            <span>Started: <strong className="text-foreground font-mono">{new Date(program.startDate || "2024-01-15").toLocaleDateString()}</strong></span>
          </div>
        </div>
        <Button onClick={() => acknowledge("Program settings opened", "Program metadata and lifecycle configuration are ready for editing.")} className="font-mono text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4 mr-2" /> Manage Program
        </Button>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 h-auto rounded-none mb-8 overflow-x-auto flex-nowrap flex">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-mono uppercase text-xs tracking-wider shrink-0">Overview</TabsTrigger>
          <TabsTrigger value="cohorts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-mono uppercase text-xs tracking-wider shrink-0">Cohorts ({program.cohorts || 4})</TabsTrigger>
          <TabsTrigger value="beneficiaries" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-mono uppercase text-xs tracking-wider shrink-0">Beneficiaries ({program.totalBeneficiaries})</TabsTrigger>
          <TabsTrigger value="activities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-mono uppercase text-xs tracking-wider shrink-0">Activities</TabsTrigger>
          <TabsTrigger value="data-collection" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-mono uppercase text-xs tracking-wider shrink-0">Data Collection</TabsTrigger>
          <TabsTrigger value="team" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-mono uppercase text-xs tracking-wider shrink-0">Team ({team.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card flex flex-col justify-between">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Total Beneficiaries</h3>
              <div className="text-4xl font-light font-mono">{program.totalBeneficiaries}</div>
            </Card>
            <Card className="p-6 bg-card flex flex-col justify-between">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Active Cohorts</h3>
              <div className="text-4xl font-light font-mono">{program.cohorts || 4}</div>
            </Card>
            <Card className="p-6 bg-card flex flex-col justify-between">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Completion Rate</h3>
              <div className="text-4xl font-light font-mono">{(MOUNT_DATA.program.trainingCompletion * 100).toFixed(0)}%</div>
            </Card>
          </div>
          
          <div className="bg-card border border-border p-6">
            <h3 className="text-sm font-medium mb-6 flex items-center gap-2"><BarChart className="w-4 h-4"/>Outcome progression</h3>
            <div className="grid grid-cols-4 gap-4 h-40 items-end">
              {[["M0",61],["M2",66],["M3",71],["M6",76]].map(([label,value]) => <div key={label} className="h-full flex flex-col justify-end gap-2"><span className="text-xs font-mono text-center">{value}%</span><div className="bg-primary/80" style={{height:`${value}%`}}/><span className="text-[10px] font-mono text-muted-foreground text-center">{label}</span></div>)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="mt-0">
          <div className="bg-card border border-border">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-medium">Active Cohorts</h3>
              <Button onClick={() => acknowledge("Cohort draft created", "A new cohort setup is ready for locality, dates, and beneficiary assignment.")} size="sm" variant="outline" className="font-mono text-xs uppercase"><Plus className="w-3 h-3 mr-2" /> Add Cohort</Button>
            </div>
            <div className="divide-y divide-border">{[
              ["MH-01","Hadapsar",48,"94%","Active"],["MH-02","Kothrud",52,"87%","Attention"],["MH-03","Pimpri",43,"91%","Active"],["MH-04","Hadapsar",37,"82%","Active"]
            ].map(row => <div key={row[0]} className="grid grid-cols-5 p-4 text-sm items-center"><strong>{row[0]}</strong><span>{row[1]}</span><span className="font-mono">{row[2]} people</span><span className="font-mono">{row[3]} attendance</span><Badge variant={row[4] === "Attention" ? "destructive":"outline"} className="justify-self-end font-mono text-[10px] uppercase">{row[4]}</Badge></div>)}</div>
          </div>
        </TabsContent>

        <TabsContent value="beneficiaries" className="mt-0">
          <div className="bg-card border border-border">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search beneficiaries..." className="w-full pl-9 pr-4 py-1.5 text-sm bg-background border border-border focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => acknowledge("Import ready", "CSV mapping and validation are ready for beneficiary records.")} size="sm" variant="outline" className="font-mono text-xs uppercase">Import</Button>
                <Button onClick={() => setLocation("/beneficiaries")} size="sm" className="font-mono text-xs uppercase">Add Manual</Button>
              </div>
            </div>
            <div className="divide-y divide-border">{MOUNT_DATA.otherBeneficiaries.slice(0,4).map(person => <button key={person.id} onClick={() => setLocation(`/beneficiaries/${person.id}`)} className="w-full grid grid-cols-4 p-4 text-left hover:bg-accent/30 text-sm"><strong>{person.name}</strong><span>{person.profession}</span><span>{person.localityId.toUpperCase()}</span><Badge variant="outline" className="justify-self-end font-mono text-[10px] uppercase">{person.status}</Badge></button>)}</div>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="mt-0">
          <div className="bg-card border border-border">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="font-medium">Scheduled & Completed Activities</h3>
              <Button onClick={() => acknowledge("Activity draft created", "Choose activity type, locality, cohort, facilitator, and date.")} size="sm" className="font-mono text-xs uppercase"><Plus className="w-3 h-3 mr-2 hidden md:inline" /> Schedule</Button>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <Badge variant="outline" className="font-mono text-[10px] uppercase mb-1">Workshop</Badge>
                   <h4 className="font-medium">Digital Ledger Onboarding</h4>
                   <p className="text-sm text-muted-foreground mt-1">Hadapsar Locality • Oct 18, 2024</p>
                 </div>
                 <div className="flex gap-2 shrink-0">
                   <Button variant="outline" size="sm" className="font-mono text-xs uppercase tracking-wider">Delivery Note</Button>
                    <Button onClick={() => setLocation("/operations")} size="sm" className="font-mono text-xs uppercase tracking-wider">Log Attendance</Button>
                 </div>
              </div>
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-accent/30 transition-colors opacity-70">
                 <div>
                   <Badge variant="secondary" className="font-mono text-[10px] uppercase mb-1">Completed</Badge>
                   <h4 className="font-medium">Market-Linkage Follow-up</h4>
                   <p className="text-sm text-muted-foreground mt-1">Kothrud Locality • Sep 30, 2024</p>
                 </div>
                 <div className="flex gap-2 shrink-0">
                   <Button variant="outline" size="sm" className="font-mono text-xs uppercase tracking-wider">View Log</Button>
                 </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data-collection" className="mt-0">
          <div className="space-y-6">
            <Card className="bg-card border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <h4 className="font-medium flex items-center gap-2">M3 Post-Training Survey <Badge variant="secondary" className="font-mono text-[10px] uppercase bg-primary/10 text-primary border-primary/20">Active</Badge></h4>
                   <p className="text-sm text-muted-foreground mt-1">Due: Oct 30, 2024</p>
                 </div>
                 <div className="flex gap-2 shrink-0">
                   <Button variant="outline" size="sm" className="font-mono text-xs uppercase tracking-wider">Manage Collection</Button>
                 </div>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20">
                 <div>
                   <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Eligible</div>
                   <div className="text-2xl font-light font-mono">180</div>
                 </div>
                 <div>
                   <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Observed</div>
                   <div className="text-2xl font-light font-mono">142</div>
                 </div>
                 <div>
                   <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Coverage</div>
                   <div className="text-2xl font-light font-mono text-primary">79%</div>
                 </div>
                 <div>
                   <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Status</div>
                   <div className="text-sm font-medium text-destructive">24 Overdue</div>
                 </div>
              </div>
            </Card>

            <Card className="bg-card border-border overflow-hidden opacity-70">
              <div className="p-4 border-b border-border bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <h4 className="font-medium flex items-center gap-2">Baseline Assessment (M0) <Badge variant="secondary" className="font-mono text-[10px] uppercase">Closed</Badge></h4>
                   <p className="text-sm text-muted-foreground mt-1">Completed: Feb 15, 2024</p>
                 </div>
                 <div className="flex gap-2 shrink-0">
                   <Button variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider">View Data</Button>
                 </div>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20">
                 <div>
                   <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Eligible</div>
                   <div className="text-xl font-light font-mono">180</div>
                 </div>
                 <div>
                   <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Observed</div>
                   <div className="text-xl font-light font-mono">180</div>
                 </div>
                 <div>
                   <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Coverage</div>
                   <div className="text-xl font-light font-mono text-foreground">100%</div>
                 </div>
                 <div>
                   <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Status</div>
                   <div className="text-sm font-medium text-muted-foreground">Complete</div>
                 </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-0">
          <div className="bg-card border border-border">
            <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
              <h3 className="font-medium">Program Team</h3>
              <Button size="sm" variant="outline" className="font-mono text-xs uppercase tracking-wider"><Filter className="w-3 h-3 mr-2 hidden md:inline" /> Filter</Button>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px] divide-y divide-border">
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-mono text-muted-foreground uppercase tracking-wider bg-background/50">
                   <div className="col-span-3">Name / Role</div>
                   <div className="col-span-3">Localities</div>
                   <div className="col-span-3">Cohorts</div>
                   <div className="col-span-2">Workload</div>
                   <div className="col-span-1 text-right">Actions</div>
                </div>
                {team.map(member => (
                  <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-accent/30 transition-colors">
                    <div className="col-span-3">
                       <div className="font-medium">{member.name}</div>
                       <div className="text-xs text-muted-foreground font-mono mt-1">{member.role}</div>
                    </div>
                    <div className="col-span-3 text-sm">{member.localities.map(l => l.toUpperCase()).join(", ")}</div>
                    <div className="col-span-3 text-sm">{member.cohorts.map(c => c.toUpperCase()).join(", ")}</div>
                    <div className="col-span-2">
                       <div className="flex items-center gap-2">
                         <div className="w-16 h-1.5 bg-secondary overflow-hidden">
                           <div className="h-full bg-foreground" style={{ width: `${member.workload}%` }} />
                         </div>
                         <span className="text-xs font-mono">{member.workload}%</span>
                       </div>
                    </div>
                    <div className="col-span-1 text-right">
                       <Button variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}