import Coin from './Coin';

export function Loader({ label = 'Loading…', full = false }) {
  return (
    <div className={`state ${full ? 'state-full' : ''}`}>
      <Coin size={44} spin />
      <span className="muted tiny">{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry, full = false }) {
  return (
    <div className={`state ${full ? 'state-full' : ''}`}>
      <span className="big-emoji">📡</span>
      <b>Couldn’t load this</b>
      <span className="muted tiny center">{error?.message || 'Something went wrong'}</span>
      {onRetry && (
        <button className="btn btn-gold btn-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

/** Renders loader / error / children for a useApi() result. */
export function Async({ result, children, label }) {
  if (result.error && result.data === undefined) return <ErrorState error={result.error} onRetry={result.reload} />;
  if (result.data === undefined) return <Loader label={label} />;
  return children(result.data);
}
