export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true, busy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-sm p-6">
        <h3 className="font-serif text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="mt-2 text-sm text-neutral-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
