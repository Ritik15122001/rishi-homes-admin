import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiErrorMessage } from "../lib/api";
import { img } from "../lib/images";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToastStore } from "../store/toastStore";

export default function DesignsList() {
  const push = useToastStore((s) => s.push);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    api.get("/designs", { params: { limit: 200, q: q || undefined } }).then((res) => {
      setItems(res.data.designs);
      setTotal(res.data.total);
      setLoading(false);
    });
  }

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function toggleField(d, field) {
    try {
      await api.put(`/designs/${d._id}`, { [field]: !d[field] });
      load();
    } catch (err) {
      push(apiErrorMessage(err), "error");
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/designs/${toDelete._id}`);
      push("Design deleted.");
      setToDelete(null);
      load();
    } catch (err) {
      push(apiErrorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Designs</h1>
          <p className="mt-1 text-sm text-neutral-500">{total} design{total === 1 ? "" : "s"} in the catalogue.</p>
        </div>
        <Link className="btn-primary" to="/designs/new">
          + Add design
        </Link>
      </div>

      <div className="mt-4">
        <input className="input max-w-sm" placeholder="Search designs…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Design</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Style</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No designs found.
                </td>
              </tr>
            ) : (
              items.map((d) => (
                <tr key={d._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={img(d.img, 120)} alt={d.title} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-medium">{d.title}</div>
                        <div className="text-xs text-neutral-400">{d.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{d.category}</td>
                  <td className="px-4 py-3 text-neutral-500">{d.style}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <FlagChip label="Featured" on={d.featured} onClick={() => toggleField(d, "featured")} />
                      <FlagChip label="Trending" on={d.trending} onClick={() => toggleField(d, "trending")} />
                      <FlagChip label="Editor's pick" on={d.editorsPick} onClick={() => toggleField(d, "editorsPick")} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleField(d, "active")}
                      className={"badge " + (d.active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500")}
                    >
                      {d.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link className="text-sm font-medium text-neutral-600 hover:text-ink" to={`/designs/${d._id}/edit`}>
                      Edit
                    </Link>
                    <button className="ml-3 text-sm font-medium text-red-600 hover:text-red-800" onClick={() => setToDelete(d)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete design?"
        message={`This will permanently remove "${toDelete?.title}" from the catalogue.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </div>
  );
}

function FlagChip({ label, on, onClick }) {
  return (
    <button onClick={onClick} className={"badge cursor-pointer " + (on ? "bg-ink text-white" : "bg-neutral-100 text-neutral-400")}>
      {label}
    </button>
  );
}
