import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../lib/api";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToastStore } from "../store/toastStore";

const STATUSES = ["new", "contacted", "closed"];
const STATUS_STYLE = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-neutral-100 text-neutral-500"
};

export default function Consultations() {
  const push = useToastStore((s) => s.push);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    api.get("/consultations", { params: filter !== "All" ? { status: filter } : {} }).then((res) => {
      setItems(res.data.consultations);
      setLoading(false);
    });
  }
  useEffect(load, [filter]);

  async function updateStatus(c, status) {
    try {
      await api.put(`/consultations/${c._id}`, { status });
      load();
    } catch (err) {
      push(apiErrorMessage(err), "error");
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/consultations/${toDelete._id}`);
      push("Enquiry deleted.");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Consultations</h1>
          <p className="mt-1 text-sm text-neutral-500">Enquiries submitted through the contact form.</p>
        </div>
        <select className="input w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 align-top">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  No enquiries yet.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <a className="hover:text-ink" href={`tel:${c.phone}`}>
                      {c.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a className="hover:text-ink" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-neutral-500">
                    <div>{[c.city, c.property, c.size, c.budget].filter(Boolean).join(" · ")}</div>
                    {c.message && <div className="mt-1 line-clamp-2 italic text-neutral-400">{c.message}</div>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      className={"badge cursor-pointer border-0 " + STATUS_STYLE[c.status]}
                      value={c.status}
                      onChange={(e) => updateStatus(c, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-sm font-medium text-red-600 hover:text-red-800" onClick={() => setToDelete(c)}>
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
        title="Delete enquiry?"
        message={`This will permanently remove the enquiry from "${toDelete?.name}".`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </div>
  );
}
