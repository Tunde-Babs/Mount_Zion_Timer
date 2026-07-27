import { create } from 'zustand';
import { makeId } from '../lib/id';

// Cross-cutting UI state: toasts, confirmation dialogs, and the upgrade paywall
// modal all need to be triggerable from deep inside the component tree without
// prop-drilling, so they live in a tiny store of their own (kept separate from
// the timer/room data so persistence middleware never touches it).
export const useUIStore = create((set, get) => ({
  toasts: [],
  confirm: null, // { title, message, confirmLabel, tone, onConfirm }
  upgradeModal: { open: false, reason: '' },

  showToast: (message, { type = 'success', action } = {}) => {
    const id = makeId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type, action }] }));
    setTimeout(() => get().dismissToast(id), action ? 6000 : 3200);
    return id;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  showConfirm: ({ title, message, confirmLabel = 'Delete', tone = 'danger', onConfirm }) =>
    set({ confirm: { title, message, confirmLabel, tone, onConfirm } }),
  closeConfirm: () => set({ confirm: null }),

  openUpgradeModal: (reason = '') => set({ upgradeModal: { open: true, reason } }),
  closeUpgradeModal: () => set({ upgradeModal: { open: false, reason: '' } })
}));
