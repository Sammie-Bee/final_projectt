import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Clock3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('northstar_token') || ''}` }
        });

        const normalized = Array.isArray(data) ? data : data.transactions || [];
        setTransactions(normalized);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusStyles = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'success' || normalized === 'completed') {
      return 'bg-[#ECFDF5] text-[#047857]';
    }
    if (normalized === 'failed') {
      return 'bg-rose-100 text-rose-700';
    }
    return 'bg-amber-100 text-amber-700';
  };

  const getTypeIcon = (type) => {
    const normalized = (type || '').toLowerCase();
    if (normalized === 'credit' || normalized === 'deposit') {
      return <ArrowUpRight className="h-4 w-4 text-[#10B981]" />;
    }
    if (normalized === 'withdrawal') {
      return <ArrowDownLeft className="h-4 w-4 text-slate-400" />;
    }
    return <CircleDollarSign className="h-4 w-4 text-[#1E1B4B]" />;
  };

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Recent activity</p>
          <h3 className="text-xl font-semibold text-[#0F172A]">Transaction history</h3>
        </div>
        <div className="rounded-full bg-[#ECFDF5] p-2 text-[#10B981]">
          <CircleDollarSign className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          Loading transactions...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No transactions yet. Your recent activity will appear here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_0.7fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span>Type</span>
            <span>Description</span>
            <span>Date</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="divide-y divide-slate-200 bg-white">
            {transactions.map((item) => {
              const amount = Number(item.amount || 0);
              const isPositive = amount >= 0;
              const amountLabel = `${isPositive ? '+' : '-'}$${Math.abs(amount).toFixed(2)}`;
              const timestamp = item.timestamp || item.createdAt || item.date || item.updatedAt;

              return (
                <div key={item.id || item._id || `${item.type}-${timestamp}`} className="grid gap-3 px-4 py-4 text-sm text-slate-700 md:grid-cols-[1.2fr_1.4fr_1fr_0.7fr_0.8fr] md:items-center">
                  <div className="flex items-center gap-2 font-medium">
                    {getTypeIcon(item.type)}
                    <span>{item.type || 'Transaction'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{item.description || 'No description provided'}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.reference || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    <span>{timestamp ? new Date(timestamp).toLocaleString() : 'Pending'}</span>
                  </div>
                  <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(item.status)}`}>
                    {item.status || 'Pending'}
                  </span>
                  <div className={`text-right font-semibold ${isPositive ? 'text-[#047857]' : 'text-slate-800'}`}>
                    {amountLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
