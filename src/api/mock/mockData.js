/**
 * Seed data for the MOCK backend (src/api/mock/mockApi.js) — used only when VITE_USE_MOCK=true.
 * Nothing outside src/api/mock may import this file; the UI gets data through `api`.
 * Shapes match the models documented in src/api/contract.js.
 */

const now = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const ago = (ms) => new Date(now - ms).toISOString();
const ahead = (ms) => new Date(now + ms).toISOString();

export const APP = {
  name: 'LuckyCoin',
  tagline: 'Play • Win • Earn Real Rewards',
  coinsPerRupee: 100, // 100 coins = ₹1
  supportEmail: 'support@luckycoin.app',
};

export const currentUser = {
  id: 'LC10294',
  name: 'Aarav Mehta',
  phone: '+91 98XXX XX421',
  avatar: '🦁',
  level: 7,
  vipTier: 'Gold',
  xp: 6800,
  nextLevelXp: 10000,
  referralCode: 'AARAV777',
  joined: 'Mar 2026',
  totalEarned: 48210,
  gamesPlayed: 312,
  totalWithdrawnInr: 320,
  winRate: 41,
  rank: 128,
};

export const startingCoins = 12450;

export const banners = [
  {
    id: 'b1',
    title: 'MEGA JACKPOT',
    highlight: '5,00,000',
    subtitle: 'Daily Mega Draw • Tonight 9 PM',
    cta: 'Buy Ticket',
    route: '/lottery',
    emoji: '🎰',
    gradient: 'linear-gradient(135deg,#7c3aed 0%,#db2777 60%,#f59e0b 100%)',
  },
  {
    id: 'b2',
    title: 'SPIN & WIN',
    highlight: '3 FREE',
    subtitle: 'Free spins every day. Jackpot 5,000!',
    cta: 'Spin Now',
    route: '/spin',
    emoji: '🎡',
    gradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 55%,#a855f7 100%)',
  },
  {
    id: 'b3',
    title: 'REFER & EARN',
    highlight: '500',
    subtitle: 'Coins for every friend who joins',
    cta: 'Invite',
    route: '/refer',
    emoji: '🎁',
    gradient: 'linear-gradient(135deg,#059669 0%,#10b981 50%,#facc15 100%)',
  },
];

export const games = [
  {
    id: 'spin',
    name: 'Spin Wheel',
    desc: 'Spin daily, win up to 5,000',
    route: '/spin',
    icon: '🎡',
    tag: 'FREE',
    players: '12.4K',
    gradient: 'linear-gradient(145deg,#6d28d9,#c026d3)',
  },
  {
    id: 'lottery',
    name: 'Lottery',
    desc: 'Pick numbers, hit the jackpot',
    route: '/lottery',
    icon: '🎟️',
    tag: 'HOT',
    players: '28.9K',
    gradient: 'linear-gradient(145deg,#ea580c,#e11d48)',
  },
  {
    id: 'scratch',
    name: 'Scratch Card',
    desc: 'Match 3 symbols to win',
    route: '/scratch',
    icon: '🎫',
    tag: 'NEW',
    players: '8.1K',
    gradient: 'linear-gradient(145deg,#0891b2,#2563eb)',
  },
  {
    id: 'slots',
    name: 'Lucky 777',
    desc: 'Classic slots, 50x payout',
    route: '/slots',
    icon: '🎰',
    tag: '50X',
    players: '15.7K',
    gradient: 'linear-gradient(145deg,#ca8a04,#dc2626)',
  },
  {
    id: 'crash',
    name: 'Rocket Crash',
    desc: 'Cash out before it crashes',
    icon: '🚀',
    tag: 'SOON',
    locked: true,
    gradient: 'linear-gradient(145deg,#334155,#1e293b)',
  },
  {
    id: 'cards',
    name: 'Teen Patti',
    desc: 'Play cards with friends',
    icon: '🃏',
    tag: 'SOON',
    locked: true,
    gradient: 'linear-gradient(145deg,#334155,#1e293b)',
  },
];

/* ---------------- Spin Wheel ---------------- */
export const wheelConfig = {
  freeSpinsPerDay: 3,
  spinCost: 50,
  segments: [
    { label: '10', value: 10, color: '#ff3d71', weight: 22 },
    { label: '100', value: 100, color: '#7c3aed', weight: 12 },
    { label: 'Try Again', value: 0, color: '#1e1b4b', weight: 18 },
    { label: '50', value: 50, color: '#0ea5e9', weight: 18 },
    { label: '500', value: 500, color: '#f59e0b', weight: 5 },
    { label: '25', value: 25, color: '#10b981', weight: 20 },
    { label: '1000', value: 1000, color: '#db2777', weight: 3 },
    { label: 'JACKPOT', value: 5000, color: '#facc15', weight: 2 },
  ],
  recentWins: [
    { name: 'Neha S.', value: 1000, createdAt: ago(2 * MIN) },
    { name: 'Vikram R.', value: 500, createdAt: ago(5 * MIN) },
    { name: 'Ishita P.', value: 5000, createdAt: ago(11 * MIN) },
    { name: 'Karan M.', value: 100, createdAt: ago(14 * MIN) },
  ],
};

/* ---------------- Lottery ---------------- */
export const lotteries = [
  {
    id: 'mega-daily',
    name: 'Daily Mega Draw',
    icon: '💰',
    jackpot: 500000,
    ticketPrice: 100,
    pick: 6,
    maxNumber: 49,
    drawAt: ahead(3 * HOUR + 12 * MIN),
    participants: 18452,
    tiers: { 3: 250, 4: 2500, 5: 25000 },
    gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)',
  },
  {
    id: 'weekly-jackpot',
    name: 'Weekly Jackpot',
    icon: '👑',
    jackpot: 2500000,
    ticketPrice: 250,
    pick: 5,
    maxNumber: 39,
    drawAt: ahead(2 * DAY + 5 * HOUR),
    participants: 64210,
    tiers: { 3: 1000, 4: 15000 },
    gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
  },
  {
    id: 'quick-3',
    name: 'Quick 3',
    icon: '⚡',
    jackpot: 5000,
    ticketPrice: 20,
    pick: 3,
    maxNumber: 20,
    drawAt: ahead(14 * MIN + 30 * 1000),
    participants: 2310,
    tiers: { 2: 60 },
    gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
  },
];

export const myTickets = [
  {
    id: 'T-88213',
    lotteryId: 'mega-daily',
    numbers: [3, 12, 19, 27, 33, 41],
    boughtAt: ago(2 * HOUR),
    status: 'pending',
  },
  {
    id: 'T-88190',
    lotteryId: 'quick-3',
    numbers: [4, 11, 17],
    boughtAt: ago(3 * HOUR + 20 * MIN),
    status: 'pending',
  },
  {
    id: 'T-87512',
    lotteryId: 'weekly-jackpot',
    numbers: [2, 9, 21, 30, 38],
    boughtAt: ago(DAY + 2 * HOUR),
    status: 'lost',
    drawn: [5, 9, 14, 26, 38],
    matches: 2,
    prize: 0,
  },
];

export const lotteryResults = [
  { id: 'r1', lotteryId: 'mega-daily', drawnAt: ago(DAY), numbers: [7, 14, 22, 31, 38, 45], winner: 'Priya K.', prize: 500000 },
  { id: 'r2', lotteryId: 'quick-3', drawnAt: ago(15 * MIN), numbers: [2, 13, 19], winner: 'Rohit D.', prize: 5000 },
  { id: 'r3', lotteryId: 'weekly-jackpot', drawnAt: ago(4 * DAY), numbers: [4, 11, 18, 27, 36], winner: 'Ankit V.', prize: 2500000 },
  { id: 'r4', lotteryId: 'mega-daily', drawnAt: ago(2 * DAY), numbers: [1, 9, 17, 23, 40, 48], winner: 'No winner', prize: 0 },
];

/* ---------------- Scratch Card ---------------- */
export const scratchConfig = {
  price: 30,
  winChance: 0.5,
  symbols: ['💎', '🍀', '⭐', '🔔', '🍒', '👑'],
  prizes: [
    { value: 50, weight: 34 },
    { value: 100, weight: 24 },
    { value: 250, weight: 12 },
    { value: 1000, weight: 4 },
    { value: 5000, weight: 1 },
  ],
};

/* ---------------- Slots ---------------- */
export const slotConfig = {
  bets: [10, 50, 100, 500],
  symbols: [
    { id: 'seven', icon: '7️⃣', mult: 50 },
    { id: 'diamond', icon: '💎', mult: 25 },
    { id: 'star', icon: '⭐', mult: 15 },
    { id: 'bell', icon: '🔔', mult: 10 },
    { id: 'cherry', icon: '🍒', mult: 5 },
    { id: 'lemon', icon: '🍋', mult: 3 },
  ],
  pairMultiplier: 1.5,
  odds: { triple: 0.22, pair: 0.38 }, // remaining = no win
};

/* ---------------- Daily check-in ---------------- */
export const dailyRewards = [10, 20, 30, 50, 80, 120, 500];
export const dailyState = { checkin: { streak: 3, claimedToday: false }, freeSpinsLeft: 3, completedTaskIds: [] };

/* ---------------- Tasks / Earn ---------------- */
export const taskCategories = ['All', 'Daily', 'Offers', 'Surveys', 'Social'];

export const tasks = [
  { id: 't1', title: 'Watch a short video', desc: '30 sec sponsored ad', reward: 20, icon: '📺', category: 'Daily', duration: 5, cta: 'Watch' },
  { id: 't2', title: 'Daily login bonus', desc: 'Just open the app', reward: 15, icon: '🌞', category: 'Daily', duration: 2, cta: 'Claim' },
  { id: 't3', title: 'Install Ludo Stars', desc: 'Install & reach level 5', reward: 1500, icon: '🎲', category: 'Offers', duration: 4, cta: 'Install', hot: true },
  { id: 't4', title: 'Open a savings account', desc: 'Zero balance, 5 min KYC', reward: 4000, icon: '🏦', category: 'Offers', duration: 4, cta: 'Start', hot: true },
  { id: 't5', title: 'Shopping survey', desc: '2 minutes • 8 questions', reward: 300, icon: '📝', category: 'Surveys', duration: 4, cta: 'Start' },
  { id: 't6', title: 'Food habits survey', desc: '4 minutes • 12 questions', reward: 450, icon: '🍔', category: 'Surveys', duration: 4, cta: 'Start' },
  { id: 't7', title: 'Follow us on Instagram', desc: '@luckycoin.app', reward: 50, icon: '📸', category: 'Social', duration: 3, cta: 'Follow' },
  { id: 't8', title: 'Join our Telegram', desc: 'Get daily bonus codes', reward: 75, icon: '✈️', category: 'Social', duration: 3, cta: 'Join' },
  { id: 't9', title: 'Rate us 5 stars', desc: 'On Play Store', reward: 100, icon: '⭐', category: 'Social', duration: 3, cta: 'Rate' },
];

/* ---------------- Wallet ---------------- */
export const transactions = [
  { id: 'TX991', title: 'Spin Wheel win', amount: 500, type: 'win', icon: '🎡', createdAt: ago(40 * MIN) },
  { id: 'TX990', title: 'Daily Mega Draw ticket', amount: -100, type: 'spend', icon: '🎟️', createdAt: ago(2 * HOUR) },
  { id: 'TX989', title: 'Survey completed', amount: 300, type: 'task', icon: '📝', createdAt: ago(3 * HOUR) },
  { id: 'TX988', title: 'Quick 3 ticket', amount: -20, type: 'spend', icon: '⚡', createdAt: ago(3 * HOUR + 20 * MIN) },
  { id: 'TX987', title: 'Withdrawal to UPI', amount: -10000, type: 'withdraw', icon: '🏧', createdAt: ago(DAY + 3 * HOUR) },
  { id: 'TX986', title: 'Referral bonus – Riya', amount: 500, type: 'bonus', icon: '🎁', createdAt: ago(DAY + 8 * HOUR) },
  { id: 'TX985', title: 'Lucky 777 big win', amount: 2500, type: 'win', icon: '🎰', createdAt: ago(5 * DAY) },
  { id: 'TX984', title: 'Daily check-in', amount: 30, type: 'bonus', icon: '📅', createdAt: ago(5 * DAY + 14 * HOUR) },
];

export const withdrawMethods = [
  { id: 'upi', name: 'UPI', icon: '⚡', eta: 'Instant', fee: 'Free', placeholder: 'yourname@upi' },
  { id: 'paytm', name: 'Paytm Wallet', icon: '💙', eta: '5 min', fee: 'Free', placeholder: '10-digit mobile number' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦', eta: '24 hrs', fee: '₹2', placeholder: 'Account number' },
  { id: 'amazon', name: 'Amazon Pay Gift Card', icon: '🎁', eta: 'Instant', fee: 'Free', placeholder: 'Email for the code' },
];

export const withdrawAmounts = [10, 50, 100, 250, 500]; // in ₹

/* ---------------- Leaderboard ---------------- */
const lbNames = [
  ['Ishita P.', '🦊'], ['Rohit D.', '🐯'], ['Neha S.', '🐼'], ['Vikram R.', '🐺'], ['Sana K.', '🦄'],
  ['Karan M.', '🐸'], ['Priya K.', '🐱'], ['Arjun T.', '🐻'], ['Meera J.', '🐰'], ['Dev N.', '🐲'],
  ['Zoya F.', '🦋'], ['Kabir L.', '🦅'],
];
const mkBoard = (base, step) =>
  lbNames.map(([name, avatar], i) => ({ rank: i + 1, name, avatar, coins: Math.round(base - i * step - (i * i * step) / 10) }));

export const leaderboard = {
  daily: mkBoard(48200, 3100),
  weekly: mkBoard(312000, 18500),
  all: mkBoard(4850000, 260000),
};

/* ---------------- Misc ---------------- */
export const winnersTicker = [
  '🎉 Ishita P. won 5,000 on Spin Wheel',
  '🔥 Rohit D. hit JACKPOT in Quick 3',
  '💎 Neha S. won 2,500 on Lucky 777',
  '🎫 Arjun T. scratched 1,000 coins',
  '👑 Priya K. won 5,00,000 Mega Draw',
  '💸 Karan M. withdrew ₹500 to UPI',
];

export const notifications = [
  { id: 'n1', icon: '🎟️', title: 'Draw starts soon!', body: 'Daily Mega Draw closes in 3 hours. Your ticket T-88213 is in.', createdAt: ago(10 * MIN), unread: true },
  { id: 'n2', icon: '🎡', title: '3 free spins ready', body: 'Your daily free spins have been refilled. Go win big!', createdAt: ago(HOUR), unread: true },
  { id: 'n3', icon: '💸', title: 'Withdrawal successful', body: '₹100 has been sent to your UPI ID.', createdAt: ago(DAY), unread: true },
  { id: 'n4', icon: '🎁', title: 'Riya joined using your code', body: 'You earned 500 bonus coins.', createdAt: ago(DAY), unread: false },
  { id: 'n5', icon: '🏆', title: 'You reached Level 7', body: 'Gold VIP unlocked: +10% on all task rewards.', createdAt: ago(5 * DAY), unread: false },
];

export const referral = {
  perInvite: 500,
  friendBonus: 200,
  invited: 12,
  joined: 9,
  earned: 4500,
  friends: [
    { name: 'Riya S.', avatar: '🐱', status: 'Joined', reward: 500 },
    { name: 'Aman K.', avatar: '🐶', status: 'Joined', reward: 500 },
    { name: 'Tanya G.', avatar: '🦊', status: 'Pending', reward: 0 },
    { name: 'Sahil B.', avatar: '🐨', status: 'Joined', reward: 500 },
  ],
  steps: [
    { icon: '📤', title: 'Share your code', desc: 'Send your invite link to friends' },
    { icon: '📲', title: 'Friend signs up', desc: 'They get 200 bonus coins' },
    { icon: '💰', title: 'You earn 500', desc: 'Credited after their first game' },
  ],
};

export const vipTiers = [
  { name: 'Silver', minLevel: 1, perk: '+2% task rewards' },
  { name: 'Gold', minLevel: 5, perk: '+10% task rewards' },
  { name: 'Platinum', minLevel: 10, perk: '+20% rewards, priority payouts' },
  { name: 'Diamond', minLevel: 20, perk: '+35% rewards, personal manager' },
];
