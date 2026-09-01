import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";
import { MOUNT_DATA } from "@/lib/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Programs() {
  const { programs } = MOUNT_DATA;
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [newProgramOpen, setNewProgramOpen] = useState(false);
  const [createdPrograms, setCreatedPrograms] = useState<typeof programs>([]);
  const [name, setName] = useState("");
  const visiblePrograms = useMemo(() => [...createdPrograms, ...programs].filter(program =>
    program.name.toLowerCase().includes(query.toLowerCase()) && (status === "all" || program.status === status)
  ), [createdPrograms, programs, query, status]);

  const createProgram = () => {
    if (!name.trim()) return;
    setCreatedPrograms(current => [{
      id: `p${Date.now()}`, name: name.trim(), manager: "Priya Shah", totalBeneficiaries: 0,
      status: "draft", cohorts: 0, startDate: new Date().toISOString(),
    }, ...current]);
    setName("");
    setNewProgramOpen(false);
    toast({ title: "Draft program created", description: "Program setup is ready for cohorts and beneficiary imports." });
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 lg:p-12 space-y-8">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-medium tracking-tight mb-2">Programs</h1>
          <p className="text-muted-foreground">Manage active programs, cohorts, and resources.</p>
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={event => setStatus(event.target.value)} className="border border-border bg-background px-3 text-xs font-mono uppercase">
            <option value="all">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="completed">Completed</option>
          </select>
          <Button onClick={() => setNewProgramOpen(true)} className="font-mono text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-2" /> New Program
          </Button>
        </div>
      </header>

      <div className="bg-card border border-border">
        <div className="p-3 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search programs…" className="w-full border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </div>
        </div>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-mono text-muted-foreground uppercase tracking-wider bg-background/50">
          <div className="col-span-4">Program Name</div>
          <div className="col-span-2">Manager</div>
          <div className="col-span-2">Start Date</div>
          <div className="col-span-1 text-right">Cohorts</div>
          <div className="col-span-2 text-right">Beneficiaries</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {visiblePrograms.map(program => (
            <Link key={program.id} href={`/programs/${program.id}`} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-accent/30 transition-colors group cursor-pointer">
              <div className="col-span-4 font-medium group-hover:text-primary transition-colors flex items-center justify-between pr-4">
                {program.name}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">{program.manager}</div>
              <div className="col-span-2 text-sm font-mono text-muted-foreground">{new Date(program.startDate).toLocaleDateString()}</div>
              <div className="col-span-1 text-right font-mono text-sm">{program.cohorts > 0 ? program.cohorts : '-'}</div>
              <div className="col-span-2 text-right font-mono text-sm">{program.totalBeneficiaries > 0 ? program.totalBeneficiaries : '-'}</div>
              <div className="col-span-1 text-right">
                <Badge variant={program.status === 'active' ? 'default' : program.status === 'completed' ? 'secondary' : 'outline'} className="font-mono text-[10px] uppercase">
                  {program.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Dialog open={newProgramOpen} onOpenChange={setNewProgramOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Create draft program</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">Program name<input value={name} onChange={event => setName(event.target.value)} className="border border-border bg-background p-2" /></label>
            <label className="grid gap-2 text-sm">Program manager<input value="Priya Shah" readOnly className="border border-border bg-muted p-2" /></label>
            <Button onClick={createProgram}>Create Program</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}