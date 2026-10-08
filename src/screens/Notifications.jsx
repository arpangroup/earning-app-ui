import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';
import { timeAgo } from '../utils';

export default function Notifications() {
  const { notifications, markAllRead } = useApp();
  return (
    <div className="screen anim-slide">
      <TopBar
        title="Notifications"
        right={
          <button className="link-btn" onClick={markAllRead}>
            Read all
          </button>
        }
      />
      <div className="list">
        {notifications.map((n, i) => (
          <div key={n.id} className={`notif ${n.unread ? 'unread' : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="notif-icon">{n.icon}</span>
            <div className="notif-body">
              <b>{n.title}</b>
              <p>{n.body}</p>
              <span className="tiny muted">{timeAgo(n.createdAt)}</span>
            </div>
            {n.unread && <span className="dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}
