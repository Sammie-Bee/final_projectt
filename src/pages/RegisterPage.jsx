import { useEffect, useState } from 'react';
import { ArrowRight, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, user } = useAuth();
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
    setAccountNumber('');
    setIsSubmitting(true);

    try {
      const createdUser = await register(fullName, email, password);
      const generatedAccountNumber = createdUser?.accountNumber || String(1000000000 + Math.floor(Math.random() * 9000000000));
      setAccountNumber(generatedAccountNumber);
      const nextPath = createdUser?.role === 'admin' ? '/admin' : '/dashboard';
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create your account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E1B4B] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-8 shadow-2xl shadow-black/20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981]">
            <UserRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Open a new Northstar account in minutes</p>
        </div>

        {accountNumber ? (
          <div className="mb-5 rounded-[1.25rem] border border-[#10B981]/20 bg-[#ECFDF5] p-4 text-sm text-[#047857]">
            <p className="font-semibold">Account created successfully</p>
            <p className="mt-1">Your auto-generated account number is <span className="font-semibold">{accountNumber}</span></p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              type="text"
              required
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              placeholder="Ava Johnson"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              placeholder="you@example.com"
            />
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#10B981] px-4 py-3 font-medium text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already signed up?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-[#1E1B4B]"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
