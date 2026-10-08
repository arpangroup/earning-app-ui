import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { env } from './config/env';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorState, Loader } from './components/States';
import BottomNav from './components/BottomNav';
import TaskOverlay from './components/TaskOverlay';
import Toast from './components/Toast';
import WinModal from './components/WinModal';
import Earn from './screens/Earn';
import Games from './screens/Games';
import Home from './screens/Home';
import Leaderboard from './screens/Leaderboard';
import Login from './screens/Login';
import Lottery from './screens/Lottery';
import LotteryDraw from './screens/LotteryDraw';
import LotteryPick from './screens/LotteryPick';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import Refer from './screens/Refer';
import ScratchCard from './screens/ScratchCard';
import Slots from './screens/Slots';
import Splash from './screens/Splash';
import SpinWheel from './screens/SpinWheel';
import Wallet from './screens/Wallet';
import Withdraw from './screens/Withdraw';

/** Gate for every logged-in screen: waits for the bootstrap and handles failures. */
function RequireSession() {
  const { status, bootError, bootstrap } = useApp();
  if (status === 'guest') return <Navigate to="/login" replace />;
  if (status === 'loading') return <Loader full label="Loading your rewards…" />;
  if (status === 'error') return <ErrorState full error={bootError} onRetry={bootstrap} />;
  return <Outlet />;
}

/** Small ribbon so testers always know which backend they are on (hidden in production). */
function EnvBadge() {
  if (env.isProduction) return null;
  return <div className={`env-badge ${env.name}`}>{env.name}{env.useMock ? ' · mock' : ''}</div>;
}

function TabLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

/** Reset scroll position of the screen container on every navigation. */
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.querySelector('.screen')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="device">
          <div className="app-shell">
            <div className="bg-orbs" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <EnvBadge />
            <ScrollReset />
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route element={<RequireSession />}>
                <Route element={<TabLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/earn" element={<Earn />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/spin" element={<SpinWheel />} />
                <Route path="/lottery" element={<Lottery />} />
                <Route path="/lottery/:id" element={<LotteryPick />} />
                <Route path="/lottery/draw/:ticketId" element={<LotteryDraw />} />
                <Route path="/scratch" element={<ScratchCard />} />
                <Route path="/slots" element={<Slots />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/refer" element={<Refer />} />
              </Route>
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
            <TaskOverlay />
            <WinModal />
            <Toast />
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
