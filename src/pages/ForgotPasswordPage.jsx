import { useState } from 'react';
import { ArrowRight, Mail, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ForgotPasswordPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, {
        fullName,
        email,
        password
      });

      setMessage(data.message || 'Your password has been reset successfully.');
      setFullName('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset your password right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1E1B4B] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-8 shadow-2xl shadow-black/20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981]">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Forgot password</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your name and email to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
              <User className="mr-2 h-4 w-4 text-slate-400" />
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                type="text"
                required
                className="w-full bg-transparent outline-none"
                placeholder="Your full name"
              />
            </div>
          </label>

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
            <span className="mb-1.5 block text-sm font-medium text-slate-700">New password</span>
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
          {message ? <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1E1B4B] px-4 py-3 font-medium text-white transition hover:bg-[#312e81] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Resetting...' : 'Reset password'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-[#1E1B4B]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
