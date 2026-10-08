import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmt, vibrate } from '../utils';
import Coin from '../components/Coin';
import TopBar from '../components/TopBar';

const BRUSH = 22;
const REVEAL_AT = 0.5;

function ScratchSurface({ onReveal, revealed }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const moves = useRef(0);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const r = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, '#d4a017');
    g.addColorStop(0.5, '#fde68a');
    g.addColorStop(1, '#b7791f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, r.width, r.height);
    ctx.fillStyle = 'rgba(120,70,0,.18)';
    for (let y = 0; y < r.height; y += 26) {
      for (let x = (y / 26) % 2 ? 13 : 0; x < r.width; x += 26) {
        ctx.font = '14px serif';
        ctx.fillText('✦', x, y + 16);
      }
    }
    ctx.fillStyle = '#7c4a03';
    ctx.font = '800 20px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', r.width / 2, r.height / 2 - 4);
    ctx.font = '500 12px Poppins, sans-serif';
    ctx.fillText('Match 3 symbols to win', r.width / 2, r.height / 2 + 18);
  }, []);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const clearedRatio = () => {
    const c = canvasRef.current;
    const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 40) {
      total++;
      if (data[i] === 0) clear++;
    }
    return clear / total;
  };

  const scratch = (e) => {
    if (!drawing.current || revealed) return;
    const ctx = canvasRef.current.getContext('2d');
    const [x, y] = pos(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = BRUSH * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const [lx, ly] = last.current || [x, y];
    ctx.moveTo(lx, ly);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = [x, y];
    if (++moves.current % 8 === 0) {
      vibrate(5);
      if (clearedRatio() > REVEAL_AT) onReveal();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`scratch-canvas ${revealed ? 'gone' : ''}`}
      onPointerDown={(e) => {
        drawing.current = true;
        last.current = null;
        e.currentTarget.setPointerCapture(e.pointerId);
        scratch(e);
      }}
      onPointerMove={scratch}
      onPointerUp={() => (drawing.current = false)}
      onPointerCancel={() => (drawing.current = false)}
    />
  );
}

export default function ScratchCard() {
  const { config, buyScratchCard, revealScratchCard, settleWin, applyTransactions, celebrate } = useApp();
  const { price, prizes } = config.scratch;
  const [card, setCard] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [busy, setBusy] = useState(false);
  const [played, setPlayed] = useState(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true; // re-set after StrictMode remounts
    return () => {
      mounted.current = false;
    };
  }, []);

  const buy = async () => {
    setBusy(true);
    const next = await buyScratchCard(); // server decides the symbols & prize
    setBusy(false);
    if (!next) return;
    setCard(next);
    setRevealed(false);
    setPrize(null);
    setPlayed((p) => p + 1);
  };

  const reveal = async () => {
    if (revealed) return;
    setRevealed(true);
    const res = await revealScratchCard(card.id);
    if (!res) return;
    if (!mounted.current) return applyTransactions(res.winTransaction);
    setPrize(res.prize);
    setTimeout(() => {
      if (res.winTransaction) settleWin(res.winTransaction, { emoji: card.symbols[0] });
      else celebrate({ amount: 0, title: 'ALMOST!', subtitle: 'Only 2 matched. Grab another card!' });
    }, 700);
  };

  return (
    <div className="screen anim-slide">
      <TopBar title="Scratch & Win" />

      <div className="scratch-hero">
        <h2>
          Win up to <span className="gold-text">{fmt(Math.max(...prizes))}</span> coins
        </h2>
        <p className="muted tiny">Each card costs {price} coins · {played} played this session</p>
      </div>

      <div className="scratch-card">
        <div className="scratch-ribbon">LUCKY SCRATCH</div>
        {card ? (
          <div className="scratch-area" key={card.id}>
            <div className="scratch-under">
              <div className="sym-row">
                {card.symbols.map((s, i) => (
                  <span key={i} className={`sym ${prize ? 'win' : ''}`}>
                    {s}
                  </span>
                ))}
              </div>
              <div className="scratch-prize">
                {prize === null ? (
                  'Match 3 to win'
                ) : prize ? (
                  <>
                    <Coin size={22} /> {fmt(prize)}
                  </>
                ) : (
                  'No win'
                )}
              </div>
            </div>
            <ScratchSurface onReveal={reveal} revealed={revealed} />
          </div>
        ) : (
          <div className="scratch-area scratch-empty">
            <span className="big-emoji float">🎫</span>
            <p>Buy a card to start scratching</p>
          </div>
        )}
      </div>

      {card && !revealed ? (
        <button className="btn btn-ghost btn-block" onClick={reveal}>
          Reveal all
        </button>
      ) : (
        <button className="btn btn-gold btn-lg btn-block pulse" disabled={busy || (revealed && prize === null)} onClick={buy}>
          {busy ? <span className="spinner" /> : <>{card ? 'BUY ANOTHER' : 'BUY CARD'} · <Coin size={18} /> {price}</>}
        </button>
      )}

      <div className="card">
        <h4 className="card-title">💰 Prizes</h4>
        <div className="prize-chips">
          {prizes.map((p) => (
            <span key={p} className="prize-chip">
              <Coin size={14} /> {fmt(p)}
            </span>
          ))}
        </div>
      </div>
      <div className="bottom-space sm" />
    </div>
  );
}
