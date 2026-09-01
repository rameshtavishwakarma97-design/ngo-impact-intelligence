import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Download, FileText, Calendar, Filter } from "lucide-react";
import { MOUNT_DATA } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Reports() {
  const { toast } = useToast();
  const [tag, setTag] = useState("All");

  const handleExport = (reportName: string) => {
    toast({
      title: "Export Started",
      description: `${reportName} is being generated. You will be notified when it's ready.`,
    });
  };

  const reports = [
    { id: 1, name: "Q3 FY24 Impact Summary", type: "PDF", date: "Oct 15, 2024", size: "2.4 MB", tag: "Quarterly" },
    { id: 2, name: "Beneficiary Progress Data", type: "CSV", date: "Oct 12, 2024", size: "156 KB", tag: "Raw Data" },
    { id: 3, name: "Intervention Attendance Log", type: "CSV", date: "Oct 10, 2024", size: "89 KB", tag: "Operations" },
    { id: 4, name: "Market-Linkage Findings", type: "PDF", date: "Oct 05, 2024", size: "1.1 MB", tag: "Investigation" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-8 lg:p-12 space-y-8">
      <header className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">
            <span>{MOUNT_DATA.program.name}</span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span>Reports</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight mb-2">Reports & Exports</h1>
        </div>
        <div className="flex gap-2">
          <select value={tag} onChange={event => setTag(event.target.value)} className="border border-border bg-background px-3 text-xs font-mono uppercase"><option>All</option><option>Quarterly</option><option>Raw Data</option><option>Operations</option><option>Investigation</option></select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border border-border">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="font-medium flex items-center gap-2"><FileBarChart className="w-4 h-4" /> Available Reports</h2>
            </div>
            <div className="divide-y divide-border">
              {reports.filter(report => tag === "All" || report.tag === tag).map(report => (
                <div key={report.id} className="p-5 flex items-center justify-between hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {report.type === 'PDF' ? <FileText className="w-6 h-6 text-primary/70" /> : <FileBarChart className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{report.name}</h4>
                      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                        <span>{report.size}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{report.tag}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleExport(report.name)} className="font-mono text-xs uppercase">
                    <Download className="w-3 h-3 mr-2" /> Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-card border border-border">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Generate Custom Report</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dataset</label>
                <select className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option>All Beneficiaries</option>
                  <option>Active Cohorts</option>
                  <option>Dropped Participants</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="format" value="csv" defaultChecked className="accent-primary" /> CSV
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="format" value="pdf" className="accent-primary" /> PDF Summary
                  </label>
                </div>
              </div>
              <Button className="w-full font-mono text-xs uppercase" onClick={() => handleExport("Custom Report")}>
                Generate & Export
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}