import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <div>
      <h1 className="font-display text-4xl">Welcome back.</h1>
      <p className="mt-2 text-muted-foreground">Manage your catalog, orders, and custom commissions.</p>
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <Card to="/admin/products" title="Products" desc="Add, edit, and remove pieces in the catalog." />
        <Card to="/admin/orders" title="Orders" desc="View orders and update fulfilment status." />
        <Card to="/admin/custom" title="Custom requests" desc="Made-to-measure commissions from clients." />
      </div>
    </div>
  );
}

function Card({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to} className="block border border-border p-6 hover:border-foreground transition-colors">
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}