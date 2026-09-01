import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, ShieldCheck, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [qualityGate, setQualityGate] = useState(true);
  const sources = [
    { name: "M0 Baseline Assessment", records: 180, status: "validated", updated: "12 Aug 2026" },
    { name: "M3 Post-Training Survey", records: 142, status: "attention", updated: "29 Aug 2026" },
    { name: "Digital Ledger Signals", records: 104, status: "synced", updated: "31 Aug 2026" },
  ];
  return (
    <div className="max-w-[1200px] mx-auto p-8 lg:p-12 space-y-8">
      <header><p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Administration</p><h1 className="text-4xl font-medium tracking-tight">Data & Settings</h1></header>
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card">
          <div className="p-5 border-b border-border flex items-center justify-between"><h2 className="font-medium flex items-center gap-2"><Database className="w-4 h-4"/> Data sources</h2><Button onClick={() => toast({title:"Import simulated", description:"A validation run was queued for the uploaded source."})} size="sm"><Upload className="w-3 h-3 mr-2"/>Import data</Button></div>
          <div className="divide-y divide-border">{sources.map(source => <div key={source.name} className="p-5 flex items-center justify-between"><div><p className="font-medium">{source.name}</p><p className="text-xs text-muted-foreground mt-1">{source.records} records · Updated {source.updated}</p></div><Badge variant={source.status === "attention" ? "destructive" : "outline"} className="font-mono text-[10px] uppercase">{source.status}</Badge></div>)}</div>
        </Card>
        <div className="space-y-6">
          <Card className="p-5 bg-card"><h3 className="font-medium flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4"/> Quality controls</h3><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={qualityGate} onChange={event => setQualityGate(event.target.checked)} className="mt-1 accent-primary"/><span>Require validation before survey data can enter monitoring metrics.</span></label></Card>
          <Card className="p-5 bg-card"><h3 className="font-medium mb-4">Audit readiness</h3><div className="space-y-3 text-sm">{["Source provenance visible","Population denominators shown","Action ownership assigned"].map(item => <div key={item} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary"/>{item}</div>)}</div></Card>
        </div>
      </div>
    </div>
  );
}