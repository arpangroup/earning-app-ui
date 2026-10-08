import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fmt, vibrate } from '../utils';
import Coin from '../components/Coin';
import TopBar from '../components/TopBar';
import { Ball } from './Lottery';

const REVEAL_MS = 1500;

export default function LotteryDraw() {
  const { ticketId } = useParams();
  const nav = useNavigate();
  const { tickets, lotteries, drawTicket, updateTicket, settleWin, applyTransactions, celebrate } = useApp();
  const ticket = tickets.find((t) => t.id === ticketId);
  const lottery = ticket && lotteries.find((l) => l.id === ticket.lotteryId);
  const alreadyDrawn = ticket && ticket.status !== 'pending';

  const [drawn, setDrawn] = useState(alreadyDrawn ? ticket.drawn || [] : []);
  const [revealed, setRevealed] = useState(alreadyDrawn ? drawn.length : 0);
  const [phase, setPhase] = useState(alreadyDrawn ? 'done' : 'ready'); // ready | requesting | drawing | done
  const pending = useRef(null); // server result not yet shown to the user

  // If the user leaves mid-draw, still record the result (silently).
  useEffect(
    () => () => {
      if (!pending.current) return;
      updateTicket(pending.current.ticket);
      applyTransactions(pending.current.winTransaction);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const start = async () => {
    setPhase('requesting');
    const res = await drawTicket(ticketId); // server draws the numbers
    if (!res) return setPhase('ready');
    pending.current = res;
    setDrawn(res.ticket.drawn);
    setPhase('drawing');
  };

  useEffect(() => {
    if (phase !== 'drawing') return;
    if (revealed < drawn.length) {
      const t = setTimeout(() => {
        setRevealed((r) => r + 1);
        vibrate(25);
      }, REVEAL_MS);
      return () => clearTimeout(t);
    }
    const res = pending.current;
    if (!res) return;
    pending.current = null;
    updateTicket(res.ticket);
    setPhase('done');
    const { matches } = res.ticket;
    setTimeout(() => {
      if (res.winTransaction) {
        settleWin(res.winTransaction, matches === lottery.pick ? { title: 'JACKPOT!!', emoji: '👑' } : { emoji: '🎟️' });
      } else {
        celebrate({ amount: 0, title: `${matches} MATCH${matches === 1 ? '' : 'ES'}`, subtitle: 'Not this time — your next ticket could be the one!' });
      }
    }, 900);
  }, [phase, revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ticket || !lottery) {
    return (
      <div className="screen">
        <TopBar title="Live Draw" />
        <p className="center muted">Ticket not found.</p>
      </div>
    );
  }

  const shown = drawn.slice(0, revealed);
  const matches = ticket.numbers.filter((n) => shown.includes(n)).length;

  return (
    <div className="screen anim-slide draw-screen">
      <TopBar title="Live Draw" />
      <div className="draw-title">
        <span className="live-dot" /> {lottery.name}
      </div>

      <div className={`globe ${phase === 'drawing' && revealed < drawn.length ? 'mixing' : ''}`}>
        <div className="globe-glass" />
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="globe-ball" style={{ '--i': i, '--x': `${(i * 37) % 80}%`, '--d': `${(i % 5) * 0.12}s` }}>
            {((i * 7) % lottery.maxNumber) + 1}
          </span>
        ))}
        <div className="globe-base" />
      </div>

      <div className="drawn-row">
        {Array.from({ length: lottery.pick }, (_, i) =>
          i < revealed ? (
            <Ball key={i} n={drawn[i]} variant={`pop ${ticket.numbers.includes(drawn[i]) ? 'match' : 'gold'}`} />
          ) : (
            <span key={i} className="ball empty">?</span>
          )
        )}
      </div>

      <div className="card your-ticket">
        <div className="ticket-head">
          <span>🎟️ Your ticket #{ticket.id}</span>
          <span className="gold-text">
            {matches}/{lottery.pick} matched
          </span>
        </div>
        <div className="ball-row center-row">
          {ticket.numbers.map((n) => (
            <Ball key={n} n={n} variant={shown.includes(n) ? 'match pop' : ''} />
          ))}
        </div>
      </div>

      {(phase === 'ready' || phase === 'requesting') && (
        <button className="btn btn-gold btn-lg btn-block pulse" disabled={phase === 'requesting'} onClick={start}>
          {phase === 'requesting' ? <span className="spinner" /> : '▶ START DRAW'}
        </button>
      )}
      {phase === 'drawing' && <p className="center muted">Drawing ball {Math.min(revealed + 1, lottery.pick)} of {lottery.pick}…</p>}
      {phase === 'done' && (
        <div className="draw-result">
          {ticket.prize ? (
            <p className="gold-text big-text">
              You won <Coin size={20} /> {fmt(ticket.prize)}!
            </p>
          ) : (
            <p className="muted">No prize this time.</p>
          )}
          <button className="btn btn-gold btn-lg btn-block" onClick={() => nav(`/lottery/${lottery.id}`, { replace: true })}>
            Play Again
          </button>
          <button className="btn btn-ghost btn-block" onClick={() => nav('/lottery?tab=My Tickets', { replace: true })}>
            My tickets
          </button>
        </div>
      )}
      <div className="bottom-space sm" />
    </div>
  );
}
