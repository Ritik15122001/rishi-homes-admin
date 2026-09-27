export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={"card w-full " + (wide ? "max-w-2xl" : "max-w-md") + " p-6"}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-neutral-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
