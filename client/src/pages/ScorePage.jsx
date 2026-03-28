import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services';

export default function ScorePage() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [form, setForm] = useState({ value: '', date: '' });
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');

  const loadScores = async () => {
    try {
      const { data } = await userService.scores();
      setScores(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login to manage scores.');
    }
  };

  useEffect(() => {
    if (user) {
      loadScores();
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (editingId) {
        const { data } = await userService.updateScore(editingId, form);
        setScores(data);
      } else {
        const { data } = await userService.addScore(form);
        setScores(data);
      }
      setForm({ value: '', date: '' });
      setEditingId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save score');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="page-card p-6">
        <div className="badge">Score management</div>
        <h1 className="mt-5 text-4xl font-semibold heading-text">Track your last five scores with zero subscription pressure</h1>
        <p className="mt-4 leading-8 soft-text">Every logged-in user can add and edit scores. Subscription is now optional and only matters when you want premium draw participation and automated giving.</p>
      </section>

      <section className="page-card p-6">
        {user ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="input" type="number" min="1" max="45" placeholder="Score value (1-45)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              {error ? <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
              <button className="btn btn-primary w-full justify-center">
                <Save size={16} /> {editingId ? 'Update score' : 'Add score'}
              </button>
            </form>

            <div className="mt-8 space-y-4">
              {scores.map((score) => (
                <button
                  key={score._id}
                  onClick={() => {
                    setEditingId(score._id);
                    setForm({ value: score.value, date: new Date(score.date).toISOString().slice(0, 10) });
                  }}
                  className="card-hover flex w-full items-center justify-between rounded-[1.2rem] border border-[color:var(--line)] px-4 py-4 text-left"
                >
                  <div>
                    <div className="heading-text">Score {score.value}</div>
                    <div className="text-sm soft-text">{new Date(score.date).toLocaleDateString()}</div>
                  </div>
                  <div className="badge">Edit</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[1.3rem] border border-dashed border-[color:var(--line)] p-6 soft-text">Login to create your free score history.</div>
        )}
      </section>
    </div>
  );
}
