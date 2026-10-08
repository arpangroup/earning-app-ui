import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import useApi from '../hooks/useApi';
import { fmt, formatDateTime, timeAgo } from '../utils';
import { Async } from '../components/States';
import Coin from '../components/Coin';
import Countdown from '../components/Countdown';
import TopBar from '../components/TopBar';

const tabs = ['Draws', 'My Tickets', 'Results'];

export function Ball({ n, variant = '', small = false }) {
  return <span className={`ball ${variant} ${small ? 'small' : ''}`}>{n}</span>;
}

function DrawCard({ l }) {
  const nav = useNavigate();
  return (
    <div className="draw-card" style={{ '--g': l.gradient }}>
      <div className="dc-head">
        <span className="dc-icon">{l.icon}</span>
        <div>
          <h4>{l.name}</h4>
          <span className="tiny muted">
            Pick {l.pick} of {l.maxNumber} · {fmt(l.participants)} players
          </span>
        </div>
      </div>
      <div className="dc-jackpot">
        <span className="tiny">JACKPOT</span>
        <span className="dc-amount">
          <Coin size={26} spin /> {fmt(l.jackpot)}
        </span>
      </div>
      <div className="dc-foot">
        <div>
          <span className="tiny muted">Draw in</span>
          <Countdown target={l.drawAt} size="sm" />
        </div>
        <button className="btn btn-gold" onClick={() => nav(`/lottery/${l.id}`)}>
          Buy <Coin size={14} /> {l.ticketPrice}
        </button>
      </div>
    </div>
  );
}

function TicketCard({ t }) {
  const nav = useNavigate();
  const { lotteries } = useApp();
  const l = lotteries.find((x) => x.id === t.lotteryId);
  if (!l) return null;
  return (
    <div className={`ticket ticket-${t.status}`}>
      <div className="ticket-left">
        <div className="ticket-head">
          <span>
            {l.icon} {l.name}
          </span>
          <span className={`status status-${t.status}`}>{t.status === 'pending' ? 'Awaiting draw' : t.status === 'won' ? 'WON' : 'No win'}</span>
        </div>
        <div className="ball-row">
          {t.numbers.map((n) => (
            <Ball key={n} n={n} small variant={t.drawn?.includes(n) ? 'match' : ''} />
          ))}
        </div>
        <span className="tiny muted">
          #{t.id} · {formatDateTime(t.boughtAt)}
          {t.status === 'won' && (
            <b className="gold-text">
              {' '}
              · +{fmt(t.prize)}
            </b>
          )}
        </span>
      </div>
      <div className="ticket-right">
        {t.status === 'pending' ? (
          <button className="btn btn-sm btn-gold" onClick={() => nav(`/lottery/draw/${t.id}`)}>
            ▶ Live Draw
          </button>
        ) : (
          <button className="btn btn-sm btn-ghost" onClick={() => nav(`/lottery/draw/${t.id}`)}>
            View
          </button>
        )}
      </div>
    </div>
  );
}

export default function Lottery() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'Draws';
  const { tickets, lotteries } = useApp();
  const results = useApi(() => (tab === 'Results' ? api.getLotteryResults() : Promise.resolve(undefined)), [tab]);

  return (
    <div className="screen anim-slide">
      <TopBar title="Lottery" />
      <div className="segmented">
        {tabs.map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setParams({ tab: t }, { replace: true })}>
            {t}
            {t === 'My Tickets' && <span className="seg-count">{tickets.filter((x) => x.status === 'pending').length}</span>}
          </button>
        ))}
      </div>

      {tab === 'Draws' && (
        <div className="list">
          {lotteries.map((l) => (
            <DrawCard key={l.id} l={l} />
          ))}
        </div>
      )}

      {tab === 'My Tickets' && (
        <div className="list">
          {tickets.length === 0 && <p className="muted center">No tickets yet</p>}
          {tickets.map((t) => (
            <TicketCard key={t.id} t={t} />
          ))}
        </div>
      )}

      {tab === 'Results' && (
        <Async result={results} label="Loading results…">
          {(list) => (
        <div className="list">
          {list.map((r) => {
            const l = lotteries.find((x) => x.id === r.lotteryId);
            if (!l) return null;
            return (
              <div key={r.id} className="card result-card">
                <div className="ticket-head">
                  <span>
                    {l.icon} {l.name}
                  </span>
                  <span className="tiny muted">{timeAgo(r.drawnAt)}</span>
                </div>
                <div className="ball-row">
                  {r.numbers.map((n) => (
                    <Ball key={n} n={n} small variant="gold" />
                  ))}
                </div>
                <div className="row-line">
                  <span className="muted tiny">Winner</span>
                  <span>{r.winner}</span>
                  <span className="gold-text">{r.prize ? `+${fmt(r.prize)}` : 'Rolls over'}</span>
                </div>
              </div>
            );
          })}
        </div>
          )}
        </Async>
      )}
      <div className="bottom-space sm" />
    </div>
  );
}
