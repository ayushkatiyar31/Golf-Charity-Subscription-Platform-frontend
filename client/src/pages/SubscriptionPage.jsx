import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, HeartHandshake, Sparkles } from 'lucide-react';
import { charityService, subscriptionService, userService } from '../services';
import { useAuth } from '../hooks/useAuth';

export default function SubscriptionPage() {
  const { user, setUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [charities, setCharities] = useState([]);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentGatewayReady, setPaymentGatewayReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: subscriptionData }, { data: charityData }] = await Promise.all([
        subscriptionService.status(),
        charityService.list()
      ]);
      setPlans(subscriptionData.plans || []);
      setCurrentSubscription(subscriptionData.currentSubscription || null);
      setTransactions(subscriptionData.transactions || []);
      setPaymentGatewayReady(Boolean(subscriptionData.paymentGatewayReady));
      setCharities(charityData || []);
      if (!selectedPlanId && subscriptionData.plans?.[0]?._id) {
        setSelectedPlanId(subscriptionData.plans[0]._id);
      }
      if (!selectedCharityId) {
        setSelectedCharityId(user?.charity?._id || charityData?.[0]?._id || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load subscription options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user?.charity?._id && !selectedCharityId) {
      setSelectedCharityId(user.charity._id);
    }
  }, [user?.charity?._id, selectedCharityId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    const sessionId = params.get('session_id');

    if (checkoutStatus !== 'success' || !sessionId) {
      if (checkoutStatus === 'cancelled') {
        setMessage('Payment was cancelled before completion.');
      }
      return;
    }

    const confirm = async () => {
      try {
        await subscriptionService.confirmCheckoutSession(sessionId);
        setMessage('Payment successful. Your subscription is now active.');
        await load();
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to confirm payment');
      } finally {
        window.history.replaceState({}, document.title, '/subscribe');
      }
    };

    confirm();
  }, []);

  const handleCharitySelect = async (charityId) => {
    setSelectedCharityId(charityId);
    setMessage('');
    setError('');

    try {
      const { data } = await userService.updatePreferences({ charityId });
      setUser(data);
      setMessage('Charity preference updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update charity preference');
    }
  };

  const handleSubscribe = async () => {
    setMessage('');
    setError('');
    try {
      const payload = {
        planId: selectedPlanId || undefined,
        charityId: selectedCharityId || user?.charity?._id || undefined,
        autoRenew: true
      };
      const { data } = await subscriptionService.createCheckoutSession(payload);
      if (data.mode === 'redirect' && data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(data.message || 'Redirecting to payment');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start payment');
    }
  };

  if (loading) {
    return <div className="soft-text">Loading subscription page...</div>;
  }

  const activeCharityId = selectedCharityId || user?.charity?._id || '';
  const selectedPlan = plans.find((plan) => plan._id === selectedPlanId) || plans[0];
  const selectedCharity = charities.find((charity) => charity._id === activeCharityId);
  const canStartCheckout = paymentGatewayReady && selectedPlan && activeCharityId;

  return (
    <div className="space-y-8">
      <section className="page-card p-6 sm:p-8">
        <div className="badge">Subscription flow</div>
        <h1 className="mt-5 text-4xl font-semibold heading-text">Choose a charity, pick a plan, then pay securely</h1>
        <p className="mt-4 max-w-3xl soft-text">Select your cause, choose monthly or yearly billing, and continue to Stripe Checkout. Subscription activates only after payment succeeds.</p>
        {message ? <div className="mt-5 rounded-[1.2rem] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
        {error ? <div className="mt-5 rounded-[1.2rem] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="page-card p-6">
          <div className="flex items-center gap-3 text-[color:var(--brand)]"><HeartHandshake size={18} /> Choose your charity</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {charities.map((charity) => {
              const isSelected = activeCharityId === charity._id;
              return (
                <button
                  key={charity._id}
                  onClick={() => handleCharitySelect(charity._id)}
                  className={`card-hover rounded-[1.4rem] border p-4 text-left ${isSelected ? 'border-[color:var(--brand)] bg-[color:var(--brand)]/10' : 'border-[color:var(--line)]'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="heading-text text-lg font-semibold">{charity.name}</div>
                      <div className="text-sm soft-text">{charity.cause} • {charity.category}</div>
                    </div>
                    {isSelected ? <CheckCircle2 size={18} className="text-[color:var(--brand)]" /> : null}
                  </div>
                  <p className="mt-3 text-sm soft-text">{charity.shortDescription}</p>
                  <div className="mt-3 text-xs uppercase tracking-[0.16em] text-[color:var(--brand)]">{charity.impactMetric?.label}: {charity.impactMetric?.value}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="page-card p-6">
          <div className="flex items-center gap-3 text-[color:var(--brand)]"><CreditCard size={18} /> Select a plan</div>
          <div className="mt-5 space-y-3">
            {plans.map((plan) => (
              <button
                key={plan._id}
                onClick={() => setSelectedPlanId(plan._id)}
                className={`w-full rounded-[1.3rem] border p-4 text-left transition ${selectedPlanId === plan._id ? 'border-[color:var(--brand)] bg-[color:var(--brand)]/10' : 'border-[color:var(--line)] hover:border-[color:var(--brand)]/40'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="heading-text text-lg font-semibold">{plan.name}</div>
                    <div className="text-sm soft-text">{plan.discountLabel || `${plan.interval} billing`}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-[color:var(--brand)]">${plan.price}</div>
                    <div className="text-xs soft-text">/{plan.interval === 'yearly' ? 'year' : 'month'}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedPlan ? (
            <div className="mt-5 rounded-[1.3rem] border border-[color:var(--line)] p-4">
              <div className="text-sm uppercase tracking-[0.16em] soft-text">Included benefits</div>
              <div className="mt-3 space-y-2 text-sm soft-text">
                {selectedPlan.benefits.map((benefit) => (
                  <div key={benefit}>• {benefit}</div>
                ))}
              </div>
            </div>
          ) : null}

          <button
            onClick={handleSubscribe}
            disabled={!canStartCheckout}
            className="btn btn-primary mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <Sparkles size={16} /> Subscribe / Pay Now
          </button>

          <div className="mt-4 rounded-[1.2rem] border border-[color:var(--line)] p-4 text-sm soft-text">
            <div className="heading-text font-semibold">Current selection</div>
            <div className="mt-2">Charity: {selectedCharity?.name || 'Not selected yet'}</div>
            <div>Plan: {selectedPlan?.name || 'Not selected yet'}</div>
            <div>Activation: after successful payment only</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="page-card p-6">
          <div className="text-sm uppercase tracking-[0.16em] soft-text">Current subscription</div>
          <div className="mt-4 text-2xl font-semibold heading-text">{currentSubscription?.status || 'No active subscription yet'}</div>
          <div className="mt-2 soft-text">{currentSubscription?.plan?.name || 'Choose a plan above to get started.'}</div>
          <div className="mt-4 text-sm soft-text">Ends: {currentSubscription?.currentPeriodEnd ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString() : 'Not active yet'}</div>
        </div>
        <div className="page-card p-6">
          <div className="text-sm uppercase tracking-[0.16em] soft-text">Payment history</div>
          <div className="mt-4 space-y-3">
            {transactions.length ? transactions.map((transaction) => (
              <div key={transaction._id} className="rounded-[1rem] border border-[color:var(--line)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="heading-text">{transaction.status}</div>
                  <div className="text-[color:var(--brand)]">${transaction.amount}</div>
                </div>
                <div className="mt-1 text-sm soft-text">{transaction.type} • {transaction.provider}</div>
              </div>
            )) : <div className="rounded-[1rem] border border-dashed border-[color:var(--line)] p-4 soft-text">No payments yet.</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
