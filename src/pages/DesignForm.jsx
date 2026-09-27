import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, apiErrorMessage } from "../lib/api";
import { img } from "../lib/images";
import ImageUpload from "../components/ImageUpload";
import { useToastStore } from "../store/toastStore";

const STYLES = ["Modern", "Minimal", "Contemporary", "Scandinavian", "Luxury", "Indian", "Japandi", "Industrial", "Classic"];

const empty = {
  slug: "",
  title: "",
  category: "",
  style: "",
  img: "",
  palette: "",
  desc: "",
  colors: [{ name: "", hex: "#9A7352" }],
  materials: [""],
  gallery: [""],
  featured: false,
  trending: false,
  editorsPick: false,
  active: true,
  order: 0
};

export default function DesignForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(isEdit ? null : empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/designs/id/${id}`).then((res) => {
      const found = res.data.design;
      setForm({
        ...found,
        colors: found.colors.length ? found.colors : [{ name: "", hex: "#9A7352" }],
        materials: found.materials.length ? found.materials : [""],
        gallery: found.gallery.length ? found.gallery : [""]
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setListItem(field, i, value) {
    setForm((f) => {
      const list = [...f[field]];
      list[i] = value;
      return { ...f, [field]: list };
    });
  }
  function setColor(i, key, value) {
    setForm((f) => {
      const list = f.colors.map((c, idx) => (idx === i ? { ...c, [key]: value } : c));
      return { ...f, colors: list };
    });
  }
  function addListItem(field, value = "") {
    setForm((f) => ({ ...f, [field]: [...f[field], value] }));
  }
  function removeListItem(field, i) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        order: Number(form.order) || 0,
        colors: form.colors.filter((c) => c.name && c.hex),
        materials: form.materials.map((m) => m.trim()).filter(Boolean),
        gallery: form.gallery.map((g) => g.trim()).filter(Boolean)
      };
      if (!payload.gallery.length) payload.gallery = [payload.img];

      if (isEdit) await api.put(`/designs/${id}`, payload);
      else await api.post("/designs", payload);

      push(isEdit ? "Design updated." : "Design created.");
      navigate("/designs");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-neutral-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">{isEdit ? "Edit design" : "Add design"}</h1>
          <Link to="/designs" className="mt-1 inline-block text-sm text-neutral-500 hover:text-ink">
            ← Back to designs
          </Link>
        </div>
        {form.img && <img src={img(form.img, 200)} alt="" className="h-16 w-16 rounded-lg object-cover" />}
      </div>

      <form onSubmit={save} className="mt-6 space-y-6">
        <div className="card space-y-4 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Basics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className="label">Slug (unique URL)</label>
              <input className="input" required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="emerald-velvet-dining" />
            </div>
            <div>
              <label className="label">Room type</label>
              <select className="input" required value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Style</label>
              <select className="input" required value={form.style} onChange={(e) => set("style", e.target.value)}>
                <option value="">Select…</option>
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ImageUpload label="Main image" value={form.img} onChange={(v) => set("img", v)} />
          <div>
            <label className="label">Palette name</label>
            <input className="input" required value={form.palette} onChange={(e) => set("palette", e.target.value)} placeholder="Emerald & Brass" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" required rows={3} value={form.desc} onChange={(e) => set("desc", e.target.value)} />
          </div>
        </div>

        <div className="card space-y-3 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Colour palette</h2>
          {form.colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input" placeholder="Name" value={c.name} onChange={(e) => setColor(i, "name", e.target.value)} />
              <input type="color" className="h-10 w-14 flex-none rounded-lg border border-neutral-300" value={c.hex} onChange={(e) => setColor(i, "hex", e.target.value)} />
              <button type="button" className="text-neutral-400 hover:text-red-600" onClick={() => removeListItem("colors", i)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => addListItem("colors", { name: "", hex: "#9A7352" })}>
            + Add colour
          </button>
        </div>

        <div className="card space-y-3 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Materials</h2>
          {form.materials.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input" placeholder="e.g. Fluted walnut" value={m} onChange={(e) => setListItem("materials", i, e.target.value)} />
              <button type="button" className="text-neutral-400 hover:text-red-600" onClick={() => removeListItem("materials", i)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => addListItem("materials")}>
            + Add material
          </button>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Gallery images</h2>
          {form.gallery.map((g, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageUpload value={g} onChange={(v) => setListItem("gallery", i, v)} />
              </div>
              <button type="button" className="mt-4 text-neutral-400 hover:text-red-600" onClick={() => removeListItem("gallery", i)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => addListItem("gallery")}>
            + Add image
          </button>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Visibility</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
              Active (visible on site)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured (homepage "design of the week")
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.trending} onChange={(e) => set("trending", e.target.checked)} />
              Trending now
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.editorsPick} onChange={(e) => set("editorsPick", e.target.checked)} />
              Editor&rsquo;s pick
            </label>
          </div>
          <div className="max-w-[160px]">
            <label className="label">Sort order</label>
            <input className="input" type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pb-8">
          <Link to="/designs" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create design"}
          </button>
        </div>
      </form>
    </div>
  );
}
