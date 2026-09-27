import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/designs", { params: { limit: 1 } }),
      api.get("/categories"),
      api.get("/collections"),
      api.get("/consultations")
    ]).then(([designs, categories, collections, consultations]) => {
      const newLeads = consultations.data.consultations.filter((c) => c.status === "new").length;
      setStats({
        designs: designs.data.total,
        categories: categories.data.categories.length,
        collections: collections.data.collections.length,
        consultations: consultations.data.consultations.length,
        newLeads
      });
    });
  }, []);

  const cards = [
    { label: "Designs", value: stats?.designs, to: "/designs" },
    { label: "Room Types", value: stats?.categories, to: "/categories" },
    { label: "Collections", value: stats?.collections, to: "/collections" },
    { label: "New Enquiries", value: stats?.newLeads, to: "/consultations" }
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Overview of the catalogue and incoming enquiries.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card p-5 transition hover:shadow-md">
            <div className="font-serif text-3xl font-semibold text-neutral-900">{c.value ?? "—"}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="font-serif text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/designs/new">
            + Add a design
          </Link>
          <Link className="btn-secondary" to="/categories">
            Manage room types
          </Link>
          <Link className="btn-secondary" to="/collections">
            Manage collections
          </Link>
          <Link className="btn-secondary" to="/consultations">
            View enquiries
          </Link>
        </div>
      </div>
    </div>
  );
}
