import { NavLink } from 'react-router-dom';

const Icon = ({ d }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const tabs = [
  { to: '/home', label: 'Home', icon: <Icon d={<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>} /> },
  { to: '/games', label: 'Games', icon: <Icon d={<><rect x="2" y="7" width="20" height="12" rx="4" /><path d="M7 11v4M5 13h4M16 12h.01M18 14h.01" /></>} /> },
  { to: '/earn', label: 'Earn', center: true },
  { to: '/wallet', label: 'Wallet', icon: <Icon d={<><rect x="2" y="6" width="20" height="14" rx="3" /><path d="M16 13h2M2 10h20" /></>} /> },
  { to: '/profile', label: 'Profile', icon: <Icon d={<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>} /> },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map((t) =>
        t.center ? (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `nav-center ${isActive ? 'active' : ''}`}>
            <span className="nav-center-btn">💰</span>
            <span className="nav-label">{t.label}</span>
          </NavLink>
        ) : (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {t.icon}
            <span className="nav-label">{t.label}</span>
          </NavLink>
        )
      )}
    </nav>
  );
}
