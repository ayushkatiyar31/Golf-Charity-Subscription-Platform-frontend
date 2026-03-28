import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const AppLayout = () => (
  <div className="theme-shell grid-glow min-h-screen">
    <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Outlet />
    </main>
    <footer className="site-footer mx-auto mt-12 w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="site-footer-inner rounded-[1.8rem] px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--brand)]">Golf Charity Platform</div>
            <div className="mt-3 text-lg font-semibold heading-text sm:text-xl">A charity-first golf experience built to turn participation into real impact.</div>
            <div className="mt-2 text-sm soft-text">Subscriptions, score tracking, monthly rewards, and meaningful giving, brought together in one modern platform.</div>
          </div>
          <div className="site-footer-credit text-sm soft-text">
            Designed and developed by <span className="font-semibold heading-text">Ayush Katiyar</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
);
