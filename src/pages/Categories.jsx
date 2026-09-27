import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../lib/api";
import { img } from "../lib/images";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUpload from "../components/ImageUpload";
import { useToastStore } from "../store/toastStore";

const empty = { name: "", slug: "", image: "", note: "", order: 0, active: true };

export default function Categories() {
  const push = useToastStore((s) => s.push);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = closed, object = editing/creating
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    api.get("/categories").then((res) => {
      setItems(res.data.categories);
      setLoading(false);
    });
  }

  useEffect(load, []);

  function openCreate() {
    setForm({ ...empty });
  }
  function openEdit(c) {
    setForm({ ...c });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (payload._id) {
        await api.put(`/categories/${payload._id}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      push(payload._id ? "Room type updated." : "Room type created.");
      setForm(null);
      load();
    } catch (err) {
      push(apiErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c) {
    try {
      await api.put(`/categories/${c._id}`, { active: !c.active });
      load();
    } catch (err) {
      push(apiErrorMessage(err), "error");
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/categories/${toDelete._id}`);
      push("Room type deleted.");
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
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Room Types</h1>
          <p className="mt-1 text-sm text-neutral-500">The room categories shown across the site.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add room type
        </button>
      </div>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  No room types yet.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3">
                    <img src={img(c.image, 120)} alt={c.name} className="h-12 w-12 rounded-lg object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{c.slug}</td>
                  <td className="px-4 py-3 text-neutral-500">{c.note}</td>
                  <td className="px-4 py-3 text-neutral-500">{c.order}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={"badge " + (c.active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500")}
                    >
                      {c.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-sm font-medium text-neutral-600 hover:text-ink" onClick={() => openEdit(c)}>
                      Edit
                    </button>
                    <button className="ml-3 text-sm font-medium text-red-600 hover:text-red-800" onClick={() => setToDelete(c)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? "Edit room type" : "Add room type"}>
        {form && (
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="input" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="living-room" />
            </div>
            <ImageUpload label="Image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
            <div>
              <label className="label">Note</label>
              <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Order</label>
                <input className="input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Active (visible on site)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete room type?"
        message={`This will permanently remove "${toDelete?.name}". Designs already tagged with this room will keep the category name as text.`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </div>
  );
}
