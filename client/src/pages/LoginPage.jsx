import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const defaultState = { email: '', password: '' };

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const loggedInUser = await login(form);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl page-card p-8 sm:p-10">
      <div className="badge">Welcome back</div>
      <h1 className="mt-5 text-4xl font-semibold heading-text">Login to your impact dashboard</h1>
      <p className="mt-4 soft-text">Use your free account to manage scores, explore charities, and choose subscription only when it fits you.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        <button disabled={submitting} className="btn btn-primary w-full justify-center">
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
