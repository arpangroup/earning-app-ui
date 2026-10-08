import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmt } from '../utils';
import Coin from './Coin';

/** Simulates watching an ad / completing an offer, then credits the reward. */
export default function TaskOverlay() {
  const { activeTask, finishTask, cancelTask } = useApp();
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!activeTask) return;
    setLeft(activeTask.duration);
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [activeTask]);

  useEffect(() => {
    if (activeTask && left <= 0) finishTask(activeTask);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  if (!activeTask) return null;
  const pct = 1 - Math.max(left, 0) / activeTask.duration;
  const C = 2 * Math.PI * 52;
  const isVideo = activeTask.category === 'Daily' && activeTask.cta === 'Watch';

  return (
    <div className="overlay task-overlay">
      <div className="task-sheet">
        <div className="task-sheet-icon">{activeTask.icon}</div>
        <h3>{activeTask.title}</h3>
        <p className="muted">{isVideo ? 'Sponsored video is playing…' : 'Verifying your task completion…'}</p>
        <div className="ring-wrap">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="52" stroke="rgba(255,255,255,.1)" strokeWidth="10" fill="none" />
            <circle
              cx="64" cy="64" r="52" stroke="url(#ringGrad)" strokeWidth="10" fill="none" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 64 64)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffd34d" />
                <stop offset="1" stopColor="#ff7a18" />
              </linearGradient>
            </defs>
          </svg>
          <span className="ring-num">{Math.max(left, 0)}</span>
        </div>
        <div className="task-sheet-reward">
          Reward <Coin size={16} /> <b>+{fmt(activeTask.reward)}</b>
        </div>
        <button className="btn btn-ghost" onClick={cancelTask}>Cancel</button>
      </div>
    </div>
  );
}
