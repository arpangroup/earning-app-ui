import { api } from '../api';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { Loader, ErrorState } from '../components/States';
import { fmt } from '../utils';
import Coin from '../components/Coin';
import TopBar from '../components/TopBar';

export default function Refer() {
  const { user, showToast } = useApp();
  const result = useApi(() => api.getReferral(), []);
  const referral = result.data;
  const link = `https://luckycoin.app/i/${user.referralCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(user.referralCode);
      showToast('Referral code copied! 📋', 'success');
    } catch {
      showToast(`Your code: ${user.referralCode}`);
    }
  };

  const share = async () => {
    const text = `Join me on LuckyCoin and get ${referral.friendBonus} bonus coins! Use code ${user.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'LuckyCoin', text, url: link });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  if (!referral) {
    return (
      <div className="screen anim-slide">
        <TopBar title="Refer & Earn" />
        {result.error ? <ErrorState error={result.error} onRetry={result.reload} /> : <Loader />}
      </div>
    );
  }

  return (
    <div className="screen anim-slide">
      <TopBar title="Refer & Earn" />

      <div className="refer-hero">
        <span className="big-emoji float">🎁</span>
        <h2>
          Earn <span className="gold-text">{referral.perInvite}</span> coins per friend
        </h2>
        <p className="muted tiny">Your friend gets {referral.friendBonus} coins too</p>
        <div className="code-box">
          <span className="code">{user.referralCode}</span>
          <button className="btn btn-sm btn-gold" onClick={copy}>
            Copy
          </button>
        </div>
        <button className="btn btn-lg btn-block btn-green" onClick={share}>
          📤 Share invite link
        </button>
      </div>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-num">{referral.invited}</span>
          <span className="tiny muted">Invited</span>
        </div>
        <div className="stat">
          <span className="stat-num">{referral.joined}</span>
          <span className="tiny muted">Joined</span>
        </div>
        <div className="stat">
          <span className="stat-num gold-text">{fmt(referral.earned)}</span>
          <span className="tiny muted">Coins earned</span>
        </div>
      </div>

      <div className="card">
        <h4 className="card-title">How it works</h4>
        <div className="steps">
          {referral.steps.map((s, i) => (
            <div key={i} className="step">
              <span className="step-icon">{s.icon}</span>
              <div>
                <b>{s.title}</b>
                <p className="tiny muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h4 className="card-title">Your friends</h4>
        {referral.friends.map((f) => (
          <div key={f.name} className="row-line">
            <span>
              <span className="avatar xs">{f.avatar}</span> {f.name}
            </span>
            <span className={`status ${f.status === 'Joined' ? 'status-won' : 'status-pending'}`}>{f.status}</span>
            <span className="gold-text">{f.reward ? <><Coin size={12} /> +{f.reward}</> : '—'}</span>
          </div>
        ))}
      </div>
      <div className="bottom-space sm" />
    </div>
  );
}
