import { useNavigate } from 'react-router-dom';
import BalancePill from './BalancePill';

export default function TopBar({ title, showBalance = true, right }) {
  const nav = useNavigate();
  const back = () => (window.history.length > 1 ? nav(-1) : nav('/home'));
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={back} aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">{right ?? (showBalance ? <BalancePill /> : <span style={{ width: 40 }} />)}</div>
    </header>
  );
}
