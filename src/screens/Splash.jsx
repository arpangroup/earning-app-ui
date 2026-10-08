import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { session } from '../api';
import Coin from '../components/Coin';

export default function Splash() {
  const nav = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => nav(session.isLoggedIn() ? '/home' : '/login', { replace: true }), 2600);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div className="screen splash">
      <div className="splash-glow" />
      <div className="splash-orbit">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="orbit-coin" style={{ '--i': i }}>
            <Coin size={26} />
          </span>
        ))}
        <div className="splash-logo">
          <span>🍀</span>
        </div>
      </div>
      <h1 className="splash-title">
        Lucky<span>Coin</span>
      </h1>
      <p className="splash-tag">Play • Win • Earn Real Rewards</p>
      <div className="splash-loader">
        <span />
      </div>
    </div>
  );
}
