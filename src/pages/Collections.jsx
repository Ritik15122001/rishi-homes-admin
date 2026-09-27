import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../lib/api";
import { img } from "../lib/images";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUpload from "../components/ImageUpload";
import { useToastStore } from "../store/toastStore";

const STYLES = ["Modern", "Minimal", "Contemporary", "Scandinavian", "Luxury", "Indian", "Japandi", "Industrial", "Classic"];
const empty = { key: "", label: "", img: "", cat: "", style: "", text: "", tags: "", order: 0, active: true };

export default function Collections() {
  const push = useToastStore((s) => s.push);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    api.get("/collections").then((res) => {
      setItems(res.data.collections);
      setLoading(false);
    });
  }
  useEffect(load, []);

  function openCreate() {
    setForm({ ...empty });
  }
  function openEdit(c) {
    setForm({ ...c, tags: (c.tags || []).join(", ") });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      };
      if (payload._id) await api.put(`/collections/${payload._id}`, payload);
      else await api.post("/collections", payload);
      push(payload._id ? "Collection updated." : "Collection created.");
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
      await api.put(`/collections/${c._id}`, { active: !c.active });
      load();
    } catch (err) {
      push(apiErrorMessage(err), "error");
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/collections/${toDelete._id}`);
      push("Collection deleted.");
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
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Collections</h1>
          <p className="mt-1 text-sm text-neutral-500">Curated design collections shown on the homepage.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add collection
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading ? (
          <p className="text-neutral-400">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-neutral-400">No collections yet.</p>
        ) : (
          items.map((c) => (
            <div key={c._id} className="card overflow-hidden">
              <img src={img(c.img, 500)} alt={c.label} className="h-36 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-semibold">{c.label}</h3>
                  <button onClick={() => toggleActive(c)} className={"badge " + (c.active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500")}>
                    {c.active ? "Active" : "Hidden"}
                  </button>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{c.text}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-secondary flex-1" onClick={() => openEdit(c)}>
                    Edit
                  </button>
                  <button className="btn-danger flex-1" onClick={() => setToDelete(c)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? "Edit collection" : "Add collection"} wide>
        {form && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Key (unique)</label>
                <input className="input" required value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="warm-earthy" />
              </div>
              <div>
                <label className="label">Label</label>
                <input className="input" required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
            </div>
            <ImageUpload label="Image" value={form.img} onChange={(v) => setForm({ ...form, img: v })} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Caption / room shown</label>
                <input className="input" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} placeholder="Living Room" />
              </div>
              <div>
                <label className="label">Linked style filter</label>
                <select className="input" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
                  <option value="">None</option>
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={2} required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            </div>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Natural materials, Warm wood" />
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
        title="Delete collection?"
        message={`This will permanently remove "${toDelete?.label}".`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </div>
  );
}
