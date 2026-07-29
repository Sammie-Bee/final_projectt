import { ArrowDownLeft, ArrowUpRight, CreditCard, Landmark, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Overview() {
  const { user, token, updateUser } = useAuth();
  const formattedBalance = user?.balance != null ? user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [isRecipientLoading, setIsRecipientLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [message, setMessage] = useState('');
  const [transferError, setTransferError] = useState('');
  const [depositError, setDepositError] = useState('');
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [isDepositLoading, setIsDepositLoading] = useState(false);

  const handleRecipientLookup = async (accountNumber) => {
    const normalized = accountNumber.trim();
    setRecipientName('');
    setRecipientError('');

    if (!normalized || !/^[0-9]{6,12}$/.test(normalized)) {
      setRecipientError('Enter a valid account number to find the recipient.');
      return;
    }

    setIsRecipientLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/users/recipient`, {
        params: { accountNumber: normalized },
        headers: { Authorization: `Bearer ${token || sessionStorage.getItem('northstar_token') || ''}` }
      });
      setRecipientName(data.fullName);
      setRecipientError('');
    } catch (error) {
      setRecipientName('');
      setRecipientError(error.response?.data?.message || 'Recipient could not be found.');
    } finally {
      setIsRecipientLoading(false);
    }
  };

  useEffect(() => {
    if (!recipient) {
      setRecipientName('');
      setRecipientError('');
      return;
    }

    const timeout = setTimeout(() => {
      handleRecipientLookup(recipient);
    }, 500);

    return () => clearTimeout(timeout);
  }, [recipient]);

  const handleTransfer = async (event) => {
    event.preventDefault();
    setTransferError('');
    setMessage('');

    const parsedAmount = Number(amount);
    const trimmedRecipient = recipient.trim();

    if (!trimmedRecipient || !/^[0-9]{6,12}$/.test(trimmedRecipient)) {
      setTransferError('Enter a valid recipient account number.');
      return;
    }

    if (!recipientName) {
      setTransferError('Please verify the recipient account before sending.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setTransferError('Enter a valid transfer amount.');
      return;
    }

    setIsTransferLoading(true);
    try {
      await axios.post(
        `${API_URL}/transactions/transfer`,
        { recipientAccountNumber: trimmedRecipient, amount: parsedAmount },
        { headers: { Authorization: `Bearer ${token || sessionStorage.getItem('northstar_token') || ''}` } }
      );
      setRecipient('');
      setRecipientName('');
      setAmount('');
      setMessage(`Transfer of $${parsedAmount.toFixed(2)} to ${recipientName} has been queued.`);
    } catch (error) {
      setTransferError(error.response?.data?.message || 'Transfer could not be processed right now.');
    } finally {
      setIsTransferLoading(false);
    }
  };

  const handleDeposit = async (event) => {
    event.preventDefault();
    setDepositError('');
    setMessage('');

    const parsedAmount = Number(depositAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setDepositError('Enter a valid deposit amount.');
      return;
    }

    setIsDepositLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/transactions/deposit`,
        { amount: parsedAmount },
        { headers: { Authorization: `Bearer ${token || sessionStorage.getItem('northstar_token') || ''}` } }
      );
      setDepositAmount('');
      setMessage(`Deposit of $${parsedAmount.toFixed(2)} has been received.`);
      updateUser({ balance: data.balance });
    } catch (error) {
      setDepositError(error.response?.data?.message || 'Deposit could not be processed.');
    } finally {
      setIsDepositLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Available balance</p>
              <p className="mt-2 text-3xl font-semibold text-[#0F172A]">${formattedBalance}</p>
            </div>
            <div className="rounded-2xl bg-[#ECFDF5] p-3 text-[#10B981]">
              <Landmark className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <CreditCard className="h-5 w-5 text-[#1E1B4B]" />
            <div>
              <p className="text-sm text-slate-500">Primary account</p>
              <p className="font-medium text-[#0F172A]">{user?.accountNumber || '---'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-[#1E1B4B] p-6 text-white shadow-sm">
          <p className="text-sm text-slate-300">Today’s snapshot</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white/10 p-3">
              <span className="flex items-center gap-2 text-sm"><ArrowUpRight className="h-4 w-4 text-[#10B981]" />Incoming</span>
              <span className="font-medium">+$3,540</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/10 p-3">
              <span className="flex items-center gap-2 text-sm"><ArrowDownLeft className="h-4 w-4 text-rose-400" />Outgoing</span>
              <span className="font-medium">-$980</span>
            </div>
          </div>
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-[#10B981]/20 bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">{message}</div> : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleTransfer} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#1E1B4B]">
            <Send className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Send money</h3>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">Recipient account</span>
              <input
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="Account number"
              />
            </label>
            <div className="mb-4 flex items-center justify-between gap-3 text-sm">
              <div>
                {isRecipientLoading ? (
                  <p className="text-slate-500">Looking up recipient…</p>
                ) : recipientName ? (
                  <p className="text-emerald-600">Recipient: {recipientName}</p>
                ) : recipientError ? (
                  <p className="text-rose-600">{recipientError}</p>
                ) : (
                  <p className="text-slate-500">Enter an account number to preview recipient name.</p>
                )}
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">Amount</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                min="0"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="0.00"
              />
            </label>
            {transferError ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{transferError}</p> : null}
            <button
              type="submit"
              disabled={isTransferLoading}
              className="w-full rounded-full bg-[#10B981] px-4 py-3 font-medium text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isTransferLoading ? 'Sending...' : 'Send funds'}
            </button>
          </div>
        </form>

        <form onSubmit={handleDeposit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#1E1B4B]">
            <ArrowDownLeft className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Deposit</h3>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">Amount</span>
              <input
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                type="number"
                min="0"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="0.00"
              />
            </label>
            {depositError ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{depositError}</p> : null}
            <button
              type="submit"
              disabled={isDepositLoading}
              className="w-full rounded-full bg-[#1E1B4B] px-4 py-3 font-medium text-white transition hover:bg-[#312e81] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDepositLoading ? 'Processing...' : 'Make deposit'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Overview;
