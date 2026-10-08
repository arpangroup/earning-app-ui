import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { fmt, timeAgo, vibrate } from '../utils';
import Coin from '../components/Coin';
import TopBar from '../components/TopBar';

const SIZE = 300;
const C = SIZE / 2;
const R = 140;
const SPIN_MS = 5200;

const polar = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
};

function Wheel({ segments, rotation, spinning }) {
  const SEG = 360 / segments.length;
  return (
    <svg
      className="wheel-rotor"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
      }}
    >
      <defs>
        <radialGradient id="segShade" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {segments.map((s, i) => {
        const [x0, y0] = polar(i * SEG, R);
        const [x1, y1] = polar((i + 1) * SEG, R);
        const mid = (i + 0.5) * SEG;
        const jackpot = s.label === 'JACKPOT';
        return (
          <g key={i}>
            <path d={`M${C} ${C} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`} fill={s.color} stroke="#ffd34d" strokeWidth="2" />
            <g transform={`rotate(${mid} ${C} ${C})`}>
              <text
                x={C}
                y={C - R * 0.66}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={jackpot ? '#7c2d12' : '#fff'}
                fontWeight="800"
                fontSize={s.label.length > 4 ? 13 : 20}
                style={{ paintOrder: 'stroke', stroke: jackpot ? 'none' : 'rgba(0,0,0,.35)', strokeWidth: 3 }}
              >
                {s.label}
              </text>
              {s.value > 0 && (
                <text x={C} y={C - R * 0.43} textAnchor="middle" fontSize="16">
                  {jackpot ? '👑' : '🪙'}
                </text>
              )}
            </g>
          </g>
        );
      })}
      <circle cx={C} cy={C} r={R} fill="url(#segShade)" />
    </svg>
  );
}

export default function SpinWheel() {
  const { config, freeSpins, spinWheel, settleWin, celebrate } = useApp();
  const { segments, spinCost } = config.wheel;
  const SEG = 360 / segments.length;
  const jackpot = Math.max(...segments.map((s) => s.value));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const recent = useApi(() => api.getRecentSpinWins(), []);
  const [myWins, setMyWins] = useState([]);
  const history = [...myWins, ...(recent.data || [])].slice(0, 6);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true; // re-set after StrictMode remounts
    return () => {
      mounted.current = false;
    };
  }, []);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    const res = await spinWheel(); // server decides the segment
    if (!res) return setSpinning(false);
    vibrate(40);
    const idx = res.segmentIndex;
    const center = idx * SEG + SEG / 2;
    const jitter = (Math.random() - 0.5) * SEG * 0.6;
    const target = rotation - (rotation % 360) + 360 * 7 + (360 - center) + jitter;
    setRotation(target);

    // Not cleared on unmount on purpose: the win must still be credited if the user leaves.
    setTimeout(() => {
      if (mounted.current) setSpinning(false);
      const seg = segments[idx];
      vibrate([60, 40, 120]);
      if (res.winTransaction) {
        if (mounted.current) setMyWins((h) => [{ name: 'You', value: res.reward, createdAt: res.winTransaction.createdAt }, ...h]);
        settleWin(res.winTransaction, res.reward === jackpot ? { title: 'JACKPOT!!', emoji: '👑' } : {});
      } else {
        celebrate({ amount: 0, title: 'SO CLOSE!', subtitle: 'The wheel says try again 🎡' });
      }
    }, SPIN_MS + 250);
  };

  return (
    <div className="screen anim-slide spin-screen">
      <TopBar title="Spin & Win" />

      <div className="spin-info">
        <div className="pill-stat">
          🎁 Free spins <b>{freeSpins}</b>
        </div>
        <div className="pill-stat">
          👑 Jackpot <b>{fmt(jackpot)}</b>
        </div>
      </div>

      <div className="wheel-stage">
        <div className="wheel-glow" />
        <div className="wheel-rim">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className={`bulb ${i % 2 ? 'odd' : ''} ${spinning ? 'fast' : ''}`} style={{ transform: `rotate(${i * 15}deg) translateY(-163px)` }} />
          ))}
        </div>
        <Wheel segments={segments} rotation={rotation} spinning={spinning} />
        <div className="wheel-pointer" />
        <button className={`wheel-hub ${spinning ? 'busy' : ''}`} onClick={spin} disabled={spinning}>
          SPIN
        </button>
      </div>

      <button className="btn btn-gold btn-lg btn-block spin-cta" disabled={spinning} onClick={spin}>
        {spinning ? 'Spinning…' : freeSpins > 0 ? `SPIN FREE (${freeSpins} left)` : (
          <>
            SPIN FOR <Coin size={18} /> {spinCost}
          </>
        )}
      </button>

      <div className="card">
        <h4 className="card-title">🎉 Recent spin winners</h4>
        {history.map((w, i) => (
          <div key={i} className="row-line">
            <span>{w.name === 'You' ? <b className="gold-text">You</b> : w.name}</span>
            <span className="muted tiny">{timeAgo(w.createdAt)}</span>
            <span className="gold-text">
              <Coin size={13} /> {fmt(w.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="bottom-space sm" />
    </div>
  );
}
