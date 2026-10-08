import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmt, vibrate } from '../utils';
import Coin from '../components/Coin';
import TopBar from '../components/TopBar';

const ITEM = 84;
const REPEAT = 18;

function Reel({ symbols, index, target, spinId, onStop }) {
  const L = symbols.length;
  const strip = useMemo(() => Array.from({ length: L * REPEAT }, (_, i) => symbols[i % L]), [symbols, L]);
  const [pos, setPos] = useState(index * 2);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    if (!spinId) return;
    let next = (pos % L) + L * (7 + index * 3);
    const center = (next + 1) % L;
    next += (target - center + L) % L;
    setAnim(true);
    setPos(next);
  }, [spinId]); // eslint-disable-line react-hooks/exhaustive-deps

  const dur = 1.9 + index * 0.55;
  return (
    <div className="reel">
      <div
        className={`reel-strip ${anim ? 'blur' : ''}`}
        style={{
          transform: `translateY(${-pos * ITEM}px)`,
          transition: anim ? `transform ${dur}s cubic-bezier(.2,.75,.25,1.04)` : 'none',
        }}
        onTransitionEnd={() => {
          setAnim(false);
          setPos((p) => p % L);
          onStop(index);
        }}
      >
        {strip.map((s, i) => (
          <div key={i} className="reel-item">
            {s.icon}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Slots() {
  const { config, spinSlots, settleWin, applyTransactions, showToast } = useApp();
  const { symbols, bets, pairMultiplier } = config.slots;
  const [bet, setBet] = useState(bets[1] ?? bets[0]);
  const [targets, setTargets] = useState([0, 2, 4]);
  const [spinId, setSpinId] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(null);
  const [lever, setLever] = useState(false);
  const stopped = useRef(0);
  const pending = useRef(null); // server result waiting for the reels to stop

  // Leaving mid-spin still credits the win.
  useEffect(() => () => pending.current && applyTransactions(pending.current.winTransaction), []); // eslint-disable-line react-hooks/exhaustive-deps

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    const res = await spinSlots(bet); // server decides the reels
    if (!res) return setSpinning(false);
    vibrate(30);
    setLever(true);
    setTimeout(() => setLever(false), 400);
    stopped.current = 0;
    pending.current = res;
    setLastWin(null);
    setTargets(res.reels);
    setSpinId((s) => s + 1);
  };

  const onStop = () => {
    vibrate(15);
    if (++stopped.current < 3) return;
    setSpinning(false);
    const res = pending.current;
    pending.current = null;
    if (!res?.winTransaction) return;
    setLastWin(res.payout);
    const icon = symbols[res.reels[0]].icon;
    if (res.payout >= bet * 10) {
      settleWin(res.winTransaction, { title: res.payout >= bet * 25 ? 'MEGA WIN!' : 'BIG WIN!', emoji: icon });
    } else {
      applyTransactions(res.winTransaction);
      showToast(`🎉 You won ${fmt(res.payout)} coins!`, 'success');
    }
  };

  const winning = !spinning && lastWin;

  return (
    <div className="screen anim-slide slots-screen">
      <TopBar title="Lucky 777" />

      <div className="slot-machine">
        <div className="slot-marquee">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={`bulb small ${i % 2 ? 'odd' : ''} ${spinning ? 'fast' : ''}`} />
          ))}
        </div>
        <h2 className="slot-title">
          <span>7</span>
          <span>7</span>
          <span>7</span>
        </h2>
        <div className={`reels ${winning ? 'reels-win' : ''}`}>
          {[0, 1, 2].map((i) => (
            <Reel key={i} symbols={symbols} index={i} target={targets[i]} spinId={spinId} onStop={onStop} />
          ))}
          <div className="payline" />
        </div>
        <div className="slot-display">
          {spinning ? 'GOOD LUCK…' : winning ? (
            <span className="gold-text">
              WIN <Coin size={16} /> {fmt(lastWin)}
            </span>
          ) : (
            'PULL TO SPIN'
          )}
        </div>
        <button className={`lever ${lever ? 'pulled' : ''}`} onClick={spin} aria-label="Pull lever">
          <span className="lever-knob" />
        </button>
      </div>

      <div className="bet-row">
        <span className="muted tiny">BET</span>
        {bets.map((b) => (
          <button key={b} className={`chip ${bet === b ? 'on' : ''}`} disabled={spinning} onClick={() => setBet(b)}>
            <Coin size={12} /> {b}
          </button>
        ))}
      </div>

      <button className="btn btn-gold btn-lg btn-block" disabled={spinning} onClick={spin}>
        {spinning ? 'SPINNING…' : 'SPIN'}
      </button>

      <div className="card">
        <h4 className="card-title">📋 Paytable (×bet)</h4>
        <div className="paytable">
          {symbols.map((s) => (
            <div key={s.id} className="pay-item">
              <span>
                {s.icon}
                {s.icon}
                {s.icon}
              </span>
              <b className="gold-text">×{s.mult}</b>
            </div>
          ))}
          <div className="pay-item">
            <span>Any pair</span>
            <b className="gold-text">×{pairMultiplier}</b>
          </div>
        </div>
      </div>
      <div className="bottom-space sm" />
    </div>
  );
}
