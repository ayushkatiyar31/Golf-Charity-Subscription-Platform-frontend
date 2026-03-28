import { useEffect, useState } from 'react';
import { Heart, Sparkles, Trophy, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscriptionService, userService } from '../services';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/StatCard';

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('15');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: dashboard }, { data: subscriptionData }] = await Promise.all([
        userService.dashboard(),
        subscriptionService.status()
      ]);
      setData({ ...dashboard, subscriptionData });
      setUser(dashboard.profile);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const donate = async () => {
    setMessage('');
    setError('');
    try {
      await subscriptionService.donate({ amount: Number(donationAmount) });
      setDonationAmount('15');
      setMessage('Independent donation recorded.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add donation');
    }
  };

  const uploadProof = async (prizeId, file) => {
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('proof', file);
      await userService.uploadProof(prizeId, formData);
      setMessage('Proof uploaded for review.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload proof');
    }
  };

  if (loading) {
    return <div className="soft-text">Loading dashboard...</div>;
  }

  const subscription = data?.subscriptionData?.currentSubscription;
  const subscriptionLabel = subscription?.status || 'free';

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="page-card p-6">
          <div className="badge">Your dashboard</div>
          <h1 className="mt-5 text-4xl font-semibold heading-text">Your charity journey, score activity, and subscriber status</h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Status" value={subscriptionLabel} tone="emerald" />
            <StatCard label="Contribution" value={`${user?.contributionPercentage || 10}%`} tone="amber" />
            <StatCard label="Charity" value={user?.charity?.name?.split(' ')[0] || 'Later'} tone="blue" />
            <StatCard label="Total winnings" value={`$${data?.winnings?.total?.toFixed(2) || '0.00'}`} tone="rose" />
          </div>
          {message ? <div className="mt-5 rounded-[1.2rem] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-5 rounded-[1.2rem] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </div>

        <div className="page-card p-6">
          <div className="flex items-center gap-3 text-[color:var(--brand)]"><Sparkles size={18} /> Subscription & payment</div>
          <div className="mt-4 soft-text">Go to the dedicated subscription page to compare plans, choose from multiple charities, and complete secure payment.</div>
          <Link to="/subscribe" className="btn btn-primary mt-6 w-full justify-center">Subscribe / Pay Now</Link>
          <div className="mt-4 rounded-[1.2rem] border border-[color:var(--line)] p-4 text-sm soft-text">
            <div>Current plan: {subscription?.plan?.name || 'No active subscription yet'}</div>
            <div>Ends: {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Not active yet'}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="page-card p-6">
          <div className="flex items-center gap-3 text-[color:var(--accent)]"><Trophy size={18} /> Draw participation history</div>
          <div className="mt-5 space-y-4">
            {data?.drawHistory?.length ? data.drawHistory.map((item) => (
              <div key={item.drawId} className="rounded-[1.2rem] border border-[color:var(--line)] p-4">
                <div className="flex items-center justify-between heading-text">
                  <span>{item.monthKey}</span>
                  <span>{item.matchCount}-match</span>
                </div>
                <div className="mt-2 text-sm soft-text">Your scores: {item.scoreValues.join(', ') || 'No scores submitted'}</div>
                <div className="mt-1 text-sm soft-text">Winning numbers: {item.winningNumbers.join(', ')}</div>
                <div className="mt-1 text-sm text-[color:var(--brand)]">Prize: ${item.prizeAmount.toFixed(2)}</div>
              </div>
            )) : <div className="rounded-[1.2rem] border border-dashed border-[color:var(--line)] p-5 soft-text">No draw history yet.</div>}
          </div>
        </div>

        <div className="page-card p-6">
          <div className="flex items-center gap-3 text-[color:var(--accent)]"><Heart size={18} /> Charity giving summary</div>
          <div className="mt-4 soft-text">Your selected charity is <span className="heading-text">{user?.charity?.name || 'not selected yet'}</span>. Independent donations are always available.</div>
          <div className="mt-5 flex gap-3">
            <input className="input" type="number" min="1" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} />
            <button onClick={donate} className="btn btn-primary">Donate</button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatCard label="Independent giving" value={`$${Number(data?.profile?.totalIndependentDonations || 0).toFixed(2)}`} tone="rose" />
            <StatCard label="Pending payouts" value={`$${Number(data?.winnings?.pending || 0).toFixed(2)}`} tone="amber" />
          </div>
          <div className="mt-6 space-y-4">
            {data?.donations?.slice(0, 4).map((donation) => (
              <div key={donation._id} className="flex items-center justify-between rounded-[1.1rem] border border-[color:var(--line)] px-4 py-3">
                <div>
                  <div className="heading-text">{donation.charity?.name}</div>
                  <div className="text-sm soft-text">{donation.type.replace('_', ' ')}</div>
                </div>
                <div className="text-[color:var(--brand)]">${donation.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-card p-6">
        <div className="flex items-center gap-3 text-[color:var(--brand)]"><Upload size={18} /> Winner verification and payment status</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data?.prizes?.length ? data.prizes.map((prize) => (
            <div key={prize._id} className="rounded-[1.2rem] border border-[color:var(--line)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="heading-text">{prize.draw?.monthKey}</div>
                  <div className="text-sm soft-text">{prize.matchCount}-match winner</div>
                </div>
                <div className="text-[color:var(--brand)]">${prize.amount.toFixed(2)}</div>
              </div>
              <div className="mt-3 text-sm soft-text">Verification: {prize.verificationStatus} | Payment: {prize.payoutStatus}</div>
              <label className="btn btn-secondary mt-4 inline-flex cursor-pointer">
                Upload proof
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadProof(prize._id, e.target.files[0])} />
              </label>
            </div>
          )) : <div className="rounded-[1.2rem] border border-dashed border-[color:var(--line)] p-5 soft-text">No winnings yet.</div>}
        </div>
      </section>
    </div>
  );
}
