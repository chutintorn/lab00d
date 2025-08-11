// src/utils/formatDateTime.js
export default function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const monthShort = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  const weekday = date.toLocaleString('en-US', { weekday: 'short' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}-${monthShort}-${year} ${weekday}, ${hours}:${minutes}`;
}
