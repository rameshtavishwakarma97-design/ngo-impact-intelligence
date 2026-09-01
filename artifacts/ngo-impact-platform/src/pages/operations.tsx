import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Clock, AlertCircle, FileText, Users, PlayCircle, Plus } from "lucide-react";
import { MOUNT_DATA } from "@/lib/data";
import { useDataStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function TaskRow({ title, type, locality, status, progress, deadline, onExecute }: any) {
  return (
    <div className="group flex items-center justify-between p-4 bg-card border border-border/50 hover:border-border transition-colors">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-muted-foreground" /> : 
           status === 'urgent' ? <AlertCircle className="w-5 h-5 text-primary" /> : 
           <Clock className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] uppercase font-mono">{type}</Badge>
            <span className="text-xs text-muted-foreground">{locality}</span>
          </div>
          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{title}</h4>
        </div>
      </div>
      
      <div className="flex items-center gap-8 text-right">
        {progress && (
          <div className="w-32 hidden md:block">
            <div className="flex justify-between text-xs font-mono mb-1 text-muted-foreground">
              <span>{progress.completed}/{progress.total}</span>
              <span>{Math.round((progress.completed/progress.total)*100)}%</span>
            </div>
            <div className="h-1 bg-secondary w-full">
              <div className="h-full bg-foreground" style={{ width: `${(progress.completed/progress.total)*100}%` }} />
            </div>
          </div>
        )}
        <div className="text-xs font-mono text-muted-foreground w-20">
          {deadline}
        </div>
        <button onClick={() => onExecute?.(title)} className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground">
          {status === 'completed' ? 'View' : 'Execute'}
        </button>
      </div>
    </div>
  );
}

export default function Operations() {
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const { attendanceLog, markAttendance } = useDataStore();
  const [localAttendance, setLocalAttendance] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (attendanceOpen) {
      setLocalAttendance(attendanceLog);
    }
  }, [attendanceOpen, attendanceLog]);

  const handleSave = () => {
    markAttendance(localAttendance);
    toast({ 
      title: "Attendance Saved", 
      description: `Successfully logged attendance for ${Object.keys(localAttendance).length} participants.` 
    });
    setAttendanceOpen(false);
  };

  const handleMark = (id: string, status: string) => {
    setLocalAttendance(prev => ({ ...prev, [id]: status }));
  };
  const executeTask = (title: string) => toast({ title: title.includes("Survey") ? "Collection workspace opened" : "Task opened", description: `${title} is ready for field execution and status updates.` });

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">
            <span>{MOUNT_DATA.program.name}</span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span>Operations Engine</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight">Active Operations</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
            <DialogTrigger asChild>
              <Button className="font-mono text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-2" /> Bulk Attendance Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-medium">Bulk Attendance: Digital Ledger Session</DialogTitle>
                <div className="text-sm text-muted-foreground">Hadapsar Locality • Oct 18, 2024</div>
              </DialogHeader>
              <div className="py-4">
                <div className="flex justify-between items-center bg-muted/50 p-3 text-xs font-mono uppercase tracking-wider mb-2 border border-border">
                  <span>Beneficiary Name</span>
                  <span className="w-48 md:w-64 text-right">Status (P/A/E)</span>
                </div>
                <div className="space-y-2 h-64 overflow-y-auto">
                  {MOUNT_DATA.otherBeneficiaries.map((b) => {
                    const currentStatus = localAttendance[b.id] || '';
                    return (
                      <div key={b.id} className="flex justify-between items-center p-3 border-b border-border hover:bg-accent/30 transition-colors">
                        <span className="font-medium text-sm">{b.name} <span className="text-xs text-muted-foreground ml-2 hidden md:inline">({b.id})</span></span>
                        <div className="flex gap-1 bg-muted p-1">
                          <button onClick={() => handleMark(b.id, 'P')} className={cn("px-3 py-1 text-xs font-mono font-medium transition-colors", currentStatus === 'P' ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted-foreground/10 text-muted-foreground")}>P</button>
                          <button onClick={() => handleMark(b.id, 'A')} className={cn("px-3 py-1 text-xs font-mono font-medium transition-colors", currentStatus === 'A' ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted-foreground/10 text-muted-foreground")}>A</button>
                          <button onClick={() => handleMark(b.id, 'E')} className={cn("px-3 py-1 text-xs font-mono font-medium transition-colors", currentStatus === 'E' ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted-foreground/10 text-muted-foreground")}>E</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border pt-4">
                <div className="text-xs text-muted-foreground font-mono">Marking attendance for {Object.keys(localAttendance).length} participants</div>
                <Button onClick={handleSave} className="w-full md:w-auto">Save Attendance Log</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Status */}
        <div className="space-y-6">
          <Card className="p-5 bg-card">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Field Collection</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>M3 Survey</span>
                  <span className="font-mono text-xs">142/180</span>
                </div>
                <div className="h-1 bg-secondary w-full"><div className="h-full bg-primary" style={{ width: '79%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>M6 Follow-ups</span>
                  <span className="font-mono text-xs">98/180</span>
                </div>
                <div className="h-1 bg-secondary w-full"><div className="h-full bg-foreground" style={{ width: '54%' }} /></div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-l-2 border-l-primary">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Data Quality
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="text-sm">24 Missing M3 Surveys</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <div className="text-sm text-muted-foreground">App Signals Syncing</div>
            </div>
          </Card>
        </div>

        {/* Main Task List */}
        <div className="col-span-1 lg:col-span-3 space-y-8">
          
          <section>
            <h2 className="text-sm font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
              <PlayCircle className="w-4 h-4" /> Active Campaigns
            </h2>
            <div className="space-y-2">
              <TaskRow 
                title="M6 Primary Survey Collection" 
                type="Survey" 
                locality="All Localities" 
                status="in-progress"
                progress={{ completed: 98, total: 180 }}
                deadline="Oct 15"
                onExecute={executeTask}
              />
              <TaskRow 
                title="Market-Linkage Follow-ups" 
                type="Intervention" 
                locality="Kothrud" 
                status="urgent"
                progress={{ completed: 2, total: 12 }}
                deadline="Today"
                onExecute={executeTask}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Upcoming Interventions
            </h2>
            <div className="space-y-2">
              <TaskRow 
                title="Digital Ledger Onboarding Session" 
                type="Workshop" 
                locality="Hadapsar" 
                status="pending"
                deadline="Oct 18"
                onExecute={executeTask}
              />
              <TaskRow 
                title="Business Registration Camp" 
                type="Camp" 
                locality="Pimpri" 
                status="pending"
                deadline="Oct 22"
                onExecute={executeTask}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" /> Recently Completed
            </h2>
            <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
              <TaskRow 
                title="M3 Survey Collection" 
                type="Survey" 
                locality="All Localities" 
                status="completed"
                progress={{ completed: 142, total: 142 }}
                deadline="Sep 30"
                onExecute={executeTask}
              />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}