import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { listAllProductsAdmin, upsertProduct, deleteProduct } from "@/lib/products.functions";
import { NAV } from "@/lib/navigation";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type Product = Awaited<ReturnType<typeof listAllProductsAdmin>>[number];

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function AdminProducts() {
  const list = useServerFn(listAllProductsAdmin);
  const upsert = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const [rows, setRows] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    list().then((r) => { setRows(r); setLoading(false); }).catch((e) => { toast.error(String(e)); setLoading(false); });
  };
  useEffect(refresh, [list]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      id: editing.id,
      slug: String(fd.get("slug") ?? ""),
      name: String(fd.get("name") ?? ""),
      description: String(fd.get("description") ?? ""),
      price_cents: Math.round(parseFloat(String(fd.get("price") ?? "0")) * 100),
      category_slug: String(fd.get("category_slug") ?? ""),
      subcategory_slug: String(fd.get("subcategory_slug") ?? ""),
      sizes: String(fd.get("sizes") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      images: String(fd.get("images") ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
      featured: fd.get("featured") === "on",
      is_active: fd.get("is_active") === "on",
    };
    try {
      await upsert({ data: payload });
      toast.success("Saved");
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-4xl">Products</h1>
        <button
          onClick={() => setEditing({ is_active: true, featured: false, sizes: [], images: [], price_cents: 0 })}
          className="px-6 py-3 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)]"
        >
          + New product
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[11px] tracking-[0.2em] uppercase">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Category</th>
                <th className="text-right p-3">Price</th>
                <th className="text-center p-3">Active</th>
                <th className="text-right p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {r.images?.[0] && <img src={r.images[0]} alt="" className="w-10 h-12 object-cover bg-secondary" />}
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{r.category_slug} / {r.subcategory_slug}</td>
                  <td className="p-3 text-right tabular-nums">{formatMoney(r.price_cents)}</td>
                  <td className="p-3 text-center">{r.is_active ? "✓" : "—"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(r)} className="text-xs tracking-[0.2em] uppercase hover:text-[color:var(--brand-cognac)] mr-3">Edit</button>
                    <button onClick={() => onDelete(r.id)} className="text-xs tracking-[0.2em] uppercase text-destructive">Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/40 flex items-start justify-center overflow-y-auto p-6">
          <div className="bg-background border border-border w-full max-w-2xl my-10">
            <div className="p-6 border-b border-border flex justify-between">
              <h2 className="font-display text-2xl">{editing.id ? "Edit product" : "New product"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground">Close</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <F label="Name" name="name" defaultValue={editing.name} required onChange={(v) => setEditing((e) => e ? { ...e, name: v, slug: e.slug || slugify(v) } : e)} />
                <F label="Slug" name="slug" defaultValue={editing.slug} required />
              </div>
              <F label="Description" name="description" defaultValue={editing.description ?? ""} as="textarea" />
              <div className="grid md:grid-cols-3 gap-4">
                <F label="Price (USD)" name="price" defaultValue={editing.price_cents ? String(editing.price_cents / 100) : ""} required />
                <Select label="Category" name="category_slug" defaultValue={editing.category_slug ?? ""}>
                  <option value="">Select…</option>
                  {NAV.filter((s) => s.title !== "Customize").map((s) => (
                    <option key={s.href} value={s.href.replace("/shop/", "")}>{s.title}</option>
                  ))}
                </Select>
                <F label="Subcategory slug" name="subcategory_slug" defaultValue={editing.subcategory_slug ?? ""} required />
              </div>
              <F label="Sizes (comma-separated, e.g. XS,S,M,L,XL,XXL)" name="sizes" defaultValue={(editing.sizes ?? []).join(",")} />
              <F label="Images (one URL per line, e.g. /products/foo.jpg)" name="images" defaultValue={(editing.images ?? []).join("\n")} as="textarea" />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={editing.is_active ?? true} /> Active</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={editing.featured ?? false} /> Featured</label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditing(null)} className="px-6 py-3 border border-border text-[11px] tracking-[0.28em] uppercase">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, name, defaultValue, required, as, onChange }: { label: string; name: string; defaultValue?: string; required?: boolean; as?: "textarea"; onChange?: (v: string) => void }) {
  const cls = "w-full border border-border px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-foreground";
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{label}</span>
      {as === "textarea" ? (
        <textarea name={name} rows={4} defaultValue={defaultValue} className={cls} onChange={(e) => onChange?.(e.target.value)} />
      ) : (
        <input name={name} defaultValue={defaultValue} required={required} className={cls} onChange={(e) => onChange?.(e.target.value)} />
      )}
    </label>
  );
}

function Select({ label, name, defaultValue, children }: { label: string; name: string; defaultValue?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{label}</span>
      <select name={name} defaultValue={defaultValue} className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-foreground">
        {children}
      </select>
    </label>
  );
}