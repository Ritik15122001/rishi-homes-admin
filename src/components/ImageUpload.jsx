import { useRef, useState } from "react";
import { api, apiErrorMessage } from "../lib/api";
import { img } from "../lib/images";

// A single image field: shows a preview of the current value (Unsplash id or
// any full URL), a file picker that uploads to the backend and swaps in the
// returned URL, and a plain text input as a manual override/fallback.
export default function ImageUpload({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/uploads", fd);
      onChange(data.url);
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 flex-none overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {value && <img src={img(value, 160)} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex-1 space-y-2">
          <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="photo-xxxxxxxx or paste an image URL" />
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary" onClick={() => inputRef.current.click()} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            <span className="text-xs text-neutral-400">JPG, PNG, WEBP, AVIF or GIF · up to 8MB</span>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
