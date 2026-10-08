import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { fmt } from '../utils';
import BalancePill from '../components/BalancePill';
import Coin from '../components/Coin';
import Countdown from '../components/Countdown';
import GameCard from '../components/GameCard';
import SectionTitle from '../components/SectionTitle';
import TaskItem from '../components/TaskItem';

function WinnersTicker({ items: feed }) {
  if (!feed?.length) return null;
  const items = [...feed, ...feed];
  return (
    <div className="ticker">
      <span className="ticker-live">LIVE</span>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {items.map((t, i) => (
            <span key={i} className="ticker-item">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BannerCarousel({ banners }) {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const touchX = useRef(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [i]);
  const onEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) setI((x) => (x + (dx < 0 ? 1 : banners.length - 1)) % banners.length);
  };
  return (
    <div className="carousel" onTouchStart={(e) => (touchX.current = e.touches[0].clientX)} onTouchEnd={onEnd}>
      <div className="carousel-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {banners.map((b) => (
          <div key={b.id} className="banner" style={{ background: b.gradient }} onClick={() => nav(b.route)}>
            <div className="banner-text">
              <span className="banner-title">{b.title}</span>
              <span className="banner-highlight">{b.highlight}</span>
              <span className="banner-sub">{b.subtitle}</span>
              <span className="btn btn-sm btn-white">{b.cta}</span>
            </div>
            <span className="banner-emoji">{b.emoji}</span>
            <span className="banner-sparkle s1">✦</span>
            <span className="banner-sparkle s2">✦</span>
            <span className="banner-sparkle s3">✧</span>
          </div>
        ))}
      </div>
      <div className="dots">
        {banners.map((b, k) => (
          <span key={b.id} className={k === i ? 'on' : ''} onClick={() => setI(k)} />
        ))}
      </div>
    </div>
  );
}

function DailyCheckin() {
  const { checkin, claimCheckin, config } = useApp();
  const [claiming, setClaiming] = useState(false);
  const claim = async () => {
    setClaiming(true);
    await claimCheckin();
    setClaiming(false);
  };
  const { dailyRewards } = config;
  return (
    <div className="card checkin">
      <div className="checkin-head">
        <div>
          <h4>📅 Daily Check-in</h4>
          <span className="muted tiny">
            {checkin.streak}-day streak · Day {dailyRewards.length} = {fmt(dailyRewards[dailyRewards.length - 1])} coins!
          </span>
        </div>
        <button
          className={`btn btn-sm ${checkin.claimedToday ? 'btn-ghost' : 'btn-gold pulse'}`}
          disabled={checkin.claimedToday || claiming}
          onClick={claim}
        >
          {checkin.claimedToday ? 'Claimed ✓' : 'Claim'}
        </button>
      </div>
      <div className="checkin-days">
        {dailyRewards.map((r, i) => {
          const claimed = i < checkin.streak;
          const today = i === checkin.streak && !checkin.claimedToday;
          return (
            <div key={i} className={`day ${claimed ? 'claimed' : ''} ${today ? 'today' : ''} ${i === dailyRewards.length - 1 ? 'big' : ''}`}>
              <span className="day-label">Day {i + 1}</span>
              <span className="day-icon">{claimed ? '✓' : i === dailyRewards.length - 1 ? '🎁' : <Coin size={18} />}</span>
              <span className="day-reward">{r}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NextDrawCard({ lottery: l }) {
  const nav = useNavigate();
  if (!l) return null;
  return (
    <div className="card next-draw" onClick={() => nav(`/lottery/${l.id}`)}>
      <div className="nd-top">
        <span className="nd-badge">🎟️ NEXT DRAW · {l.name}</span>
        <span className="muted tiny">{fmt(l.participants)} joined</span>
      </div>
      <div className="nd-jackpot">
        <Coin size={30} spin />
        <span className="jackpot-num">{fmt(l.jackpot)}</span>
      </div>
      <div className="nd-bottom">
        <Countdown target={l.drawAt} size="sm" />
        <span className="btn btn-sm btn-gold">Play for {l.ticketPrice}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { user, notifications, config, lotteries, tasks } = useApp();
  const unread = notifications.filter((n) => n.unread).length;
  const board = useApi(() => api.getLeaderboard('daily'), []);
  const top3 = board.data?.slice(0, 3);
  const nextDraw = [...lotteries].sort((a, b) => Date.parse(a.drawAt) - Date.parse(b.drawAt)).find((l) => l.jackpot >= 100000) || lotteries[0];

  return (
    <div className="screen anim-fade">
      <header className="home-header">
        <button className="hh-left" onClick={() => nav('/profile')}>
          <span className="avatar sm">{user.avatar}</span>
          <span className="hh-text">
            <span className="hh-hi">Hi, {user.name.split(' ')[0]} 👋</span>
            <span className="hh-level">
              Lv.{user.level} · {user.vipTier} VIP
            </span>
          </span>
        </button>
        <div className="hh-right">
          <BalancePill />
          <button className="icon-btn" onClick={() => nav('/notifications')} aria-label="Notifications">
            🔔{unread > 0 && <span className="badge">{unread}</span>}
          </button>
        </div>
      </header>

      <WinnersTicker items={config.winnersTicker} />
      <BannerCarousel banners={config.banners} />
      <DailyCheckin />

      <SectionTitle title="🔥 Play & Win" action="All games" onAction={() => nav('/games')} />
      <div className="game-grid">
        {config.games
          .filter((g) => !g.locked)
          .map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
      </div>

      <NextDrawCard lottery={nextDraw} />

      <SectionTitle title="⚡ Quick Earn" action="More tasks" onAction={() => nav('/earn')} />
      <div className="list">
        {tasks.slice(0, 3).map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
      </div>

      <SectionTitle title="🏆 Top Winners Today" action="Leaderboard" onAction={() => nav('/leaderboard')} />
      {top3?.length === 3 && (
      <div className="card mini-podium" onClick={() => nav('/leaderboard')}>
        {[top3[1], top3[0], top3[2]].map((p) => (
          <div key={p.rank} className={`mp-item r${p.rank}`}>
            {p.rank === 1 && <span className="crown">👑</span>}
            <span className="avatar">{p.avatar}</span>
            <span className="mp-name">{p.name}</span>
            <span className="mp-coins">
              <Coin size={12} /> {fmt(p.coins)}
            </span>
            <span className="mp-step">{p.rank}</span>
          </div>
        ))}
      </div>
      )}

      <div className="refer-banner" onClick={() => nav('/refer')}>
        <div>
          <h4>Invite friends, earn 500 each 🎁</h4>
          <p>Your friend also gets 200 bonus coins</p>
        </div>
        <span className="btn btn-sm btn-white">Invite</span>
      </div>
      <div className="bottom-space" />
    </div>
  );
}
