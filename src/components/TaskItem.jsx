import { useApp } from '../context/AppContext';
import { fmt } from '../utils';
import Coin from './Coin';

export default function TaskItem({ task }) {
  const { completedTasks, startTask } = useApp();
  const done = completedTasks.includes(task.id);
  return (
    <div className={`task-item ${done ? 'done' : ''}`}>
      <div className="task-icon">{task.icon}</div>
      <div className="task-body">
        <div className="task-title">
          {task.title} {task.hot && <span className="mini-tag">HOT</span>}
        </div>
        <div className="task-desc">{task.desc}</div>
        <div className="task-reward">
          <Coin size={14} /> +{fmt(task.reward)}
        </div>
      </div>
      <button className={`btn btn-sm ${done ? 'btn-ghost' : 'btn-gold'}`} disabled={done} onClick={() => startTask(task)}>
        {done ? '✓ Done' : task.cta}
      </button>
    </div>
  );
}
