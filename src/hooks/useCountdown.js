import { useEffect, useState } from 'react';

/** `target` may be an ISO string (API) or a timestamp. */
export default function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const at = typeof target === 'string' ? Date.parse(target) : target;
  const diff = Math.max(0, at - now);
  return {
    diff,
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}
