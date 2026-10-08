import { endpoints as ep } from './endpoints';
import { http } from './httpClient';

/**
 * REAL BACKEND ADAPTER.
 * When the API is ready, this file (plus endpoints.js) is the only place to change:
 *   1. fix paths in endpoints.js
 *   2. adjust the mappers below if backend field names differ from the UI models in contract.js
 * Nothing in screens/ or context/ needs to change.
 */

// ---------- DTO -> UI model mappers (identity until the backend contract is final) ----------
const toTransaction = (t) => t && {
  id: String(t.id),
  title: t.title,
  amount: Number(t.amount),
  type: t.type,
  icon: t.icon || '🪙',
  createdAt: t.createdAt,
  balanceAfter: Number(t.balanceAfter),
};
const toTicket = (t) => t && { ...t, id: String(t.id), numbers: t.numbers.map(Number) };
const list = (mapper) => (arr) => (arr || []).map(mapper);
const toTransactions = list(toTransaction);
const toTickets = list(toTicket);

// ---------- adapter ----------
export const httpApi = {
  // Auth
  sendOtp: (phone) => http.post(ep.auth.sendOtp, { phone }, { auth: false }),
  verifyOtp: ({ phone, otp, requestId }) => http.post(ep.auth.verifyOtp, { phone, otp, requestId }, { auth: false }),
  loginAsGuest: () => http.post(ep.auth.guest, {}, { auth: false }),
  logout: () => http.post(ep.auth.logout, {}),

  // Bootstrap
  getAppConfig: () => http.get(ep.config),
  getProfile: () => http.get(ep.me),
  getWallet: async () => {
    const r = await http.get(ep.wallet);
    return { coins: Number(r.coins), transactions: toTransactions(r.transactions) };
  },
  getDailyState: () => http.get(ep.daily),
  getTasks: () => http.get(ep.tasks),
  getLotteries: () => http.get(ep.lotteries),
  getMyTickets: async () => toTickets(await http.get(ep.myTickets)),
  getNotifications: () => http.get(ep.notifications),

  // On-demand
  getLotteryResults: () => http.get(ep.lotteryResults),
  getLeaderboard: (period) => http.get(ep.leaderboard, { query: { period } }),
  getReferral: () => http.get(ep.referral),
  getRecentSpinWins: () => http.get(ep.wheelRecentWins),
  markNotificationsRead: () => http.post(ep.notificationsReadAll, {}),

  // Actions
  claimCheckin: async () => {
    const r = await http.post(ep.checkin, {});
    return { ...r, transaction: toTransaction(r.transaction) };
  },
  spinWheel: async () => {
    const r = await http.post(ep.wheelSpin, {});
    return { ...r, spendTransaction: toTransaction(r.spendTransaction), winTransaction: toTransaction(r.winTransaction) };
  },
  buyLotteryTicket: async ({ lotteryId, numbers }) => {
    const r = await http.post(ep.buyTicket(lotteryId), { numbers });
    return { ticket: toTicket(r.ticket), transaction: toTransaction(r.transaction) };
  },
  drawLotteryTicket: async (ticketId) => {
    const r = await http.post(ep.drawTicket(ticketId), {});
    return { ticket: toTicket(r.ticket), winTransaction: toTransaction(r.winTransaction) };
  },
  buyScratchCard: async () => {
    const r = await http.post(ep.scratchCards, {});
    return { card: r.card, transaction: toTransaction(r.transaction) };
  },
  revealScratchCard: async (cardId) => {
    const r = await http.post(ep.scratchReveal(cardId), {});
    return { prize: Number(r.prize), winTransaction: toTransaction(r.winTransaction) };
  },
  spinSlots: async ({ bet }) => {
    const r = await http.post(ep.slotsSpin, { bet });
    return { ...r, betTransaction: toTransaction(r.betTransaction), winTransaction: toTransaction(r.winTransaction) };
  },
  completeTask: async (taskId) => {
    const r = await http.post(ep.completeTask(taskId), {});
    return { reward: Number(r.reward), transaction: toTransaction(r.transaction) };
  },
  withdraw: async ({ methodId, amountInr, account }) => {
    const r = await http.post(ep.withdrawals, { methodId, amountInr, account });
    return { withdrawal: r.withdrawal, transaction: toTransaction(r.transaction) };
  },
};
