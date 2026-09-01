import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, ChevronRight, FileSearch, PenTool, ArrowRight, Activity, Percent, Layers } from "lucide-react";
import { MOUNT_DATA } from "@/lib/data";
import { useDataStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Investigate() {
  const [, setLocation] = useLocation();
  const { addFinding } = useDataStore();
  const [filterStep, setFilterStep] = useState(0);
  const [queryOpen, setQueryOpen] = useState(false);
  const [question, setQuestion] = useState("Why is business activity lower in Kothrud?");

  const steps = [
    { label: "All Beneficiaries", count: 180, active: true },
    { label: "Locality: Kothrud", count: 52, active: filterStep >= 1 },
    { label: "Profession: Tailor", count: 17, active: filterStep >= 2 },
    { label: "Status: Paused", count: 3, active: filterStep >= 3 },
  ];

  const handleNextStep = () => {
    if (filterStep < 3) setFilterStep(s => s + 1);
  };

  const handleCreateFinding = () => {
    const finding = addFinding({
      title: "Low customer demand causing business pauses among tailors",
      description: "3 out of 17 tailors in Kothrud have paused their businesses. Primary surveys indicate a sharp drop in local customer walk-ins.",
      populationSize: 3,
      populationFilter: ["Locality: Kothrud", "Profession: Tailor", "Status: Paused"],
      evidenceSource: "M6 Primary Survey",
      confidence: "high"
    });
    setLocation('/actions');
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 lg:p-12 h-[calc(100vh-3.5rem)] flex flex-col">
      <header className="mb-8 shrink-0 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">
            <span>{MOUNT_DATA.program.name}</span>
            <span className="w-1 h-1 bg-border rounded-full" />
            <span>Investigation</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight">{question}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setQueryOpen(true)} variant="outline" className="font-mono text-xs uppercase tracking-wider">
            <Search className="w-4 h-4 mr-2" /> Query Data
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex gap-8">
        
        {/* Left: Population Funnel */}
        <div className="w-80 shrink-0 flex flex-col bg-card border border-border">
          <div className="p-4 border-b border-border bg-background/50">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Filter className="w-3 h-3" /> Population Builder
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {steps.map((step, i) => (
              <div 
                key={step.label} 
                className={`flex flex-col p-4 border border-transparent transition-all ${
                  step.active ? 'bg-background border-border' : 'opacity-40 grayscale pointer-events-none'
                } ${i === filterStep ? 'border-primary/50 bg-primary/5 shadow-sm' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{step.label}</span>
                  <span className="font-mono text-xs bg-muted px-2 py-0.5">{step.count}</span>
                </div>
                {i < 3 && step.active && i === filterStep && (
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border border-dashed flex justify-between items-center">
                    <span>{Math.round((steps[i+1].count / step.count) * 100)}% conversion</span>
                  </div>
                )}
              </div>
            ))}

            {filterStep < 3 && (
              <Button 
                variant="outline" 
                className="mt-4 w-full justify-between group font-mono text-xs uppercase"
                onClick={handleNextStep}
              >
                Apply Next Filter
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>

          <div className="p-4 bg-muted/50 border-t border-border">
            <h4 className="text-xs font-mono uppercase text-muted-foreground mb-2">Target Population</h4>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-light font-mono leading-none">{steps[filterStep].count}</div>
              <div className="text-xs text-muted-foreground font-mono">/ 180 ({(steps[filterStep].count / 180 * 100).toFixed(1)}%)</div>
            </div>
          </div>
        </div>

        {/* Right: Evidence & Analysis Workspace */}
        <div className="flex-1 flex flex-col min-h-0 bg-card border border-border">
          {filterStep < 3 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
              <Layers className="w-12 h-12 opacity-20" />
              <p className="font-mono text-sm uppercase tracking-wider">Isolate a target population to reveal insights.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <Tabs defaultValue="evidence" className="w-full flex-1 flex flex-col h-full">
                <div className="border-b border-border bg-background/50 px-2 flex justify-between items-center">
                  <TabsList className="bg-transparent h-12 p-0 space-x-6">
                    <TabsTrigger value="evidence" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 font-mono text-xs uppercase tracking-wider px-0">
                      <FileSearch className="w-3 h-3 mr-2" /> Evidence Panel
                    </TabsTrigger>
                    <TabsTrigger value="analysis" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 font-mono text-xs uppercase tracking-wider px-0">
                      <Percent className="w-3 h-3 mr-2" /> Statistical Analysis
                    </TabsTrigger>
                    <TabsTrigger value="waterfall" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 font-mono text-xs uppercase tracking-wider px-0">
                      <Activity className="w-3 h-3 mr-2" /> Segmentation
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">M6 Primary Survey</Badge>
                    <Badge variant="secondary" className="font-mono text-[10px]">App Signals</Badge>
                  </div>
                </div>

                <TabsContent value="evidence" className="flex-1 overflow-y-auto p-6 space-y-6 mt-0">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono uppercase text-muted-foreground">Primary Survey Data</h4>
                      <Card className="p-4 bg-background">
                        <div className="space-y-3">
                          <div className="flex justify-between items-end border-b border-border pb-2">
                            <span className="text-sm">Reported "Low Customer Walk-ins"</span>
                            <span className="font-mono font-medium text-primary">3/3 (100%)</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-border pb-2">
                            <span className="text-sm">Raw Material Shortage</span>
                            <span className="font-mono text-muted-foreground">0/3 (0%)</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-sm">Health Issues</span>
                            <span className="font-mono text-muted-foreground">0/3 (0%)</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-mono uppercase text-muted-foreground">Supplementary App Signals</h4>
                      <Card className="p-4 bg-background">
                        <div className="space-y-3">
                          <div className="flex justify-between items-end border-b border-border pb-2">
                            <span className="text-sm">Digital Ledger Usage (last 30d)</span>
                            <span className="font-mono font-medium text-destructive">0 active</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-border pb-2">
                            <span className="text-sm">Community Group Logins</span>
                            <span className="font-mono">1 active</span>
                          </div>
                        </div>
                        <p className="text-[10px] uppercase font-mono text-muted-foreground mt-4">
                          * App signals are supplementary (Correlation, not causation)
                        </p>
                      </Card>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h4 className="text-xs font-mono uppercase text-muted-foreground mb-4 flex items-center gap-2">
                      <PenTool className="w-3 h-3" /> Analyst Synthesis
                    </h4>
                    <div className="p-4 bg-muted/30 border border-border text-sm leading-relaxed space-y-4">
                      <p>
                        The drop in business activity in Kothrud is highly concentrated among home-based tailors. 
                        By isolating the 3 paused cases, primary survey data uniformly points to <strong>low customer demand</strong> rather than capital, health, or supply chain issues.
                      </p>
                      <p>
                        This correlates with external geographic data showing Kothrud's traditional marketplace has shifted, requiring new market linkages for home-based workers.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="flex-1 overflow-y-auto p-6 mt-0">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-mono uppercase text-muted-foreground">Method Selection</h4>
                      <select className="bg-background border border-border px-3 py-1 text-xs font-mono focus:outline-none">
                        <option>Pearson Correlation</option>
                        <option>Chi-Square Test</option>
                        <option>T-Test (Independent)</option>
                      </select>
                    </div>
                    
                    <Card className="p-6 bg-background border-primary/20">
                      <h5 className="font-medium mb-4">Correlation: Business Status vs. Market Linkage Needs</h5>
                      <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">r-value (Pearson)</div>
                          <div className="text-2xl font-mono">-0.78</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">p-value</div>
                          <div className="text-2xl font-mono">0.012</div>
                        </div>
                      </div>
                      <div className="p-3 bg-primary/10 text-primary text-sm border-l-2 border-primary">
                        <strong>Strong negative correlation</strong> found between business activity and reported customer demand shortage. Statistically significant (p &lt; 0.05).
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="waterfall" className="flex-1 overflow-y-auto p-6 mt-0">
                  <h4 className="text-xs font-mono uppercase text-muted-foreground mb-6">Segmentation: Tailors by Locality</h4>
                  <div className="space-y-4">
                    {/* Visual bar charts simulating segmentation */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Hadapsar (N=22)</span>
                        <span className="font-mono">82% Active</span>
                      </div>
                      <div className="h-4 bg-secondary w-full flex">
                        <div className="h-full bg-primary" style={{ width: '82%' }} />
                        <div className="h-full bg-muted-foreground/30" style={{ width: '18%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pimpri (N=18)</span>
                        <span className="font-mono">78% Active</span>
                      </div>
                      <div className="h-4 bg-secondary w-full flex">
                        <div className="h-full bg-primary" style={{ width: '78%' }} />
                        <div className="h-full bg-muted-foreground/30" style={{ width: '22%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-foreground">Kothrud (N=17)</span>
                        <span className="font-mono text-destructive font-medium">35% Active</span>
                      </div>
                      <div className="h-4 bg-secondary w-full flex">
                        <div className="h-full bg-destructive" style={{ width: '35%' }} />
                        <div className="h-full bg-muted-foreground/30" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <div className="p-4 border-t border-border bg-background flex justify-between items-center shrink-0">
                  <span className="text-sm text-muted-foreground font-mono">Target N={steps[filterStep].count}</span>
                  <Button onClick={handleCreateFinding} className="gap-2 font-mono text-xs uppercase tracking-wider">
                    Create Finding & Action <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

              </Tabs>
            </div>
          )}
        </div>

      </div>
      <Dialog open={queryOpen} onOpenChange={setQueryOpen}>
        <DialogContent className="bg-card border-border max-w-xl">
          <DialogHeader><DialogTitle>Start an investigation</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">Analytical question<textarea value={question} onChange={event => setQuestion(event.target.value)} className="border border-border bg-background p-3 min-h-24"/></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-2 text-sm">Outcome<select className="border border-border bg-background p-2"><option>Business activity</option><option>Income progression</option><option>Digital adoption</option></select></label>
              <label className="grid gap-2 text-sm">Comparison<select className="border border-border bg-background p-2"><option>Across localities</option><option>Across cohorts</option><option>Against baseline</option></select></label>
            </div>
            <Button onClick={() => { setFilterStep(0); setQueryOpen(false); }}>Build Population</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}