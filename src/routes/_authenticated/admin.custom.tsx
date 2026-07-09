import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { listCustomRequestsAdmin, updateCustomRequestStatus } from "@/lib/custom.functions";

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
    <div>
      <h1 className="font-display text-4xl mb-8">Custom requests</h1>
      {loading ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? (
        <p className="text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="border border-border">
          {rows.map((r) => (
            <div key={r.id} className="border-b border-border last:border-b-0">
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="w-full grid grid-cols-[1fr_1fr_auto_auto] gap-4 p-4 items-center text-left hover:bg-secondary/50">
                <div>
                  <div className="font-medium">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.email} · {r.phone}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.kind}<br />{new Date(r.created_at).toLocaleString()}
                </div>
                <select
                  value={r.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onStatus(r.id, e.target.value)}
                  className="border border-border bg-background px-3 py-1.5 text-xs tracking-[0.15em] uppercase"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
                <span className="text-xs text-muted-foreground">{expanded === r.id ? "▲" : "▼"}</span>
              </button>
              {expanded === r.id && (
                <div className="p-6 bg-secondary/50 border-t border-border text-sm space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Info label="Leather">{r.leather_type ?? "—"}</Info>
                    <Info label="Colour">{r.color ?? "—"}</Info>
                    <Info label="Lining">{r.lining ?? "—"}</Info>
                    <Info label="Hardware">{r.hardware ?? "—"}</Info>
                  </div>
                  <div>
                    <div className="eyebrow mb-2">Measurements</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries((r.measurements as Record<string, string>) ?? {}).map(([k, v]) => (
                        <div key={k} className="text-xs"><span className="text-muted-foreground">{k}:</span> {v}"</div>
                      ))}
                    </div>
                  </div>
                  {r.notes && <div><div className="eyebrow mb-2">Notes</div><p>{r.notes}</p></div>}
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
  return <div><div className="eyebrow">{label}</div><div className="mt-1">{children}</div></div>;
}