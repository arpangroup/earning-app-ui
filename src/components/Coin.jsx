export default function Coin({ size = 20, spin = false }) {
  return (
    <span className={`coin ${spin ? 'coin-spin' : ''}`} style={{ width: size, height: size, fontSize: size * 0.55 }}>
      <span>₵</span>
    </span>
  );
}
