import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import { fmt, formatDateTime } from '../utils';
import Coin from '../components/Coin';

const filters = {
  All: () => true,
  Earned: (t) => t.amount > 0,
  Spent: (t) => t.type === 'spend',
  Withdrawals: (t) => t.type === 'withdraw',
};

export default function Wallet() {
  const nav = useNavigate();
  const { coins, transactions, user, config } = useApp();
  const { coinsPerRupee } = config.app;
  const [filter, setFilter] = useState('All');
  const shown = useAnimatedNumber(coins);
  const list = transactions.filter(filters[filter]);

  return (
    <div className="screen anim-fade">
      <header className="page-header">
        <div>
          <h1>My Wallet</h1>
          <p className="muted tiny">
            {coinsPerRupee} coins = ₹1 · instant payouts
          </p>
        </div>
      </header>

      <div className="wallet-card">
        <div className="wc-shine" />
        <span className="tiny wc-label">Total balance</span>
        <div className="wc-balance">
          <Coin size={34} spin />
          <span>{fmt(shown)}</span>
        </div>
        <span className="wc-inr">≈ ₹{(coins / coinsPerRupee).toFixed(2)}</span>
        <div className="wc-actions">
          <button className="btn btn-white" onClick={() => nav('/withdraw')}>
            ⬆ Withdraw
          </button>
          <button className="btn btn-glass" onClick={() => nav('/earn')}>
            ＋ Earn more
          </button>
        </div>
        <span className="wc-id">ID {user.id}</span>
      </div>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-num gold-text">{fmt(user.totalEarned)}</span>
          <span className="tiny muted">Lifetime earned</span>
        </div>
        <div className="stat">
          <span className="stat-num">₹{fmt(user.totalWithdrawnInr || 0)}</span>
          <span className="tiny muted">Withdrawn</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.winRate}%</span>
          <span className="tiny muted">Win rate</span>
        </div>
      </div>

      <div className="chips">
        {Object.keys(filters).map((f) => (
          <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="card txn-list">
        {list.length === 0 && <p className="muted center">No transactions</p>}
        {list.map((t) => (
          <div key={t.id} className="txn anim-fade">
            <span className="txn-icon">{t.icon}</span>
            <div className="txn-body">
              <span className="txn-title">{t.title}</span>
              <span className="tiny muted">{formatDateTime(t.createdAt)}</span>
            </div>
            <span className={`txn-amt ${t.amount > 0 ? 'pos' : 'neg'}`}>
              {t.amount > 0 ? '+' : '−'}
              {fmt(Math.abs(t.amount))}
            </span>
          </div>
        ))}
      </div>
      <div className="bottom-space" />
    </div>
  );
}
