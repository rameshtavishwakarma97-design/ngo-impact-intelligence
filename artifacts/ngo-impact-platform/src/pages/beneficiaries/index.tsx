import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Plus } from "lucide-react";
import { useDataStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Beneficiaries() {
  const { beneficiaries, addBeneficiary } = useDataStore();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", age: "35", profession: "", localityId: "l1" });
  const visible = useMemo(() => beneficiaries.filter(item => {
    const matches = `${item.name} ${item.id} ${item.profession}`.toLowerCase().includes(query.toLowerCase());
    return matches && (status === "all" || item.status === status);
  }), [beneficiaries, query, status]);

  const exportCsv = () => {
    const csv = ["ID,Name,Age,Profession,Locality,Status", ...visible.map(item => [item.id, item.name, item.age, item.profession, item.localityId, item.status].join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "beneficiaries.csv"; anchor.click(); URL.revokeObjectURL(url);
    toast({ title: "Export prepared", description: `${visible.length} beneficiary records exported.` });
  };
  const submitBeneficiary = () => {
    if (!form.name.trim() || !form.profession.trim()) return;
    addBeneficiary({ name: form.name.trim(), age: Number(form.age), profession: form.profession.trim(), localityId: form.localityId, status: "active", businessActivity: 0, digitalAdoption: 0, attendance: 0 });
    setAddOpen(false);
    setForm({ name: "", age: "35", profession: "", localityId: "l1" });
    toast({ title: "Beneficiary added", description: "The new profile is available in the beneficiary register." });
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 space-y-6 md:space-y-8 flex flex-col min-h-full md:h-[calc(100vh-3.5rem)]">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-2 md:mb-4 shrink-0">
        <div>
          <h1 className="text-4xl font-medium tracking-tight mb-2">Beneficiaries</h1>
          <p className="text-muted-foreground">Manage individual profiles and track journeys.</p>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2">
          <Button onClick={exportCsv} variant="outline" className="font-mono text-xs uppercase tracking-wider">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <select value={status} onChange={event => setStatus(event.target.value)} className="border border-border bg-background px-3 text-xs font-mono uppercase">
            <option value="all">All statuses</option><option value="active">Active</option><option value="paused">Paused</option><option value="dropped">Dropped</option>
          </select>
          <Button onClick={() => setAddOpen(true)} className="font-mono text-xs uppercase tracking-wider col-span-2 md:col-span-1">
            <Plus className="w-4 h-4 mr-2" /> Add New
          </Button>
        </div>
      </header>

      <div className="bg-card border border-border flex flex-col min-h-0 flex-1">
        {/* Toolbar */}
        <div className="p-3 border-b border-border bg-background/50 flex flex-col md:flex-row gap-3 md:justify-between md:items-center shrink-0">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={event => setQuery(event.target.value)} type="text" placeholder="Search by name, ID, or profession..." className="w-full pl-9 pr-4 py-1.5 text-sm bg-card border border-border focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Showing {visible.length} of {beneficiaries.length} records
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-mono text-muted-foreground uppercase tracking-wider bg-background/50 shrink-0">
          <div className="col-span-3">Name / ID</div>
          <div className="col-span-2">Profession</div>
          <div className="col-span-2">Locality</div>
          <div className="col-span-2 text-right">Business Act.</div>
          <div className="col-span-2 text-right">Attendance</div>
          <div className="col-span-1 text-center">Status</div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1 divide-y divide-border">
          {visible.map(ben => (
            <Link key={ben.id} href={`/beneficiaries/${ben.id}`} className="grid grid-cols-2 md:grid-cols-12 gap-4 p-4 items-center hover:bg-accent/30 transition-colors group cursor-pointer bg-card">
              <div className="col-span-2 md:col-span-3 font-medium group-hover:text-primary transition-colors flex items-center gap-3">
                <div className="w-8 h-8 bg-muted border border-border flex items-center justify-center text-xs font-mono text-muted-foreground rounded-full">
                  {ben.name.charAt(0)}
                </div>
                <div>
                  <div className="leading-none mb-1">{ben.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">{ben.id} • Age {ben.age}</div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 text-sm text-muted-foreground">{ben.profession}</div>
              <div className="col-span-1 md:col-span-2 text-sm text-muted-foreground text-right md:text-left">{ben.localityId.toUpperCase()}</div>
              
              <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end gap-2">
                <div className="w-16 h-1.5 bg-secondary overflow-hidden">
                  <div className="h-full bg-foreground" style={{ width: `${ben.businessActivity * 100}%` }} />
                </div>
                <span className="font-mono text-xs w-8 text-right">{Math.round(ben.businessActivity * 100)}%</span>
              </div>
              
              <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                <div className="w-16 h-1.5 bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${ben.attendance * 100}%` }} />
                </div>
                <span className="font-mono text-xs w-8 text-right">{Math.round(ben.attendance * 100)}%</span>
              </div>
              
              <div className="col-span-2 md:col-span-1 flex justify-start md:justify-center">
                <Badge variant={ben.status === 'active' ? 'default' : ben.status === 'paused' ? 'secondary' : 'destructive'} className="font-mono text-[10px] uppercase">
                  {ben.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Add beneficiary</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <label className="col-span-2 grid gap-2 text-sm">Full name<input value={form.name} onChange={event => setForm({...form, name:event.target.value})} className="border border-border bg-background p-2" /></label>
            <label className="grid gap-2 text-sm">Age<input type="number" min="18" value={form.age} onChange={event => setForm({...form, age:event.target.value})} className="border border-border bg-background p-2" /></label>
            <label className="grid gap-2 text-sm">Locality<select value={form.localityId} onChange={event => setForm({...form, localityId:event.target.value})} className="border border-border bg-background p-2"><option value="l1">Hadapsar</option><option value="l2">Kothrud</option><option value="l3">Pimpri</option></select></label>
            <label className="col-span-2 grid gap-2 text-sm">Profession<input value={form.profession} onChange={event => setForm({...form, profession:event.target.value})} className="border border-border bg-background p-2" /></label>
            <Button onClick={submitBeneficiary} className="col-span-2">Add Beneficiary</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}