import { useState } from 'react';
import { useApp } from '../context/AppContext';
import BalancePill from '../components/BalancePill';
import GameCard from '../components/GameCard';

const filters = ['All', 'Instant', 'Lottery', 'Coming Soon'];
const match = (g, f) =>
  f === 'All' ||
  (f === 'Coming Soon' && g.locked) ||
  (f === 'Lottery' && g.id === 'lottery') ||
  (f === 'Instant' && !g.locked && g.id !== 'lottery');

export default function Games() {
  const [filter, setFilter] = useState('All');
  const { config } = useApp();
  return (
    <div className="screen anim-fade">
      <header className="page-header">
        <div>
          <h1>Game Zone</h1>
          <p className="muted tiny">Play daily. Win coins. Cash out.</p>
        </div>
        <BalancePill />
      </header>

      <div className="hero-game">
        <div className="hg-text">
          <span className="mini-tag">FEATURED</span>
          <h2>Jackpot Hour 🔥</h2>
          <p>All game rewards are 2× until 10 PM tonight</p>
        </div>
        <div className="hg-dice">🎲</div>
      </div>

      <div className="chips">
        {filters.map((f) => (
          <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="game-grid">
        {config.games
          .filter((g) => match(g, filter))
          .map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
      </div>
      <div className="bottom-space" />
    </div>
  );
}
