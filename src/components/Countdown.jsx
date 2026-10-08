import useCountdown from '../hooks/useCountdown';

const pad = (n) => String(n).padStart(2, '0');

export default function Countdown({ target, size = 'md' }) {
  const { d, h, m, s } = useCountdown(target);
  const units = d > 0 ? [[d, 'D'], [h, 'H'], [m, 'M']] : [[h, 'H'], [m, 'M'], [s, 'S']];
  return (
    <span className={`countdown countdown-${size}`}>
      {units.map(([v, l], i) => (
        <span key={l} className="cd-group">
          <span className="cd-box">{pad(v)}</span>
          <span className="cd-label">{l}</span>
          {i < units.length - 1 && <span className="cd-sep">:</span>}
        </span>
      ))}
    </span>
  );
}
