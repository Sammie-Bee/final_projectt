import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Users } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost'
? 'http://localhost:5000/api'
: 'https://final-projectt-evjs.onrender.com/api';

function AdminDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchAccounts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/accounts`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('northstar_token') || ''}` }
      });
      setAccounts(data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const toggleStatus = async (userId, isActive) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/users/accounts/${userId}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('northstar_token') || ''}` } }
      );
      setMessage(data.message);
      fetchAccounts();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update account');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col gap-4 rounded-[1.5rem] bg-[#1E1B4B] p-8 text-white lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Admin console</p>
            <h1 className="mt-2 text-3xl font-semibold">Operations overview</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300">Review all signed-up accounts and activate or deactivate access instantly.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-[#10B981]" />
              Live monitoring enabled
            </div>
          </div>
        </div>

        {message ? <div className="mt-6 rounded-2xl border border-[#10B981]/20 bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">{message}</div> : null}

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200">
          <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
            Registered accounts
          </div>
          {loading ? (
            <div className="px-4 py-6 text-sm text-slate-500">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">No user accounts have registered yet.</div>
          ) : (
            <div className="divide-y divide-slate-200 bg-white">
              {accounts.map((account) => (
                <div key={account._id} className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{account.fullName}</p>
                    <p className="text-sm text-slate-500">{account.email}</p>
                    <p className="mt-1 text-sm text-slate-500">Account • {account.accountNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${account.isActive ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-rose-100 text-rose-700'}`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toggleStatus(account._id, !account.isActive)}
                      className={`rounded-full px-4 py-2 text-sm font-medium text-white transition ${account.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#10B981] hover:bg-[#059669]'}`}
                    >
                      {account.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
