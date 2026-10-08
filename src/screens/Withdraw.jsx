import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fmt } from '../utils';
import Coin from '../components/Coin';
import Fireworks from '../components/Fireworks';
import TopBar from '../components/TopBar';

export default function Withdraw() {
  const nav = useNavigate();
  const { coins, withdraw, config } = useApp();
  const { withdrawMethods, withdrawAmounts } = config;
  const { coinsPerRupee } = config.app;
  const [method, setMethod] = useState(withdrawMethods[0]);
  const [amount, setAmount] = useState(withdrawAmounts[1] ?? withdrawAmounts[0]);
  const [result, setResult] = useState(null);
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('idle'); // idle | processing | done

  const cost = amount * coinsPerRupee;
  const canAfford = coins >= cost;

  const submit = async () => {
    setStatus('processing');
    const res = await withdraw({ methodId: method.id, amountInr: amount, account: account.trim() });
    setResult(res?.withdrawal || null);
    setStatus(res ? 'done' : 'idle');
  };

  if (status === 'done') {
    return (
      <div className="screen anim-fade success-screen">
        <Fireworks duration={3500} />
        <div className="success-check">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24" />
            <path d="M14 27l8 8 16-16" />
          </svg>
        </div>
        <h2>Withdrawal successful!</h2>
        <p className="big-text gold-text">₹{fmt(amount)}</p>
        <p className="muted center">
          Sent to {method.name}
          {account && ` · ${account}`}
          <br />
          Expected: {result?.eta || method.eta}
          {result?.id && <span className="tiny"> · Ref {result.id}</span>}
        </p>
        <button className="btn btn-gold btn-lg btn-block" onClick={() => nav('/wallet', { replace: true })}>
          Back to wallet
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => nav('/home', { replace: true })}>
          Keep playing
        </button>
      </div>
    );
  }

  return (
    <div className="screen anim-slide">
      <TopBar title="Withdraw" />

      <div className="card withdraw-balance">
        <span className="tiny muted">Available</span>
        <span className="wb-num">
          <Coin size={22} /> {fmt(coins)} <span className="muted tiny">≈ ₹{(coins / coinsPerRupee).toFixed(2)}</span>
        </span>
      </div>

      <h4 className="label">Payout method</h4>
      <div className="method-list">
        {withdrawMethods.map((m) => (
          <button key={m.id} className={`method ${method.id === m.id ? 'on' : ''}`} onClick={() => setMethod(m)}>
            <span className="method-icon">{m.icon}</span>
            <span className="method-body">
              <b>{m.name}</b>
              <span className="tiny muted">
                {m.eta} · Fee {m.fee}
              </span>
            </span>
            <span className="radio" />
          </button>
        ))}
      </div>

      <h4 className="label">Amount</h4>
      <div className="amount-grid">
        {withdrawAmounts.map((a) => (
          <button key={a} className={`amount ${amount === a ? 'on' : ''}`} onClick={() => setAmount(a)}>
            <b>₹{a}</b>
            <span className="tiny">{fmt(a * coinsPerRupee)} coins</span>
          </button>
        ))}
      </div>

      <h4 className="label">{method.name} details</h4>
      <input className="input" placeholder={method.placeholder} value={account} onChange={(e) => setAccount(e.target.value)} />

      <div className="sticky-cta">
        {!canAfford && <p className="tiny center warn">You need {fmt(cost - coins)} more coins for ₹{amount}</p>}
        <button className="btn btn-gold btn-lg btn-block" disabled={!canAfford || !account || status === 'processing'} onClick={submit}>
          {status === 'processing' ? <span className="spinner" /> : `WITHDRAW ₹${amount}`}
        </button>
      </div>
    </div>
  );
}
