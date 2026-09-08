import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Target,
  FileBarChart,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-accent-teal/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Fin<span className="text-accent-green">lytics</span>
          </span>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden text-sm text-text-primary/50 sm:inline">
                {user.email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="btn-pill border border-accent-teal/30 text-sm text-text-primary/70 hover:text-text-primary"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-5xl px-4 pb-3">
          <ul className="flex flex-wrap gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `btn-pill text-sm ${
                      isActive
                        ? 'bg-accent-green text-bg-base'
                        : 'text-text-primary/70 hover:text-text-primary'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
