# 🍀 LuckyCoin — Earning / Casino-style App UI (mobile only)

React 18 + Vite + React Router. Runs fully offline on **mock data locally** and talks to a
**real REST API** in dev / uat / production. Switching is configuration only; no code changes.

```bash
npm install
npm run dev          # local, mock backend  → http://localhost:5180 (use phone emulation in DevTools)
npm run screenshots  # regenerates docs/screens/*.jpg (needs `npm run dev` running)
```

## Environments

| Command | Env file | Backend | Ribbon |
|---|---|---|---|
| `npm run dev` | `.env.development` | **Mock** (in-browser, no network) | `LOCAL · MOCK` |
| `npm run dev:api` | `.env.dev` | DEV API, proxied through Vite (`/api` → `VITE_API_PROXY_TARGET`) | `DEV` |
| `npm run build:dev` | `.env.dev` | DEV API | `DEV` |
| `npm run build:uat` | `.env.uat` | UAT API | `UAT` |
| `npm run build` | `.env.production` | Production API | *(hidden)* |

| Variable | Meaning |
|---|---|
| `VITE_APP_ENV` | `local` · `dev` · `uat` · `production` |
| `VITE_USE_MOCK` | `true` → mock adapter, `false` → HTTP adapter |
| `VITE_API_BASE_URL` | API root, e.g. `https://uat-api…/api/v1` (required when not mocking) |
| `VITE_API_PROXY_TARGET` | Optional. Dev-server proxy target for `npm run dev:api` (avoids CORS) |
| `VITE_API_TIMEOUT_MS` | Request timeout (default 15000) |
| `VITE_MOCK_LATENCY_MS` | Fake network delay in mock mode, so loaders and spinners are exercised |

Personal overrides go in `.env.development.local` (git-ignored). Only the selected adapter is
bundled: dev/uat/prod builds contain **no mock data** (checked by building each mode).

## Architecture: one data boundary

```mermaid
flowchart LR
    S[Screens & components] --> C[AppContext / useApi]
    C --> A["api  (src/api/index.js)"]
    A -- VITE_USE_MOCK=true --> M[mock/mockApi.js<br/>in-memory db + game logic]
    A -- VITE_USE_MOCK=false --> H[http/httpApi.js<br/>mappers] --> HC[httpClient.js<br/>auth · timeout · errors] --> API[(REST API)]
    M --> D[mock/mockData.js]
```

- **Screens never import mock data or call `fetch`.** They read from `useApp()` (data loaded at
  login) or `useApi(() => api.x())` (screen-specific data such as leaderboard, results, referral).
- **The server decides every outcome.** Wheel segment, slot reels, scratch symbols, lottery numbers,
  rewards and balances all come from the API; the UI only animates them. Every transaction carries
  `balanceAfter`, and the wallet balance is always taken from the newest one.
- **One contract**: [`src/api/contract.js`](src/api/contract.js) lists every method and the shape of
  every model. In development the console reports any method an adapter is missing.
- **Errors** come back as one `ApiError { code, status, message }` type. `AppContext` shows the
  server's message as a toast. A `401` clears the session and returns the user to Login.
- **Session**: the token is kept in `localStorage` ([`src/api/session.js`](src/api/session.js)) and
  sent as `Authorization: Bearer …`. Logged-in routes sit behind a guard that shows a loader while
  data loads and a retry screen if it fails.

## Integrating the real API (checklist)

1. Set `VITE_API_BASE_URL` (and `VITE_API_PROXY_TARGET` for local) in `.env.dev` / `.env.uat` / `.env.production`.
2. Align paths in [`src/api/http/endpoints.js`](src/api/http/endpoints.js).
3. If backend field names differ from the models in `contract.js`, adjust the mappers at the top of
   [`src/api/http/httpApi.js`](src/api/http/httpApi.js).
4. If the backend wraps responses (e.g. `{ data, error }`) or uses another auth header, change
   [`src/api/http/httpClient.js`](src/api/http/httpClient.js) once.
5. Run `npm run dev:api` and go through the flows. Screens, context and styles need no changes.

Keep using `npm run dev` (mock) for UI work. The mock enforces the same rules as a real backend
would (insufficient balance, claim once a day, validation), so error paths can be tested offline.

---

## App flow

```mermaid
flowchart TD
    S[Splash] --> L[Login · phone + OTP]
    L --> H

    subgraph Tabs[Bottom navigation]
      H[Home] --- G[Games] --- E[Earn] --- W[Wallet] --- P[Profile]
    end

    H --> SP[Spin Wheel]
    H --> LO[Lottery]
    H --> SC[Scratch Card]
    H --> SL[Lucky 777 Slots]
    G --> SP & LO & SC & SL
    LO --> PK[Pick Numbers] --> TB[Ticket Booked] --> LD[Live Draw]
    LO -- My Tickets --> LD
    E --> TK[Task / Ad timer]
    W --> WD[Withdraw] --> WS[Withdraw Success]
    H --> N[Notifications]
    H --> LB[Leaderboard]
    P --> RF[Refer & Earn]
    P --> LB
    P --> N

    SP & LD & SC & SL & TK & H -. win .-> WIN((🎆 Win modal<br/>fireworks + coin rain))
```

Every win (spin, lottery, scratch, big slot win, task, daily check-in) opens the same
full-screen **celebration modal**: canvas fireworks, falling coins, rotating light rays and a
count-up of the amount. Jackpots get a longer, denser show.

---

## Screens

### 1 · Onboarding

| Splash | Login | OTP |
|:---:|:---:|:---:|
| <img src="docs/screens/01-splash.jpg" width="240"/> | <img src="docs/screens/02-login.jpg" width="240"/> | <img src="docs/screens/03-login-otp.jpg" width="240"/> |
| Logo with orbiting coins, auto-advances | Phone number (demo: any 10 digits) or guest | 4-digit OTP with auto-focus (any digits) |

### 2 · Home

| Home (top) | Home (games & next draw) | Home (tasks & winners) |
|:---:|:---:|:---:|
| <img src="docs/screens/04-home.jpg" width="240"/> | <img src="docs/screens/05-home-games.jpg" width="240"/> | <img src="docs/screens/06-home-tasks-winners.jpg" width="240"/> |
| Animated balance, live winners ticker, swipeable banners, 7-day check-in | Game cards with shine sweep; jackpot countdown card | Quick tasks, top-3 podium, refer banner |

| Daily check-in reward |
|:---:|
| <img src="docs/screens/07-daily-checkin-reward.jpg" width="240"/> |
| Claiming today's streak reward |

### 3 · Games

| Game Zone |
|:---:|
| <img src="docs/screens/08-games.jpg" width="240"/> |
| All games with filters; locked “coming soon” games show a toast |

### 4 · Spin Wheel

| Wheel | Spinning | Jackpot |
|:---:|:---:|:---:|
| <img src="docs/screens/09-spin-wheel.jpg" width="240"/> | <img src="docs/screens/10-spin-wheel-spinning.jpg" width="240"/> | <img src="docs/screens/11-spin-wheel-jackpot.jpg" width="240"/> |
| Prizes picked by weighted odds, 3 free spins/day then 50 coins | 5 s ease-out spin; rim lights blink faster | Win modal with fireworks & coin rain |

### 5 · Lottery

| Draws | My Tickets | Results |
|:---:|:---:|:---:|
| <img src="docs/screens/12-lottery-draws.jpg" width="240"/> | <img src="docs/screens/13-lottery-my-tickets.jpg" width="240"/> | <img src="docs/screens/14-lottery-results.jpg" width="240"/> |
| 3 draws with live countdowns | Ticket stubs, “Live Draw” for pending ones | Past winning numbers |

| Pick numbers | Ticket booked | Live draw | Result |
|:---:|:---:|:---:|:---:|
| <img src="docs/screens/15-lottery-pick-numbers.jpg" width="200"/> | <img src="docs/screens/16-lottery-ticket-booked.jpg" width="200"/> | <img src="docs/screens/17-lottery-live-draw.jpg" width="200"/> | <img src="docs/screens/18-lottery-jackpot-win.jpg" width="200"/> |
| Number grid + 🎲 Quick Pick + prize table | Confirmation sheet | Balls tumble in the globe; matches glow green | Prize by number of matches |

### 6 · Scratch Card

| Card | Scratching | Win |
|:---:|:---:|:---:|
| <img src="docs/screens/19-scratch-card.jpg" width="240"/> | <img src="docs/screens/20-scratch-in-progress.jpg" width="240"/> | <img src="docs/screens/21-scratch-win.jpg" width="240"/> |
| 30 coins per card | Finger/mouse scratch on canvas; auto-reveals at 50% | Match 3 symbols to win |

### 7 · Lucky 777 Slots

| Machine | Spinning |
|:---:|:---:|
| <img src="docs/screens/22-slots.jpg" width="240"/> | <img src="docs/screens/23-slots-spinning.jpg" width="240"/> |
| Bet chips, pull lever, payline & paytable | Reels stop one after another; big wins (≥10× bet) open the win modal |

### 8 · Earn

| Tasks | Task in progress |
|:---:|:---:|
| <img src="docs/screens/24-earn-tasks.jpg" width="240"/> | <img src="docs/screens/25-earn-watching-ad.jpg" width="240"/> |
| Daily / Offers / Surveys / Social with progress bar | Simulated ad or verification timer, then reward |

### 9 · Wallet & Withdraw

| Wallet | Withdraw | Success |
|:---:|:---:|:---:|
| <img src="docs/screens/26-wallet.jpg" width="240"/> | <img src="docs/screens/27-withdraw.jpg" width="240"/> | <img src="docs/screens/28-withdraw-success.jpg" width="240"/> |
| Balance (100 coins = ₹1), stats, filterable transactions | UPI / Paytm / Bank / Gift card, amount chips | Animated check + fireworks |

### 10 · Social & Account

| Leaderboard | Profile | Notifications | Refer & Earn |
|:---:|:---:|:---:|:---:|
| <img src="docs/screens/29-leaderboard.jpg" width="200"/> | <img src="docs/screens/30-profile.jpg" width="200"/> | <img src="docs/screens/31-notifications.jpg" width="200"/> | <img src="docs/screens/32-refer-and-earn.jpg" width="200"/> |
| Daily / Weekly / All-time podium, your rank pinned | VIP progress, stats, menu & settings | Unread highlights, “Read all” | Copy/share code, steps, friends list |

---

## Routes

| Route | Screen |
|---|---|
| `/` → `/login` | Splash → Login |
| `/home` `/games` `/earn` `/wallet` `/profile` | Bottom-tab screens |
| `/spin` | Spin wheel |
| `/lottery` (`?tab=My Tickets`) | Lottery draws / tickets / results |
| `/lottery/:id` | Pick numbers & buy |
| `/lottery/draw/:ticketId` | Live draw |
| `/scratch` · `/slots` | Scratch card · Lucky 777 |
| `/withdraw` · `/leaderboard` · `/notifications` · `/refer` | |

## Project structure

```
src/
├── config/env.js           ← resolved environment (mock vs API, base URL, timeouts)
├── api/
│   ├── index.js            ← `api` = the ONLY data entry point for the UI (picks the adapter)
│   ├── contract.js         ← every method + model shape both adapters must implement
│   ├── errors.js           ← ApiError + error codes
│   ├── session.js          ← auth token storage
│   ├── http/               ← REAL backend: endpoints.js, httpClient.js, httpApi.js (mappers)
│   └── mock/               ← MOCK backend: mockApi.js (in-memory db, odds, payouts), mockData.js (seed)
├── context/AppContext.jsx  ← session, bootstrap, wallet & actions — all via `api`
├── hooks/                  ← useApi (screen data), useAnimatedNumber, useCountdown
├── components/             ← Fireworks, CoinRain, WinModal, BottomNav, States (loader/error), …
├── screens/                ← one file per screen
└── styles.css              ← theme + all animations
scripts/capture-screens.mjs ← drives every flow headlessly and saves the screenshots above
```

> The mock odds in `src/api/mock/mockData.js` are deliberately generous so the demo feels rewarding.
> The screenshot script fixes the mock's random outcome for a few shots (jackpot spin, full-match draw, winning scratch card).
