import { useState } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { fmt } from '../utils';
import { Async } from '../components/States';
import Coin from '../components/Coin';
import TopBar from '../components/TopBar';

const PERIODS = { Daily: 'daily', Weekly: 'weekly', 'All Time': 'all' };

export default function Leaderboard() {
  const [tab, setTab] = useState('Daily');
  const { user, coins } = useApp();
  const result = useApi(() => api.getLeaderboard(PERIODS[tab]), [tab]);

  return (
    <div className="screen anim-slide lb-screen">
      <TopBar title="Leaderboard" showBalance={false} />
      <div className="segmented">
        {Object.keys(PERIODS).map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <Async result={result} label="Loading leaderboard…">
        {(board) => (
          <>
      <div className="podium" key={tab}>
        {[board[1], board[0], board[2]].filter(Boolean).map((p) => (
          <div key={p.rank} className={`pod pod-${p.rank}`}>
            {p.rank === 1 && <span className="crown float">👑</span>}
            <span className="avatar lg">{p.avatar}</span>
            <span className="pod-name">{p.name}</span>
            <span className="pod-coins">
              <Coin size={13} /> {fmt(p.coins)}
            </span>
            <div className="pod-step">
              <span>{p.rank}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card lb-list" key={`${tab}-list`}>
        {board.slice(3).map((p, i) => (
          <div key={p.rank} className="lb-row" style={{ animationDelay: `${i * 50}ms` }}>
            <span className="lb-rank">{p.rank}</span>
            <span className="avatar sm">{p.avatar}</span>
            <span className="lb-name">{p.name}</span>
            <span className="lb-coins">
              <Coin size={13} /> {fmt(p.coins)}
            </span>
          </div>
        ))}
      </div>
          </>
        )}
      </Async>

      <div className="lb-me">
        <span className="lb-rank">#{user.rank}</span>
        <span className="avatar sm">{user.avatar}</span>
        <span className="lb-name">You</span>
        <span className="lb-coins">
          <Coin size={13} /> {fmt(coins)}
        </span>
      </div>
    </div>
  );
}
