import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HandHeart, LayoutDashboard, LogOut, Moon, Shield, Sparkles, SunMedium } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/charities', label: 'Charities' },
  { to: '/score-center', label: 'Scores' }
];

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const displayName = user?.name?.trim() || user?.email || 'Signed in';

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--panel-strong)]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)]/15 text-[color:var(--brand)]">
            <HandHeart size={22} />
          </div>
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.3em] text-[color:var(--text-soft)]">Golf Charity</div>
            <div className="text-lg font-semibold heading-text">Platform</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={toggleTheme} className="theme-toggle flex items-center justify-center" aria-label="Toggle theme">
            <span className="sr-only">Toggle theme</span>
          </button>
          <div className="hidden text-[color:var(--text-soft)] sm:block">
            {theme === 'dark' ? <Moon size={18} /> : <SunMedium size={18} />}
          </div>
          {user ? (
            <>
              <div className="hidden rounded-2xl border border-[color:var(--line)] px-4 py-2 text-sm font-semibold heading-text sm:block">
                {displayName}
              </div>
              <Link to="/dashboard" className="btn btn-secondary hidden sm:inline-flex">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              {isAdmin ? (
                <Link to="/admin" className="btn hidden border border-amber-400/30 bg-amber-300/10 text-amber-700 sm:inline-flex" style={{ color: 'var(--text)' }}>
                  <Shield size={16} /> Admin
                </Link>
              ) : null}
              <button onClick={handleLogout} className="btn btn-ghost">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">
                <Sparkles size={16} /> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
