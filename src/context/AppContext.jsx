import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, ApiError, AUTH_EXPIRED_EVENT, session } from '../api';

/**
 * App-wide state. Everything is loaded from / written through `api` — this file never
 * knows whether the mock or the real backend is behind it.
 */
const AppContext = createContext(null);
let localSeq = 0;

export function AppProvider({ children }) {
  // 'guest' (logged out) | 'loading' | 'ready' | 'error'
  const [status, setStatus] = useState(session.isLoggedIn() ? 'loading' : 'guest');
  const [bootError, setBootError] = useState(null);

  const [config, setConfig] = useState(null);
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [lotteries, setLotteries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [checkin, setCheckin] = useState({ streak: 0, claimedToday: false });
  const [freeSpins, setFreeSpins] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [celebration, setCelebration] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();
  const latestTx = useRef(0); // timestamp of the newest applied transaction

  // ---------- UI feedback ----------
  const showToast = useCallback((message, kind = 'info') => {
    clearTimeout(toastTimer.current);
    setToast({ message, kind, id: ++localSeq });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const celebrate = useCallback((payload) => setCelebration({ id: ++localSeq, ...payload }), []);

  /** Run an API call; on failure show the server's message and return null. */
  const run = useCallback(
    async (fn) => {
      try {
        return await fn();
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'error');
        if (!(err instanceof ApiError)) console.error(err);
        return null;
      }
    },
    [showToast]
  );

  // ---------- wallet ----------
  /**
   * Apply server transactions. The balance always comes from `balanceAfter` of the newest one,
   * so a win applied late (after an animation) never overwrites a newer balance.
   */
  const applyTransactions = useCallback((...txs) => {
    const list = txs.filter(Boolean);
    if (!list.length) return;
    setTransactions((prev) => {
      const seen = new Set(prev.map((t) => t.id));
      return [...list.filter((t) => !seen.has(t.id)).reverse(), ...prev];
    });
    for (const tx of list) {
      const at = Date.parse(tx.createdAt);
      if (at >= latestTx.current) {
        latestTx.current = at;
        setCoins(tx.balanceAfter);
      }
    }
  }, []);

  /** Credit a (deferred) win and show the celebration modal. */
  const settleWin = useCallback(
    (tx, extras = {}) => {
      applyTransactions(tx);
      if (tx) celebrate({ amount: tx.amount, subtitle: tx.title, ...extras });
    },
    [applyTransactions, celebrate]
  );

  // ---------- session & bootstrap ----------
  const resetState = () => {
    setConfig(null);
    setUser(null);
    setTransactions([]);
    setTickets([]);
    setNotifications([]);
    setCompletedTasks([]);
    latestTx.current = 0;
  };

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    setBootError(null);
    try {
      const [cfg, profile, wallet, daily, taskList, lotteryList, myTickets, notifs] = await Promise.all([
        api.getAppConfig(),
        api.getProfile(),
        api.getWallet(),
        api.getDailyState(),
        api.getTasks(),
        api.getLotteries(),
        api.getMyTickets(),
        api.getNotifications(),
      ]);
      setConfig(cfg);
      setUser(profile);
      setCoins(wallet.coins);
      setTransactions(wallet.transactions);
      latestTx.current = Date.parse(wallet.transactions[0]?.createdAt) || 0;
      setCheckin(daily.checkin);
      setFreeSpins(daily.freeSpinsLeft);
      setCompletedTasks(daily.completedTaskIds);
      setTasks(taskList);
      setLotteries(lotteryList);
      setTickets(myTickets);
      setNotifications(notifs);
      setStatus('ready');
    } catch (err) {
      if (!session.isLoggedIn()) return setStatus('guest'); // token rejected
      setBootError(err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (session.isLoggedIn()) bootstrap();
  }, [bootstrap]);

  const startSession = async (authResponse) => {
    session.set({ token: authResponse.token, userId: authResponse.user?.id });
    await bootstrap();
  };

  const sendOtp = (phone) => run(() => api.sendOtp(phone));
  const verifyOtp = (payload) =>
    run(async () => {
      await startSession(await api.verifyOtp(payload));
      return true;
    });
  const loginAsGuest = () =>
    run(async () => {
      await startSession(await api.loginAsGuest());
      return true;
    });
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* best effort */
    }
    session.clear();
    resetState();
    setStatus('guest');
  }, []);

  useEffect(() => {
    const onExpired = () => {
      resetState();
      setStatus('guest');
      showToast('Session expired — please log in again', 'error');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [showToast]);

  // ---------- actions (thin wrappers over api) ----------
  const claimCheckin = () =>
    run(async () => {
      const res = await api.claimCheckin();
      setCheckin(res.checkin);
      settleWin(res.transaction, { title: 'DAILY BONUS!', subtitle: `Day ${res.checkin.streak} streak reward`, emoji: '📅' });
    });

  /** Returns the outcome; the caller animates, then calls settleWin(res.winTransaction). */
  const spinWheel = () =>
    run(async () => {
      const res = await api.spinWheel();
      setFreeSpins(res.freeSpinsLeft);
      applyTransactions(res.spendTransaction);
      return res;
    });

  const buyTicket = (lotteryId, numbers) =>
    run(async () => {
      const res = await api.buyLotteryTicket({ lotteryId, numbers });
      setTickets((t) => [res.ticket, ...t]);
      applyTransactions(res.transaction);
      return res.ticket;
    });

  const drawTicket = (ticketId) => run(() => api.drawLotteryTicket(ticketId));
  const updateTicket = (ticket) => setTickets((t) => t.map((x) => (x.id === ticket.id ? ticket : x)));

  const buyScratchCard = () =>
    run(async () => {
      const res = await api.buyScratchCard();
      applyTransactions(res.transaction);
      return res.card;
    });
  const revealScratchCard = (cardId) => run(() => api.revealScratchCard(cardId));

  const spinSlots = (bet) =>
    run(async () => {
      const res = await api.spinSlots({ bet });
      applyTransactions(res.betTransaction);
      return res;
    });

  const startTask = (task) => !completedTasks.includes(task.id) && setActiveTask(task);
  const finishTask = (task) =>
    run(async () => {
      setActiveTask(null);
      const res = await api.completeTask(task.id);
      setCompletedTasks((c) => [...c, task.id]);
      settleWin(res.transaction, { title: 'TASK COMPLETE!', subtitle: task.title, emoji: task.icon });
    });

  const withdraw = (payload) =>
    run(async () => {
      const res = await api.withdraw(payload);
      applyTransactions(res.transaction);
      setUser((u) => ({ ...u, totalWithdrawnInr: (u.totalWithdrawnInr || 0) + payload.amountInr }));
      return res;
    });

  const markAllRead = () => {
    setNotifications((n) => n.map((x) => ({ ...x, unread: false })));
    run(() => api.markNotificationsRead());
  };

  const value = {
    status,
    bootError,
    bootstrap,
    config,
    user,
    coins,
    transactions,
    tickets,
    lotteries,
    tasks,
    checkin,
    freeSpins,
    completedTasks,
    notifications,
    celebration,
    activeTask,
    toast,
    showToast,
    celebrate,
    closeCelebration: () => setCelebration(null),
    applyTransactions,
    settleWin,
    sendOtp,
    verifyOtp,
    loginAsGuest,
    logout,
    claimCheckin,
    spinWheel,
    buyTicket,
    drawTicket,
    updateTicket,
    buyScratchCard,
    revealScratchCard,
    spinSlots,
    startTask,
    finishTask,
    cancelTask: () => setActiveTask(null),
    withdraw,
    markAllRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
