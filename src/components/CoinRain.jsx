import { useMemo } from 'react';

export default function CoinRain({ count = 30 }) {
  const coins = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        dur: 2.2 + Math.random() * 1.8,
        size: 16 + Math.random() * 20,
      })),
    [count]
  );
  return (
    <div className="coin-rain" aria-hidden>
      {coins.map((c, i) => (
        <span
          key={i}
          className="rain-coin"
          style={{ left: `${c.left}%`, width: c.size, height: c.size, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }}
        />
      ))}
    </div>
  );
}
