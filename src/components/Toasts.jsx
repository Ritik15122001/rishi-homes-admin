import { useToastStore } from "../store/toastStore";

export default function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "rounded-lg px-4 py-3 text-sm shadow-lg " +
            (t.type === "error" ? "bg-red-600 text-white" : "bg-neutral-900 text-white")
          }
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
