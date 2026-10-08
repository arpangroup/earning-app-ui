import { env } from '../../config/env';
import { ApiError, ErrorCodes } from '../errors';
import * as seed from './mockData';

/**
 * MOCK BACKEND ADAPTER — implements src/api/contract.js against an in-memory "database".
 * It behaves like the real server: it decides game outcomes, owns the balance and returns
 * transactions with `balanceAfter`. State lives for the page session (reload = fresh seed).
 */

// ---------- helpers ----------
const clone = (v) => (v === undefined ? v : structuredClone(v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pickWeighted = (items) => {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= items[i].weight;
    if (r <= 0) return i;
  }
  return items.length - 1;
};
const fail = (message, code, status = 400) => {
  throw new ApiError(message, { code, status });
};
let seq = 5000;
const nextId = (prefix) => `${prefix}${++seq}`;

// ---------- in-memory database ----------
const db = {
  user: clone(seed.currentUser),
  coins: seed.startingCoins,
  transactions: (() => {
    // derive balanceAfter for the seeded history (newest first)
    let bal = seed.startingCoins;
    return seed.transactions.map((t) => {
      const row = { ...t, balanceAfter: bal };
      bal -= t.amount;
      return row;
    });
  })(),
  daily: clone(seed.dailyState),
  tickets: clone(seed.myTickets),
  notifications: clone(seed.notifications),
  scratchCards: {},
};

const config = {
  app: seed.APP,
  banners: seed.banners,
  games: seed.games,
  wheel: {
    segments: seed.wheelConfig.segments.map(({ weight, ...s }) => s), // odds stay server-side
    spinCost: seed.wheelConfig.spinCost,
    freeSpinsPerDay: seed.wheelConfig.freeSpinsPerDay,
  },
  scratch: { price: seed.scratchConfig.price, prizes: seed.scratchConfig.prizes.map((p) => p.value) },
  slots: { bets: seed.slotConfig.bets, symbols: seed.slotConfig.symbols, pairMultiplier: seed.slotConfig.pairMultiplier },
  dailyRewards: seed.dailyRewards,
  taskCategories: seed.taskCategories,
  withdrawMethods: seed.withdrawMethods,
  withdrawAmounts: seed.withdrawAmounts,
  vipTiers: seed.vipTiers,
  winnersTicker: seed.winnersTicker,
};

const ledger = (amount, title, type, icon) => {
  if (amount < 0 && db.coins + amount < 0) fail('Not enough coins! Complete tasks to earn more 💰', ErrorCodes.INSUFFICIENT_BALANCE);
  db.coins += amount;
  const tx = { id: nextId('TX'), title, amount, type, icon, createdAt: new Date().toISOString(), balanceAfter: db.coins };
  db.transactions.unshift(tx);
  return tx;
};
const findLottery = (id) => seed.lotteries.find((l) => l.id === id) || fail('Lottery not found', ErrorCodes.NOT_FOUND, 404);
const requireAuth = () => {
  if (!sessionToken) fail('Please log in again', ErrorCodes.UNAUTHORIZED, 401);
};
let sessionToken = null;

// ---------- endpoint handlers ----------
const handlers = {
  // Auth
  sendOtp(phone) {
    if (!/^\d{10}$/.test(phone || '')) fail('Enter a valid 10-digit mobile number', ErrorCodes.VALIDATION);
    return { requestId: nextId('OTP') };
  },
  verifyOtp({ otp }) {
    if (!/^\d{4}$/.test(otp || '')) fail('Invalid OTP', ErrorCodes.INVALID_OTP);
    sessionToken = `mock-${Date.now()}`;
    return { token: sessionToken, user: db.user };
  },
  loginAsGuest() {
    sessionToken = `mock-guest-${Date.now()}`;
    return { token: sessionToken, user: db.user };
  },
  logout() {
    sessionToken = null;
  },

  // Bootstrap
  getAppConfig: () => config,
  getProfile: () => db.user,
  getWallet: () => ({ coins: db.coins, transactions: db.transactions }),
  getDailyState: () => db.daily,
  getTasks: () => seed.tasks,
  getLotteries: () => seed.lotteries,
  getMyTickets: () => db.tickets,
  getNotifications: () => db.notifications,

  // On-demand
  getLotteryResults: () => seed.lotteryResults,
  getLeaderboard: (period = 'daily') => seed.leaderboard[period] || fail('Unknown period', ErrorCodes.VALIDATION),
  getReferral: () => seed.referral,
  getRecentSpinWins: () => seed.wheelConfig.recentWins,
  markNotificationsRead() {
    db.notifications.forEach((n) => (n.unread = false));
  },

  // Actions
  claimCheckin() {
    const { checkin } = db.daily;
    if (checkin.claimedToday) fail('Already claimed today — come back tomorrow!', ErrorCodes.ALREADY_CLAIMED);
    const reward = seed.dailyRewards[checkin.streak % seed.dailyRewards.length];
    db.daily.checkin = { streak: checkin.streak + 1, claimedToday: true };
    const transaction = ledger(reward, `Daily check-in • Day ${checkin.streak + 1}`, 'bonus', '📅');
    return { reward, checkin: db.daily.checkin, transaction };
  },

  spinWheel() {
    let spendTransaction = null;
    if (db.daily.freeSpinsLeft > 0) db.daily.freeSpinsLeft -= 1;
    else spendTransaction = ledger(-seed.wheelConfig.spinCost, 'Spin Wheel spin', 'spend', '🎡');
    const segmentIndex = pickWeighted(seed.wheelConfig.segments);
    const reward = seed.wheelConfig.segments[segmentIndex].value;
    const winTransaction = reward > 0 ? ledger(reward, 'Spin Wheel win', 'win', '🎡') : null;
    return { segmentIndex, reward, freeSpinsLeft: db.daily.freeSpinsLeft, spendTransaction, winTransaction };
  },

  buyLotteryTicket({ lotteryId, numbers }) {
    const lottery = findLottery(lotteryId);
    const unique = [...new Set(numbers)];
    if (unique.length !== lottery.pick || unique.some((n) => n < 1 || n > lottery.maxNumber)) {
      fail(`Pick ${lottery.pick} different numbers between 1 and ${lottery.maxNumber}`, ErrorCodes.VALIDATION);
    }
    const transaction = ledger(-lottery.ticketPrice, `${lottery.name} ticket`, 'spend', lottery.icon);
    const ticket = {
      id: `T-${randInt(90000, 99999)}`,
      lotteryId,
      numbers: unique.sort((a, b) => a - b),
      boughtAt: new Date().toISOString(),
      status: 'pending',
    };
    db.tickets.unshift(ticket);
    return { ticket, transaction };
  },

  /** Demo only: a real backend draws at `drawAt`; here we draw on request. */
  drawLotteryTicket(ticketId) {
    const ticket = db.tickets.find((t) => t.id === ticketId) || fail('Ticket not found', ErrorCodes.NOT_FOUND, 404);
    if (ticket.status !== 'pending') return { ticket, winTransaction: null };
    const lottery = findLottery(ticket.lotteryId);

    const partial = [18, 22, 20, 22, 12, 5]; // weights for 0..5 matches
    const odds = Array.from({ length: lottery.pick + 1 }, (_, k) => ({ k, weight: k === lottery.pick ? 2 : partial[k] }));
    const hits = odds[pickWeighted(odds)].k;
    const others = shuffle(Array.from({ length: lottery.maxNumber }, (_, i) => i + 1).filter((n) => !ticket.numbers.includes(n)));
    const drawn = shuffle([...shuffle(ticket.numbers).slice(0, hits), ...others.slice(0, lottery.pick - hits)]);
    const prize = hits === lottery.pick ? lottery.jackpot : lottery.tiers[hits] || 0;

    Object.assign(ticket, { status: prize ? 'won' : 'lost', drawn, matches: hits, prize });
    const winTransaction = prize ? ledger(prize, `${lottery.name} · ${hits} matches`, 'win', lottery.icon) : null;
    return { ticket, winTransaction };
  },

  buyScratchCard() {
    const cfg = seed.scratchConfig;
    const transaction = ledger(-cfg.price, 'Scratch card', 'spend', '🎫');
    const isWin = Math.random() < cfg.winChance;
    let symbols;
    if (isWin) {
      const s = cfg.symbols[Math.floor(Math.random() * cfg.symbols.length)];
      symbols = [s, s, s];
    } else {
      const [a, b] = shuffle(cfg.symbols);
      symbols = shuffle([a, a, b]); // near miss
    }
    const prize = isWin ? cfg.prizes[pickWeighted(cfg.prizes)].value : 0;
    const card = { id: nextId('SC'), symbols };
    db.scratchCards[card.id] = { ...card, prize, revealed: false };
    return { card, transaction };
  },

  revealScratchCard(cardId) {
    const card = db.scratchCards[cardId] || fail('Card not found', ErrorCodes.NOT_FOUND, 404);
    if (card.revealed) return { prize: card.prize, winTransaction: null };
    card.revealed = true;
    const winTransaction = card.prize ? ledger(card.prize, 'Scratch card – 3 of a kind!', 'win', '🎫') : null;
    return { prize: card.prize, winTransaction };
  },

  spinSlots({ bet }) {
    const cfg = seed.slotConfig;
    if (!cfg.bets.includes(bet)) fail('Invalid bet', ErrorCodes.VALIDATION);
    const betTransaction = ledger(-bet, 'Lucky 777 bet', 'spend', '🎰');
    const L = cfg.symbols.length;
    const s = () => randInt(0, L - 1);
    const r = Math.random();
    let reels;
    if (r < cfg.odds.triple) {
      const k = Math.random() < 0.7 ? randInt(3, L - 1) : randInt(0, 2); // high symbols are rarer
      reels = [k, k, k];
    } else if (r < cfg.odds.triple + cfg.odds.pair) {
      const k = s();
      let o = s();
      while (o === k) o = s();
      reels = [k, k, o];
      const swap = randInt(0, 2);
      [reels[swap], reels[2]] = [reels[2], reels[swap]];
    } else {
      const a = s();
      let b = s();
      while (b === a) b = s();
      let c = s();
      while (c === a || c === b) c = s();
      reels = [a, b, c];
    }
    const [a, b, c] = reels;
    let payout = 0;
    if (a === b && b === c) payout = bet * cfg.symbols[a].mult;
    else if (a === b || b === c || a === c) payout = Math.round(bet * cfg.pairMultiplier);
    const icon = cfg.symbols[a].icon;
    const winTransaction = payout
      ? ledger(payout, payout >= bet * 10 ? `Lucky 777 · ${icon}${icon}${icon}` : 'Lucky 777 win', 'win', '🎰')
      : null;
    return { reels, payout, betTransaction, winTransaction };
  },

  completeTask(taskId) {
    const task = seed.tasks.find((t) => t.id === taskId) || fail('Task not found', ErrorCodes.NOT_FOUND, 404);
    if (db.daily.completedTaskIds.includes(taskId)) fail('Task already completed', ErrorCodes.ALREADY_CLAIMED);
    db.daily.completedTaskIds.push(taskId);
    return { reward: task.reward, transaction: ledger(task.reward, task.title, 'task', task.icon) };
  },

  withdraw({ methodId, amountInr, account }) {
    const method = seed.withdrawMethods.find((m) => m.id === methodId) || fail('Unknown payout method', ErrorCodes.VALIDATION);
    if (!seed.withdrawAmounts.includes(amountInr)) fail('Invalid amount', ErrorCodes.VALIDATION);
    if (!account?.trim()) fail(`Enter your ${method.name} details`, ErrorCodes.VALIDATION);
    const transaction = ledger(-amountInr * seed.APP.coinsPerRupee, `Withdrawal to ${method.name}`, 'withdraw', '🏧');
    db.user.totalWithdrawnInr += amountInr;
    return { withdrawal: { id: nextId('WD'), status: 'processing', eta: method.eta }, transaction };
  },
};

const PUBLIC = new Set(['sendOtp', 'verifyOtp', 'loginAsGuest']);

/** Wrap each handler: simulated latency, auth check, deep-cloned responses (no shared references). */
export const mockApi = Object.fromEntries(
  Object.entries(handlers).map(([name, fn]) => [
    name,
    async (...args) => {
      await sleep(env.mockLatencyMs * (0.6 + Math.random() * 0.8));
      if (!PUBLIC.has(name)) requireAuth();
      return clone(fn(...args));
    },
  ])
);

/** A persisted session survives reloads in the mock, like a real token would. */
export const restoreMockSession = (token) => {
  sessionToken = token;
};
