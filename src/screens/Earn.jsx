import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmt } from '../utils';
import BalancePill from '../components/BalancePill';
import Coin from '../components/Coin';
import TaskItem from '../components/TaskItem';

export default function Earn() {
  const [cat, setCat] = useState('All');
  const { completedTasks, tasks, config } = useApp();
  const { taskCategories } = config;
  const list = tasks.filter((t) => cat === 'All' || t.category === cat);
  const earnedToday = tasks.filter((t) => completedTasks.includes(t.id)).reduce((s, t) => s + t.reward, 0);
  const available = tasks.filter((t) => !completedTasks.includes(t.id)).reduce((s, t) => s + t.reward, 0);
  const progress = completedTasks.length / tasks.length;

  return (
    <div className="screen anim-fade">
      <header className="page-header">
        <div>
          <h1>Earn Coins</h1>
          <p className="muted tiny">Complete tasks & offers for instant coins</p>
        </div>
        <BalancePill />
      </header>

      <div className="earn-hero">
        <div className="eh-col">
          <span className="tiny">Earned today</span>
          <span className="eh-num">
            <Coin size={20} /> {fmt(earnedToday)}
          </span>
        </div>
        <div className="eh-divider" />
        <div className="eh-col">
          <span className="tiny">Still available</span>
          <span className="eh-num">
            <Coin size={20} /> {fmt(available)}
          </span>
        </div>
        <div className="eh-progress">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="tiny eh-caption">
          {completedTasks.length}/{tasks.length} tasks completed · finish all for a 🎁 bonus chest
        </span>
      </div>

      <div className="chips">
        {taskCategories.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="list">
        {list.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
      </div>
      <div className="bottom-space" />
    </div>
  );
}
