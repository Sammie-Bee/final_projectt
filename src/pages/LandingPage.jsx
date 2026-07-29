import { ArrowRight, ShieldCheck, Sparkles, Wallet2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1E1B4B] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="rounded-full bg-[#10B981]/20 p-2">
              <Wallet2 className="h-5 w-5 text-[#10B981]" />
            </div>
            Northstar Bank
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <button
            type="button"
            onClick={handleNavigateToLogin}
            className="rounded-full px-4 py-2 transition hover:bg-white/10"
          >
            Login
          </button>
          <Link to="/register" className="rounded-full bg-[#10B981] px-4 py-2 font-medium text-white transition hover:bg-[#059669]">
            Open account
          </Link>
          </nav>
        </header>

        <main className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8 rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/20 lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] px-3 py-1 text-sm font-medium text-[#047857]">
              <Sparkles className="h-4 w-4" />
              Modern fintech for everyday banking
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-[#0F172A] sm:text-5xl">
                Bank smarter with a dashboard designed for momentum.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Send money instantly, track balances in real time, and manage every account detail from one polished experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-[#1E1B4B] px-5 py-3 font-medium text-white transition hover:bg-[#312e81]">
                Create account <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleNavigateToLogin}
                className="rounded-full border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:border-slate-300"
              >
                Sign in
              </button>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {['Instant transfers', 'Secure login', '24/7 insight'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <ShieldCheck className="mb-2 h-5 w-5 text-[#10B981]" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur lg:p-8">
            <div className="rounded-[1.5rem] bg-white p-6 text-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Available balance</p>
                  <p className="mt-2 text-3xl font-semibold">$24,580.00</p>
                </div>
                <div className="rounded-2xl bg-[#ECFDF5] p-3 text-[#10B981]">
                  <Wallet2 className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Account</span>
                  <span className="font-medium">**** 2048</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="rounded-full bg-[#ECFDF5] px-2 py-1 text-[#047857]">Verified</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default LandingPage;
