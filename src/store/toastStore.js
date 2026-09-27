import { create } from "zustand";

let counter = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  push: (message, type = "success") => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  }
}));
