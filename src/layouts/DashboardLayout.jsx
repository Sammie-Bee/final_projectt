import { CircleDot, History, LayoutGrid, LogOut, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/dashboard/transactions', label: 'Transactions', icon: History }
];

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-6">
      <div className="mx-auto flex max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 lg:flex-row">
        <aside className="w-full bg-[#1E1B4B] p-6 text-white lg:w-72">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#10B981]/20 p-2 text-[#10B981]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Northstar</p>
              <p className="text-sm text-slate-300">Secure banking</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <header className="mb-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Good morning</p>
                <h2 className="text-xl font-semibold text-[#0F172A]">{user?.fullName || 'Customer'}</h2>
                <p className="mt-1 text-sm text-slate-500">Primary account • {user?.accountNumber || 'Pending'}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/20 bg-[#ECFDF5] px-4 py-2 text-sm text-[#047857]">
                  <CircleDot className="h-4 w-4" />
                  Active session
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                  Secure • {user?.role === 'admin' ? 'Admin' : 'User'}
                </div>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
