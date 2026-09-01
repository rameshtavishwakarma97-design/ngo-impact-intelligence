import React from "react";
import { MOUNT_DATA } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, AlertTriangle, ArrowRight, Clock3 } from "lucide-react";
import { Link } from "wouter";
import { useDataStore } from "@/lib/store";

function MetricCard({ title, value, baseline, trend }: { title: string, value: string | number, baseline?: string, trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <Card className="p-5 flex flex-col justify-between h-32 border-border/50 bg-background/50 hover:bg-card transition-colors">
      <div className="flex justify-between items-start">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{title}</h3>
        {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-primary" />}
      </div>
      <div>
        <div className="text-3xl font-light font-mono tracking-tight">{value}</div>
        {baseline && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            vs {baseline} baseline
          </div>
        )}
      </div>
    </Card>
  );
}

export default function Monitor() {
  const { actions } = useDataStore();
  const formatPercent = (val: number) => `${Math.round(val * 100)}%`;
  
  const pendingActions = actions.filter(a => a.status === 'pending').length;

  return (
    <div className="max-w-[1400px] mx-auto p-8 lg:p-12 space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-medium tracking-tight mb-2">Control Centre</h1>
          <p className="text-muted-foreground">High-level operational health and attention signals.</p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="font-mono text-xs uppercase bg-primary/5 text-primary border-primary/20">
            System Normal
          </Badge>
        </div>
      </header>

      {/* Top Level Measures */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border p-px">
        <MetricCard 
          title="Active Beneficiaries" 
          value={MOUNT_DATA.program.totalBeneficiaries} 
        />
        <MetricCard 
          title="Training Completion" 
          value={formatPercent(MOUNT_DATA.program.trainingCompletion)} 
        />
        <MetricCard 
          title="Business Activity" 
          value={formatPercent(MOUNT_DATA.program.businessActivity)} 
          baseline={formatPercent(MOUNT_DATA.program.businessActivityBaseline)}
          trend="up"
        />
        <MetricCard 
          title="Digital Adoption" 
          value={formatPercent(MOUNT_DATA.program.digitalAdoption)} 
          baseline={formatPercent(MOUNT_DATA.program.digitalAdoptionBaseline)}
          trend="up"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Funnel & Localities */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Journey Funnel */}
          <section>
            <h2 className="text-sm font-semibold mb-4 border-b border-border pb-2 flex justify-between">
              <span>Program Journey Conversion (Funnel)</span>
              <span className="font-mono text-xs text-muted-foreground font-normal">N = {MOUNT_DATA.program.totalBeneficiaries}</span>
            </h2>
            <div className="flex items-center gap-2 h-36 p-6 bg-card border border-border">
              {[
                { stage: 'M0 Baseline', value: 180, label: '100%' },
                { stage: 'Training', value: 160, label: '89%' },
                { stage: 'M3 Survey', value: 142, label: '79%' },
                { stage: 'M6 Survey', value: 98, label: '54%' }
              ].map((step, i, arr) => (
                <React.Fragment key={step.stage}>
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{step.stage}</div>
                    <div>
                      <div className="text-3xl font-light font-mono">{step.value}</div>
                      <div className="text-sm font-mono text-primary/80">{step.label}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-8 flex justify-center text-muted">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-4 border-b border-border pb-2 flex justify-between"><span>Outcome Trend</span><span className="font-mono text-xs text-muted-foreground font-normal">M0 → M6</span></h2>
            <Card className="p-6 bg-card">
              <div className="grid grid-cols-4 gap-5 items-end h-44">
                {[{m:"M0",v:61},{m:"M2",v:66},{m:"M3",v:71},{m:"M6",v:76}].map(point => <div key={point.m} className="h-full flex flex-col justify-end gap-2"><div className="text-center text-xs font-mono">{point.v}%</div><div className="bg-primary/80 hover:bg-primary transition-colors" style={{height:`${point.v}%`}}/><div className="text-center text-[10px] font-mono text-muted-foreground">{point.m}</div></div>)}
              </div>
              <p className="text-xs text-muted-foreground mt-5">Business activity increased 15 percentage points from baseline across the observed population.</p>
            </Card>
          </section>

          {/* Locality Comparison */}
          <section>
            <h2 className="text-sm font-semibold mb-4 border-b border-border pb-2 flex justify-between">
              <span>Locality Performance Breakdown</span>
            </h2>
            <div className="space-y-1">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-mono text-muted-foreground uppercase">
                <div className="col-span-3">Locality</div>
                <div className="col-span-2 text-right">Pop</div>
                <div className="col-span-3">Business Act.</div>
                <div className="col-span-3">Digital Adop.</div>
                <div className="col-span-1 text-center">Attn</div>
              </div>
              
              {MOUNT_DATA.localities.map((loc) => (
                <Link key={loc.id} href={`/investigate?locality=${loc.id}`} className="grid grid-cols-12 gap-4 items-center px-3 py-3 bg-card border border-border/50 hover:border-primary/50 transition-colors group cursor-pointer">
                  <div className="col-span-3 font-medium group-hover:text-primary transition-colors">{loc.name}</div>
                  <div className="col-span-2 text-right font-mono text-sm">{loc.beneficiaries}</div>
                  
                  {/* Business Activity Bar */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary overflow-hidden">
                      <div className="h-full bg-foreground" style={{ width: formatPercent(loc.businessActivity) }} />
                    </div>
                    <span className="font-mono text-xs w-8">{formatPercent(loc.businessActivity)}</span>
                  </div>

                  {/* Digital Adoption Bar */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary overflow-hidden">
                      <div className="h-full bg-muted-foreground" style={{ width: formatPercent(loc.digitalAdoption) }} />
                    </div>
                    <span className="font-mono text-xs w-8">{formatPercent(loc.digitalAdoption)}</span>
                  </div>

                  <div className="col-span-1 flex justify-center">
                    {loc.attentionCases > 0 ? (
                      <Badge variant={loc.attentionCases > 5 ? "destructive" : "secondary"} className="font-mono px-1.5 min-w-[24px] justify-center">
                        {loc.attentionCases}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground font-mono text-xs">-</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Attention List */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                Attention Required
              </h2>
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5">19 Total</span>
            </div>
            
            <div className="space-y-3">
              <Card className="p-4 border-l-2 border-l-primary bg-card hover:border-l-primary/70 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider text-primary border-primary/20">Cluster Anomaly</Badge>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <p className="text-sm font-medium leading-snug mb-3">
                  Kothrud has 12 attention cases; three paused businesses are tailors reporting low customer demand.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider">
                  <Link href="/investigate" className="text-primary hover:underline flex items-center gap-1">
                    Investigate <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>

              <Card className="p-4 border-l-2 border-l-muted bg-card">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">Missing Data</Badge>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
                <p className="text-sm text-muted-foreground leading-snug mb-3">
                  24 beneficiaries in Hadapsar have not completed the M3 Post-Training survey.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider">
                  <Link href="/operations" className="text-foreground hover:underline flex items-center gap-1">
                    View Operations <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>

              <Card className="p-4 border-l-2 border-l-muted bg-card">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">Follow-up</Badge>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-sm text-muted-foreground leading-snug mb-3">
                  Meena (Home-based Tailor, Kothrud) reported business pause.
                </p>
                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider">
                  <Link href="/beneficiaries/b1" className="text-foreground hover:underline flex items-center gap-1 text-primary">
                    View Journey <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            </div>
            
            {pendingActions > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <Link href="/actions" className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer group">
                  <div>
                    <div className="text-sm font-medium text-primary">Pending Actions</div>
                    <div className="text-xs text-muted-foreground">You have {pendingActions} uncompleted action items.</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
            <div className="mt-8">
              <h2 className="text-sm font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2"><Clock3 className="w-4 h-4"/>Recent Activity</h2>
              <div className="divide-y divide-border border border-border bg-card text-sm">
                <div className="p-3"><strong>M3 survey batch validated</strong><p className="text-xs text-muted-foreground mt-1">142 responses · 42 minutes ago</p></div>
                <div className="p-3"><strong>Attendance log submitted</strong><p className="text-xs text-muted-foreground mt-1">Hadapsar · Today</p></div>
                <div className="p-3"><strong>Finding linked to action</strong><p className="text-xs text-muted-foreground mt-1">Kothrud tailors · Yesterday</p></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}