import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function GameCard({ game, wide = false }) {
  const nav = useNavigate();
  const { showToast } = useApp();
  const open = () => (game.locked ? showToast(`${game.name} is coming soon 🚀`) : nav(game.route));
  return (
    <button className={`game-card ${wide ? 'wide' : ''} ${game.locked ? 'locked' : ''}`} style={{ background: game.gradient }} onClick={open}>
      <span className={`game-tag tag-${game.tag?.toLowerCase()}`}>{game.tag}</span>
      <span className="game-icon">{game.icon}</span>
      <span className="game-name">{game.name}</span>
      <span className="game-desc">{game.desc}</span>
      {game.players && <span className="game-players">● {game.players} playing</span>}
      <span className="game-shine" />
    </button>
  );
}
