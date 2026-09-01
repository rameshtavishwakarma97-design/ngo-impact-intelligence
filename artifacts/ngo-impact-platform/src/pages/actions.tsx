import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ChevronDown, CheckCircle2, Circle, Clock, ArrowUpRight, Plus, ChevronRight } from "lucide-react";
import { useDataStore } from "@/lib/store";
import { MOUNT_DATA } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export default function Actions() {
  const { actions, findings, updateActionStatus, addAction } = useDataStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignee: "Priya Shah", findingId: "f1" });

  const filteredActions = actions.filter(a =>
    (filter === 'all' || a.status === filter) &&
    `${a.title} ${a.description} ${a.assignee}`.toLowerCase().includes(query.toLowerCase())
  );
  const submitAction = () => {
    if (!form.title.trim() || !form.description.trim()) return;
    addAction({ title: form.title.trim(), description: form.description.trim(), assignee: form.assignee, status: "pending", relatedFindingId: form.findingId || undefined });
    setForm({ title: "", description: "", assignee: "Priya Shah", findingId: "f1" });
    setNewOpen(false);
    toast({ title: "Action created", description: "The intervention is now in the accountable action queue." });
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 lg:p-12 space-y-8">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">
            <span>{MOUNT_DATA.program.name}</span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span>Action Queue</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight">Accountable Actions</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search actions…" className="w-56 border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </div>
          <Button onClick={() => setNewOpen(true)} className="font-mono text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-2" /> New Action
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-4 border-b border-border pb-px">
        {(['all', 'pending', 'in-progress', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium uppercase tracking-wider font-mono transition-colors border-b-2 ${
              filter === f ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card border border-border">
            No actions found for this filter.
          </div>
        ) : (
          filteredActions.map(action => {
            const finding = findings.find(f => f.id === action.relatedFindingId);
            
            return (
              <div key={action.id} className="bg-card border border-border flex flex-col group hover:border-primary/50 transition-colors">
                <div className="p-5 flex items-start gap-6">
                  {/* Status Toggle */}
                  <div className="shrink-0 mt-1">
                    <button 
                      onClick={() => updateActionStatus(action.id, action.status === 'completed' ? 'pending' : 'completed')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {action.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      ) : action.status === 'in-progress' ? (
                        <Clock className="w-6 h-6 text-primary/70" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                        {action.status}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        Created {new Date(action.dateCreated).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  {/* Assignee & Meta */}
                  <div className="w-48 shrink-0 text-right space-y-4">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-muted-foreground mb-1">Assignee</div>
                      <div className="text-sm font-medium">{action.assignee}</div>
                    </div>
                    {action.status !== 'completed' && (
                      <Button variant="outline" size="sm" 
                              onClick={() => updateActionStatus(action.id, 'in-progress')}
                              className="w-full text-xs font-mono uppercase tracking-wider"
                              disabled={action.status === 'in-progress'}>
                        Mark In-Progress
                      </Button>
                    )}
                  </div>
                </div>

                {/* Evidence Tracing Footer */}
                {finding && (
                  <div className="px-5 py-3 bg-muted/30 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-[10px] uppercase font-mono text-muted-foreground bg-background px-2 py-1 border border-border shrink-0">
                        Evidence Trace
                      </div>
                      <div className="text-sm text-muted-foreground flex-1 truncate">
                        Based on finding: <span className="font-medium text-foreground">{finding.title}</span> (N={finding.populationSize})
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-mono shrink-0">
                          View Source <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
                        <DialogHeader>
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">
                             <span>Action</span> <ChevronRight className="w-3 h-3" /> <span>Finding</span> <ChevronRight className="w-3 h-3" /> <span>Evidence</span>
                          </div>
                          <DialogTitle className="text-xl font-medium tracking-tight border-b border-border pb-4">
                            Intelligence Trace: {finding.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6 pt-4">
                          {/* Action Details */}
                          <section className="space-y-3">
                            <h4 className="text-xs font-mono uppercase text-muted-foreground">Action Meta</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 border border-border">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Owner</div>
                                <div className="text-sm font-medium">{action.assignee}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Status</div>
                                <div className="text-sm font-medium capitalize">{action.status}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Due Date</div>
                                <div className="text-sm font-medium">Oct 18, 2024</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Follow-up</div>
                                <div className="text-sm font-medium text-primary">Pending Verification</div>
                              </div>
                            </div>
                          </section>

                          {/* Finding Details */}
                          <section className="space-y-3">
                            <h4 className="text-xs font-mono uppercase text-muted-foreground">Finding Scope & Methodology</h4>
                            <div className="p-4 bg-background border border-border space-y-4">
                              <p className="text-sm text-foreground leading-relaxed">{finding.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border border-dashed">
                                <div>
                                  <div className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Population Filter</div>
                                  <div className="space-y-1">
                                    {finding.populationFilter.map(f => (
                                      <Badge key={f} variant="secondary" className="font-mono text-[10px] mr-2 mb-1">{f}</Badge>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-xs font-mono text-muted-foreground">Target N={finding.populationSize}</div>
                                </div>
                                
                                <div>
                                  <div className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Statistical Caveat</div>
                                  <div className="text-xs leading-relaxed text-muted-foreground bg-primary/5 p-3 border-l-2 border-primary">
                                    <strong className="text-foreground capitalize">{finding.confidence} confidence.</strong> Strong negative correlation (r=-0.78, p=0.012). App signals are supplementary and do not prove causation. 
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>
                          
                          {/* Source Evidence */}
                          <section className="space-y-3">
                            <h4 className="text-xs font-mono uppercase text-muted-foreground">Source Triangulation</h4>
                            <div className="space-y-2">
                              <div className="flex flex-col md:flex-row md:items-center justify-between p-3 border border-border bg-background gap-3">
                                <div>
                                  <div className="font-medium text-sm flex items-center gap-2 mb-1">{finding.evidenceSource} <Badge variant="outline" className="text-[10px] uppercase">Primary</Badge></div>
                                  <div className="text-xs text-muted-foreground font-mono">Coverage: 100% of selected population (3/3 cases)</div>
                                </div>
                                <Button variant="ghost" size="sm" className="font-mono text-xs uppercase text-primary shrink-0 self-start md:self-center">View Responses</Button>
                              </div>
                              <div className="flex flex-col md:flex-row md:items-center justify-between p-3 border border-border bg-background gap-3">
                                <div>
                                  <div className="font-medium text-sm flex items-center gap-2 mb-1">App Signals: Digital Ledger <Badge variant="outline" className="text-[10px] uppercase">Secondary</Badge></div>
                                  <div className="text-xs text-muted-foreground font-mono">Coverage: Corroborates 0 active logins in last 30d</div>
                                </div>
                                <Button variant="ghost" size="sm" className="font-mono text-xs uppercase text-primary shrink-0 self-start md:self-center">View Telemetry</Button>
                              </div>
                            </div>
                          </section>

                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="bg-card border-border max-w-xl">
          <DialogHeader><DialogTitle>Create accountable action</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">Objective<input value={form.title} onChange={event => setForm({...form,title:event.target.value})} className="border border-border bg-background p-2" placeholder="What outcome should change?" /></label>
            <label className="grid gap-2 text-sm">Description<textarea value={form.description} onChange={event => setForm({...form,description:event.target.value})} className="border border-border bg-background p-2 min-h-24" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-2 text-sm">Owner<select value={form.assignee} onChange={event => setForm({...form,assignee:event.target.value})} className="border border-border bg-background p-2"><option>Priya Shah</option><option>Rahul Deshmukh</option><option>Sneha Patil</option></select></label>
              <label className="grid gap-2 text-sm">Due date<input type="date" defaultValue="2026-09-15" className="border border-border bg-background p-2" /></label>
            </div>
            <label className="grid gap-2 text-sm">Linked finding<select value={form.findingId} onChange={event => setForm({...form,findingId:event.target.value})} className="border border-border bg-background p-2"><option value="">No finding</option>{findings.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <Button onClick={submitAction}>Create Action</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}