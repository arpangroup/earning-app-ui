import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import { fmt } from '../utils';
import Coin from './Coin';

export default function BalancePill() {
  const { coins } = useApp();
  const shown = useAnimatedNumber(coins);
  const nav = useNavigate();
  return (
    <button className="balance-pill" onClick={() => nav('/wallet')}>
      <Coin size={22} spin />
      <span className="balance-num">{fmt(shown)}</span>
      <span className="balance-plus">+</span>
    </button>
  );
}
