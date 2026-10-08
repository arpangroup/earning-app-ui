export const fmt = (n) => Math.round(n).toLocaleString('en-IN');

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const vibrate = (pattern = 30) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
};

const time = (d) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const sameDay = (a, b) => a.toDateString() === b.toDateString();

/** "Just now", "5m ago", "3h ago", "Yesterday", "2 Oct" — for feeds. */
export const timeAgo = (iso) => {
  const d = new Date(iso);
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/** "Just now", "Today, 11:20 am", "Yesterday, 7:15 pm", "2 Oct, 9:48 pm" — for ledgers. */
export const formatDateTime = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  if (now - d < 60_000) return 'Just now';
  if (sameDay(d, now)) return `Today, ${time(d)}`;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (sameDay(d, y)) return `Yesterday, ${time(d)}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${time(d)}`;
};
