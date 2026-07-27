// Freemium gating lives in one place so the limit is easy to audit or change.
export const FREE_TIMER_LIMIT = Number(import.meta.env.VITE_FREE_TIMER_LIMIT) || 5;
export const UPGRADE_PRICE_LABEL = import.meta.env.VITE_UPGRADE_PRICE_LABEL || '€20';

export function countTotalTimers(rooms) {
  return rooms.reduce((sum, room) => sum + room.timers.length, 0);
}

export function isAtFreeLimit(rooms, isPremium) {
  if (isPremium) return false;
  return countTotalTimers(rooms) >= FREE_TIMER_LIMIT;
}

export function remainingFreeTimers(rooms, isPremium) {
  if (isPremium) return Infinity;
  return Math.max(0, FREE_TIMER_LIMIT - countTotalTimers(rooms));
}
