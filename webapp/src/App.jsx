import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTimerStore } from './store/useTimerStore';
import ToastHost from './components/ToastHost';
import ConfirmDialog from './components/ConfirmDialog';
import UpgradeModal from './components/UpgradeModal';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import PresenterPage from './pages/PresenterPage';
import AccountPage from './pages/AccountPage';
import PricingPage from './pages/PricingPage';
import UpgradeSuccessPage from './pages/UpgradeSuccessPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const theme = useTimerStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t) => {
      const resolved = t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
      root.classList.toggle('dark', resolved === 'dark');
    };
    applyTheme(theme);
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [theme]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/present/:roomCode" element={<PresenterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/upgrade/success" element={<UpgradeSuccessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastHost />
      <ConfirmDialog />
      <UpgradeModal />
    </>
  );
}
