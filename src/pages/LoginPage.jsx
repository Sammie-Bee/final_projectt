import { useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const nextPath = user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(nextPath, { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const nextUser = await login(email, password);
      const nextPath = nextUser?.role === 'admin' ? '/admin' : '/dashboard';
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E1B4B] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-8 shadow-2xl shadow-black/20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Access your Northstar dashboard safely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
              <Mail className="mr-2 h-4 w-4 text-slate-400" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="w-full bg-transparent outline-none"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1E1B4B] px-4 py-3 font-medium text-white transition hover:bg-[#312e81] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Continue'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <p>
            New here?{' '}
            <Link to="/register" className="font-semibold text-[#1E1B4B]">
              Create account
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="font-semibold text-[#1E1B4B]">
              Forgot password?
            </Link>
          </p>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Owner access: <span className="font-semibold text-[#1E1B4B]">owner@northstar.com</span> / <span className="font-semibold text-[#1E1B4B]">Owner123!</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
