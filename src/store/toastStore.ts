import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'info';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

export type ToastStore = {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  showToast: (message, type = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // auto-dismiss after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
