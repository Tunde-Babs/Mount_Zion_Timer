export function formatTime(ms) {
  const isNegative = ms < 0;
  const absoluteMs = Math.abs(ms);
  const totalSeconds = Math.floor(absoluteMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const sign = isNegative ? '-' : '';
  if (hours > 0) {
    return `${sign}${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTimeToInput(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function parseTimeInput(value) {
  const parts = String(value).split(':').map((p) => p.trim());
  let ms = 0;
  if (parts.length === 3) ms = (parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10)) * 1000;
  else if (parts.length === 2) ms = (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) * 1000;
  else ms = parseInt(parts[0], 10) * 1000;
  return Number.isNaN(ms) ? 0 : ms;
}

export function percentUsed(remaining, duration) {
  if (!duration) return 0;
  return ((duration - remaining) / duration) * 100;
}
