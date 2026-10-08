import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { env } from '../config/env';
import { fmt } from '../utils';

function Toggle({ on, onChange }) {
  return <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on} />;
}

export default function Profile() {
  const nav = useNavigate();
  const { user, notifications, showToast, config, logout } = useApp();
  const { vipTiers } = config;
  const [settings, setSettings] = useState({ sound: true, vibration: true, push: true });
  const unread = notifications.filter((n) => n.unread).length;
  const tierIdx = Math.max(0, vipTiers.findIndex((t) => t.name === user.vipTier));
  const nextTier = vipTiers[tierIdx + 1];

  const menu = [
    { icon: '🎁', label: 'Refer & Earn', sub: 'Earn 500 per friend', to: '/refer' },
    { icon: '🏆', label: 'Leaderboard', sub: `You are #${user.rank}`, to: '/leaderboard' },
    { icon: '🔔', label: 'Notifications', badge: unread, to: '/notifications' },
    { icon: '🧾', label: 'Transaction history', to: '/wallet' },
    { icon: '🏧', label: 'Withdraw', to: '/withdraw' },
    { icon: '🎟️', label: 'My lottery tickets', to: '/lottery?tab=My Tickets' },
  ];

  return (
    <div className="screen anim-fade">
      <div className="profile-hero">
        <div className="avatar-ring">
          <span className="avatar xl">{user.avatar}</span>
          <span className="level-chip">Lv.{user.level}</span>
        </div>
        <h2>{user.name}</h2>
        <p className="muted tiny">
          {user.phone} · ID {user.id}
        </p>
      </div>

      <div className="vip-card">
        <div className="vip-head">
          <span className="vip-badge">👑 {user.vipTier} VIP</span>
          <span className="tiny">{nextTier ? `Next: ${nextTier.name}` : 'Max tier'}</span>
        </div>
        <div className="xp-bar">
          <span style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }} />
        </div>
        <div className="vip-foot tiny">
          <span>
            {fmt(user.xp)} / {fmt(user.nextLevelXp)} XP
          </span>
          <span>{vipTiers[tierIdx].perk}</span>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-num gold-text">{fmt(user.totalEarned)}</span>
          <span className="tiny muted">Coins earned</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.gamesPlayed}</span>
          <span className="tiny muted">Games played</span>
        </div>
        <div className="stat">
          <span className="stat-num">{user.joined}</span>
          <span className="tiny muted">Member since</span>
        </div>
      </div>

      <div className="card menu">
        {menu.map((m) => (
          <button key={m.label} className="menu-item" onClick={() => nav(m.to)}>
            <span className="menu-icon">{m.icon}</span>
            <span className="menu-body">
              <span>{m.label}</span>
              {m.sub && <span className="tiny muted">{m.sub}</span>}
            </span>
            {m.badge > 0 && <span className="badge static">{m.badge}</span>}
            <span className="chev">›</span>
          </button>
        ))}
      </div>

      <div className="card menu">
        {[
          ['sound', '🔊', 'Sound effects'],
          ['vibration', '📳', 'Vibration'],
          ['push', '📣', 'Push notifications'],
        ].map(([k, icon, label]) => (
          <div key={k} className="menu-item">
            <span className="menu-icon">{icon}</span>
            <span className="menu-body">{label}</span>
            <Toggle on={settings[k]} onChange={(v) => setSettings((s) => ({ ...s, [k]: v }))} />
          </div>
        ))}
        <button className="menu-item" onClick={() => showToast(`Support: ${config.app.supportEmail}`)}>
          <span className="menu-icon">💬</span>
          <span className="menu-body">Help & support</span>
          <span className="chev">›</span>
        </button>
        <button className="menu-item danger" onClick={async () => {
            await logout();
            nav('/login', { replace: true });
          }}>
          <span className="menu-icon">🚪</span>
          <span className="menu-body">Log out</span>
        </button>
      </div>
      <p className="tiny muted center">LuckyCoin v1.0.0 · {env.name}{env.useMock ? ' (mock)' : ''} · Play responsibly · 18+</p>
      <div className="bottom-space" />
    </div>
  );
}
