import { useApp } from '../context/AppContext';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import { fmt } from '../utils';
import Coin from './Coin';
import CoinRain from './CoinRain';
import Fireworks from './Fireworks';

function CountUp({ value }) {
  return <>{fmt(useAnimatedNumber(value, 1400, 0))}</>;
}

export default function WinModal() {
  const { celebration, closeCelebration } = useApp();
  if (!celebration) return null;
  const { amount = 0, title, subtitle, emoji } = celebration;
  const isWin = amount > 0;
  const big = amount >= 1000;

  return (
    <div className="overlay win-overlay" key={celebration.id} onClick={closeCelebration}>
      {isWin && <Fireworks duration={big ? 6500 : 4000} intensity={big ? 1.4 : 1} />}
      {isWin && <CoinRain count={big ? 45 : 26} />}
      <div className={`win-card ${isWin ? '' : 'lose'}`} onClick={(e) => e.stopPropagation()}>
        {isWin && <div className="win-rays" />}
        <div className="win-emoji">{emoji || (isWin ? (big ? '🏆' : '🎉') : '😢')}</div>
        <h2 className="win-title">{title || (isWin ? (big ? 'BIG WIN!' : 'YOU WON!') : 'SO CLOSE!')}</h2>
        {isWin && (
          <div className="win-amount">
            <Coin size={36} spin />
            <CountUp value={amount} />
          </div>
        )}
        <p className="win-sub">{subtitle || (isWin ? 'Coins added to your wallet' : 'Better luck next time!')}</p>
        <button className={`btn btn-lg ${isWin ? 'btn-gold pulse' : 'btn-purple'}`} onClick={closeCelebration}>
          {isWin ? 'COLLECT' : 'TRY AGAIN'}
        </button>
      </div>
    </div>
  );
}
