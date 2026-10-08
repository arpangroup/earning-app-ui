/**
 * THE API CONTRACT — every adapter (mock + HTTP) implements exactly these async methods.
 * Screens/context depend only on this shape, never on an adapter or on mock data.
 *
 * Shared models (what the UI consumes; map backend DTOs to these in http/httpApi.js):
 *
 * @typedef {{ id:string, title:string, amount:number, type:'win'|'spend'|'bonus'|'task'|'withdraw',
 *             icon:string, createdAt:string, balanceAfter:number }} Transaction
 *   `balanceAfter` is the authoritative balance once this transaction is applied.
 *
 * @typedef {{ id:string, name:string, phone:string, avatar:string, level:number, vipTier:string,
 *             xp:number, nextLevelXp:number, referralCode:string, joined:string,
 *             totalEarned:number, totalWithdrawnInr:number, gamesPlayed:number, winRate:number, rank:number }} User
 *
 * @typedef {{ id:string, lotteryId:string, numbers:number[], boughtAt:string,
 *             status:'pending'|'won'|'lost', drawn?:number[], matches?:number, prize?:number }} Ticket
 *
 * @typedef {{ streak:number, claimedToday:boolean }} CheckinState
 *
 * Methods (all return Promises, all throw ApiError on failure):
 *
 *  Auth
 *   sendOtp(phone)                        -> { requestId }
 *   verifyOtp({ phone, otp, requestId })  -> { token, user: User }
 *   loginAsGuest()                        -> { token, user: User }
 *   logout()                              -> void
 *
 *  Bootstrap (loaded once after login)
 *   getAppConfig()     -> { app, banners, games, wheel, scratch, slots, dailyRewards, taskCategories,
 *                           withdrawMethods, withdrawAmounts, vipTiers, winnersTicker }
 *   getProfile()       -> User
 *   getWallet()        -> { coins:number, transactions: Transaction[] }
 *   getDailyState()    -> { checkin: CheckinState, freeSpinsLeft:number, completedTaskIds:string[] }
 *   getTasks()         -> Task[]
 *   getLotteries()     -> Lottery[]            (drawAt is an ISO string)
 *   getMyTickets()     -> Ticket[]
 *   getNotifications() -> Notification[]       (createdAt ISO, unread:boolean)
 *
 *  On-demand screens
 *   getLotteryResults()        -> Result[]
 *   getLeaderboard(period)     -> Entry[]       period: 'daily'|'weekly'|'all'
 *   getReferral()              -> Referral
 *   getRecentSpinWins()        -> { name, value, createdAt }[]
 *   markNotificationsRead()    -> void
 *
 *  Actions — outcomes are decided by the server, the UI only animates them
 *   claimCheckin()                         -> { reward, checkin: CheckinState, transaction }
 *   spinWheel()                            -> { segmentIndex, reward, freeSpinsLeft, spendTransaction|null, winTransaction|null }
 *   buyLotteryTicket({ lotteryId, numbers })-> { ticket: Ticket, transaction }
 *   drawLotteryTicket(ticketId)            -> { ticket: Ticket, winTransaction|null }
 *   buyScratchCard()                       -> { card: { id, symbols:string[] }, transaction }
 *   revealScratchCard(cardId)              -> { prize, winTransaction|null }
 *   spinSlots({ bet })                     -> { reels:number[3], payout, betTransaction, winTransaction|null }
 *   completeTask(taskId)                   -> { reward, transaction }
 *   withdraw({ methodId, amountInr, account }) -> { withdrawal: { id, status, eta }, transaction }
 */
export const API_METHODS = [
  'sendOtp', 'verifyOtp', 'loginAsGuest', 'logout',
  'getAppConfig', 'getProfile', 'getWallet', 'getDailyState', 'getTasks', 'getLotteries', 'getMyTickets', 'getNotifications',
  'getLotteryResults', 'getLeaderboard', 'getReferral', 'getRecentSpinWins', 'markNotificationsRead',
  'claimCheckin', 'spinWheel', 'buyLotteryTicket', 'drawLotteryTicket', 'buyScratchCard', 'revealScratchCard',
  'spinSlots', 'completeTask', 'withdraw',
];
