import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { charityService } from '../services';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    charityId: '',
    contributionPercentage: 10
  });

  useEffect(() => {
    charityService.list().then(({ data }) => setCharities(data));
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register({
        ...form,
        charityId: form.charityId || null,
        contributionPercentage: Number(form.contributionPercentage)
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl page-card p-8 sm:p-10">
      <div className="badge">Free sign up</div>
      <h1 className="mt-5 text-4xl font-semibold heading-text">Create your account, then subscribe when you're ready</h1>
      <p className="mt-4 soft-text">Registration is free. After login, users can go to the dedicated subscription page, choose from multiple charities, select a plan, and complete payment securely.</p>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <input className="input sm:col-span-2" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="input sm:col-span-2" value={form.charityId} onChange={(e) => setForm({ ...form, charityId: e.target.value })}>
          <option value="">Choose a charity later</option>
          {charities.map((charity) => (
            <option key={charity._id} value={charity._id}>{charity.name} - {charity.cause || charity.category}</option>
          ))}
        </select>
        <input className="input sm:col-span-2" type="number" min="10" max="100" placeholder="Contribution % if you select a charity" value={form.contributionPercentage} onChange={(e) => setForm({ ...form, contributionPercentage: e.target.value })} />
        {error ? <div className="sm:col-span-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        <button disabled={submitting} className="btn btn-primary sm:col-span-2 w-full justify-center">
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
