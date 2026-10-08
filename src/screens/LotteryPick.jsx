import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fmt, shuffle, vibrate } from '../utils';
import Coin from '../components/Coin';
import Countdown from '../components/Countdown';
import Portal from '../components/Portal';
import TopBar from '../components/TopBar';
import { Ball } from './Lottery';

export default function LotteryPick() {
  const { id } = useParams();
  const nav = useNavigate();
  const { buyTicket, lotteries } = useApp();
  const lottery = lotteries.find((l) => l.id === id);
  const [buying, setBuying] = useState(false);
  const [picked, setPicked] = useState([]);
  const [shuffling, setShuffling] = useState(false);
  const [bought, setBought] = useState(null);

  if (!lottery) {
    return (
      <div className="screen">
        <TopBar title="Lottery" />
        <p className="center muted">Draw not found.</p>
      </div>
    );
  }

  const toggle = (n) => {
    vibrate(10);
    setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < lottery.pick ? [...p, n] : p));
  };

  const quickPick = () => {
    setShuffling(true);
    let ticks = 0;
    const t = setInterval(() => {
      setPicked(shuffle(Array.from({ length: lottery.maxNumber }, (_, i) => i + 1)).slice(0, lottery.pick));
      if (++ticks > 8) {
        clearInterval(t);
        setShuffling(false);
      }
    }, 90);
  };

  const buy = async () => {
    setBuying(true);
    const ticket = await buyTicket(lottery.id, picked);
    setBuying(false);
    if (ticket) {
      vibrate([30, 30, 60]);
      setBought(ticket);
    }
  };

  const ready = picked.length === lottery.pick;

  return (
    <div className="screen anim-slide">
      <TopBar title={lottery.name} />

      <div className="pick-hero" style={{ background: lottery.gradient }}>
        <span className="tiny">JACKPOT</span>
        <span className="pick-jackpot">
          <Coin size={28} spin /> {fmt(lottery.jackpot)}
        </span>
        <Countdown target={lottery.drawAt} size="sm" />
      </div>

      <div className="card">
        <div className="pick-head">
          <h4>
            Pick {lottery.pick} numbers{' '}
            <span className="muted tiny">
              ({picked.length}/{lottery.pick})
            </span>
          </h4>
          <div className="pick-actions">
            <button className="btn btn-sm btn-ghost" onClick={() => setPicked([])}>
              Clear
            </button>
            <button className="btn btn-sm btn-purple" onClick={quickPick} disabled={shuffling}>
              🎲 Quick Pick
            </button>
          </div>
        </div>

        <div className="selected-row">
          {Array.from({ length: lottery.pick }).map((_, i) => {
            const n = [...picked].sort((a, b) => a - b)[i];
            return n ? <Ball key={i} n={n} variant="gold pop" /> : <span key={i} className="ball empty">?</span>;
          })}
        </div>

        <div className={`num-grid ${lottery.maxNumber <= 20 ? 'big' : ''}`}>
          {Array.from({ length: lottery.maxNumber }, (_, i) => i + 1).map((n) => (
            <button key={n} className={`num ${picked.includes(n) ? 'on' : ''}`} onClick={() => toggle(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="card prize-table">
        <h4 className="card-title">🏆 Prize table</h4>
        <div className="row-line">
          <span>Match all {lottery.pick}</span>
          <span className="gold-text">
            <Coin size={13} /> {fmt(lottery.jackpot)}
          </span>
        </div>
        {Object.entries(lottery.tiers)
          .reverse()
          .map(([k, v]) => (
            <div key={k} className="row-line">
              <span>Match {k}</span>
              <span className="gold-text">
                <Coin size={13} /> {fmt(v)}
              </span>
            </div>
          ))}
      </div>

      <div className="sticky-cta">
        <button className="btn btn-gold btn-lg btn-block" disabled={!ready || buying} onClick={buy}>
          {buying ? (
            <span className="spinner" />
          ) : ready ? (
            <>
              BUY TICKET · <Coin size={18} /> {lottery.ticketPrice}
            </>
          ) : (
            `Select ${lottery.pick - picked.length} more`
          )}
        </button>
      </div>

      {bought && (
        <Portal>
        <div className="overlay">
          <div className="sheet anim-pop">
            <div className="sheet-emoji">🎟️</div>
            <h3>Ticket booked!</h3>
            <p className="muted">
              #{bought.id} · Good luck, draw in <Countdown target={lottery.drawAt} size="xs" />
            </p>
            <div className="ball-row center-row">
              {bought.numbers.map((n) => (
                <Ball key={n} n={n} variant="gold" />
              ))}
            </div>
            <button className="btn btn-gold btn-lg btn-block" onClick={() => nav(`/lottery/draw/${bought.id}`, { replace: true })}>
              ▶ Watch Live Draw (Demo)
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => nav('/lottery?tab=My Tickets', { replace: true })}>
              View my tickets
            </button>
            <button
              className="link-btn center-block"
              onClick={() => {
                setBought(null);
                setPicked([]);
              }}
            >
              Buy another ticket
            </button>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
