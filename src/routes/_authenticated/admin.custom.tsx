import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { listCustomRequestsAdmin, updateCustomRequestStatus } from "@/lib/custom.functions";
import { ChevronDown, ChevronUp, PenTool, Mail, Phone, Ruler, Hash, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/custom")({
  component: AdminCustom,
});

const STATUSES = ["new", "reviewing", "quoted", "in_production", "completed", "declined"] as const;

type Req = Awaited<ReturnType<typeof listCustomRequestsAdmin>>[number];

function AdminCustom() {
  const list = useServerFn(listCustomRequestsAdmin);
  const setStatus = useServerFn(updateCustomRequestStatus);
  const [rows, setRows] = useState<Req[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => list().then((r) => { setRows(r); setLoading(false); });
  useEffect(() => { refresh(); }, []); // eslint-disable-line

  async function onStatus(id: string, status: string) {
    try {
      await setStatus({ data: { id, status } });
      toast.success("Updated");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl">Custom Requests</h1>
          <p className="mt-2 text-muted-foreground text-sm">Manage bespoke client commissions.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[10px] tracking-widest uppercase text-muted-foreground animate-pulse">Loading requests...</div>
      ) : rows.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border bg-muted/10 flex flex-col items-center">
          <PenTool className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        </div>
      ) : (
        <div className="border border-border/50 bg-background">
          {rows.map((r) => (
            <div key={r.id} className="border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/10">
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 text-left gap-4">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="min-w-[120px]">
                    <div className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Request ID</div>
                    <div className="font-medium">#{r.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Client</div>
                    <div className="font-medium">{r.full_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {r.email}
                    </div>
                  </div>
                  <div className="sm:ml-auto text-left sm:text-right">
                    <div className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Type</div>
                    <div className="text-sm font-medium uppercase tracking-wider">{r.kind.replace(/-/g, " ")}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
                  <select
                    value={r.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onStatus(r.id, e.target.value)}
                    className="flex-1 sm:flex-none border border-border bg-background px-3 py-2 text-[10px] tracking-[0.15em] uppercase focus:outline-none focus:border-[color:var(--brand-espresso)] transition-colors"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                  <div className="text-muted-foreground p-2">
                    {expanded === r.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </button>
              {expanded === r.id && (
                <div className="p-4 sm:p-6 bg-muted/20 border-t border-border/50 text-sm animate-in slide-in-from-top-2 duration-200">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
                        <Hash className="h-3.5 w-3.5" /> Design Preferences
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                        <Info label="Leather">{r.leather_type ?? "—"}</Info>
                        <Info label="Colour">{r.color ?? "—"}</Info>
                        <Info label="Lining">{r.lining ?? "—"}</Info>
                        <Info label="Hardware">{r.hardware ?? "—"}</Info>
                      </div>
                      
                      <div className="mt-8">
                        <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
                          <MessageSquare className="h-3.5 w-3.5" /> Client Notes
                        </div>
                        {r.notes ? (
                          <div className="p-3 bg-background border border-border/50 text-sm">
                            {r.notes}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">No additional notes provided.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
                        <Ruler className="h-3.5 w-3.5" /> Measurements
                      </div>
                      <div className="bg-background border border-border/50 rounded-sm">
                        <ul className="divide-y divide-border/50">
                          {Object.entries((r.measurements as Record<string, string>) ?? {}).length > 0 ? (
                            Object.entries((r.measurements as Record<string, string>) ?? {}).map(([k, v]) => (
                              <li key={k} className="flex justify-between items-center p-3 text-sm hover:bg-muted/10 transition-colors">
                                <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                                <span className="font-medium">{v}"</span>
                              </li>
                            ))
                          ) : (
                            <li className="p-4 text-center text-muted-foreground text-xs italic">No measurements provided</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">{label}</div>
      <div className="font-medium text-foreground">{children}</div>
    </div>
  );
}