import { useLocation, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Briefcase, Activity, Calendar, FileText, ChevronRight, PenTool } from "lucide-react";
import { useDataStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function BeneficiaryDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { beneficiaries } = useDataStore();
  const { toast } = useToast();
  const [interactionOpen, setInteractionOpen] = useState(false);
  
  const beneficiary = beneficiaries.find(b => b.id === id) || beneficiaries[0];

  return (
    <div className="max-w-[1400px] mx-auto p-8 lg:p-12 space-y-8">
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-6 uppercase tracking-widest">
        <button onClick={() => setLocation('/beneficiaries')} className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Beneficiaries
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{beneficiary.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile */}
        <div className="space-y-6">
          <Card className="p-6 bg-card">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center text-2xl font-mono text-muted-foreground rounded-full">
                {beneficiary.name.charAt(0)}
              </div>
              <Badge variant={beneficiary.status === 'active' ? 'default' : beneficiary.status === 'paused' ? 'secondary' : 'destructive'} className="font-mono uppercase">
                {beneficiary.status}
              </Badge>
            </div>
            
            <h1 className="text-2xl font-medium tracking-tight mb-1">{beneficiary.name}</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-6">ID: {beneficiary.id} • Age {beneficiary.age}</p>
            
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{beneficiary.profession}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{beneficiary.localityId.toUpperCase()} Location</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Joined Jan 2024 (Cohort 2)</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card space-y-6">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Metrics Snapshot</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Business Activity</span>
                  <span className="font-mono">{Math.round(beneficiary.businessActivity * 100)}%</span>
                </div>
                <div className="h-1.5 bg-secondary w-full"><div className="h-full bg-foreground" style={{ width: `${beneficiary.businessActivity * 100}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Digital Adoption</span>
                  <span className="font-mono">{Math.round(beneficiary.digitalAdoption * 100)}%</span>
                </div>
                <div className="h-1.5 bg-secondary w-full"><div className="h-full bg-foreground" style={{ width: `${beneficiary.digitalAdoption * 100}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Program Attendance</span>
                  <span className="font-mono">{Math.round(beneficiary.attendance * 100)}%</span>
                </div>
                <div className="h-1.5 bg-secondary w-full"><div className="h-full bg-primary" style={{ width: `${beneficiary.attendance * 100}%` }} /></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Journey */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" /> 
              Intervention Journey
            </h2>
            <Button onClick={() => setInteractionOpen(true)} variant="outline" size="sm" className="font-mono text-xs uppercase">
              <PenTool className="w-3 h-3 mr-2" /> Log Interaction
            </Button>
          </div>

          <div className="space-y-4">
            {beneficiary.journey.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground bg-card border border-border">
                <FileText className="w-8 h-8 mx-auto mb-4 opacity-20" />
                <p>No journey data recorded yet.</p>
              </div>
            ) : (
              beneficiary.journey.map((entry, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="w-16 shrink-0 pt-1 flex flex-col items-center">
                    <div className="text-xs font-mono font-medium">{entry.month}</div>
                    <div className="w-px h-full bg-border group-last:bg-transparent mt-2" />
                  </div>
                  
                  <Card className="flex-1 p-5 bg-card border-border/50 group-hover:border-primary/30 transition-colors mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">{entry.stage}</Badge>
                      <Badge variant="secondary" className="font-mono text-[10px] uppercase bg-muted text-muted-foreground">{entry.evidenceType.replace('_', ' ')}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {entry.intervention && (
                        <div>
                          <span className="text-xs font-mono text-muted-foreground uppercase mr-2">Intervention:</span>
                          <span className="text-sm font-medium">{entry.intervention}</span>
                        </div>
                      )}
                      {entry.outcome && (
                        <div className="p-3 bg-muted/30 border-l-2 border-l-primary/50 text-sm leading-relaxed text-muted-foreground">
                          {entry.outcome}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Dialog open={interactionOpen} onOpenChange={setInteractionOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Log field interaction</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">Observed status<select className="border border-border bg-background p-2"><option>Improving</option><option>Stable</option><option>Declining</option></select></label>
            <label className="grid gap-2 text-sm">Barrier category<select className="border border-border bg-background p-2"><option>Customer demand</option><option>Working capital</option><option>Health / caregiving</option><option>Supply chain</option></select></label>
            <label className="grid gap-2 text-sm">Field note<textarea className="border border-border bg-background p-2 min-h-28" placeholder="Record direct observation or beneficiary feedback."/></label>
            <Button onClick={() => { setInteractionOpen(false); toast({title:"Interaction logged",description:"The field note was added to this beneficiary’s longitudinal journey."}); }}>Save Interaction</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}