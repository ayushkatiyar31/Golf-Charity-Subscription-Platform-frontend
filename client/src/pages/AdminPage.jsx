import { useEffect, useState } from 'react';
import { adminService, charityService } from '../services';
import { apiBaseUrl } from '../services/api';
import { StatCard } from '../components/StatCard';

const emptyCharityForm = {
  name: '',
  category: '',
  shortDescription: '',
  description: '',
  image: '',
  location: '',
  website: '',
  featured: false
};

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [charities, setCharities] = useState([]);
  const [preview, setPreview] = useState(null);
  const [logic, setLogic] = useState('random');
  const [charityForm, setCharityForm] = useState(emptyCharityForm);
  const [editingCharityId, setEditingCharityId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    role: 'subscriber',
    contributionPercentage: 10,
    charity: '',
    subscriptionStatus: 'expired',
    scoresText: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const [analyticsRes, usersRes, proofsRes, charitiesRes] = await Promise.all([
        adminService.analytics(),
        adminService.users(),
        adminService.proofs(),
        charityService.list()
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setProofs(proofsRes.data);
      setCharities(charitiesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedUser = users.find((entry) => entry._id === selectedUserId);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setUserForm({
      name: selectedUser.name,
      role: selectedUser.role,
      contributionPercentage: selectedUser.contributionPercentage,
      charity: selectedUser.charity?._id || '',
      subscriptionStatus: selectedUser.subscription?.status || 'expired',
      scoresText: (selectedUser.scores || [])
        .map((score) => `${score.value}|${new Date(score.date).toISOString().slice(0, 10)}`)
        .join('\n')
    });
  }, [selectedUserId, users]);

  const runPreview = async () => {
    setError('');
    const { data } = await adminService.previewDraw({ logic });
    setPreview(data);
  };

  const publishDraw = async () => {
    setMessage('');
    setError('');
    try {
      await adminService.publishDraw({ logic });
      setMessage('Draw published successfully.');
      await load();
      await runPreview();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to publish draw');
    }
  };

  const saveCharity = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      if (editingCharityId) {
        await charityService.update(editingCharityId, charityForm);
        setMessage('Charity updated.');
      } else {
        await charityService.create(charityForm);
        setMessage('Charity created.');
      }
      setCharityForm(emptyCharityForm);
      setEditingCharityId('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save charity');
    }
  };

  const editCharity = (charity) => {
    setEditingCharityId(charity._id);
    setCharityForm({
      name: charity.name || '',
      category: charity.category || '',
      shortDescription: charity.shortDescription || '',
      description: charity.description || '',
      image: charity.image || '',
      location: charity.location || '',
      website: charity.website || '',
      featured: charity.featured || false
    });
  };

  const removeCharity = async (id) => {
    setMessage('');
    setError('');
    try {
      await charityService.remove(id);
      setMessage('Charity removed.');
      if (editingCharityId === id) {
        setEditingCharityId('');
        setCharityForm(emptyCharityForm);
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove charity');
    }
  };

  const saveUser = async (event) => {
    event.preventDefault();
    if (!selectedUserId) {
      return;
    }

    setMessage('');
    setError('');
    try {
      const parsedScores = userForm.scoresText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [value, date] = line.split('|');
          return { value: Number(value), date };
        })
        .slice(-5);

      await adminService.updateUser(selectedUserId, {
        name: userForm.name,
        role: userForm.role,
        contributionPercentage: Number(userForm.contributionPercentage),
        charity: userForm.charity,
        subscription: { status: userForm.subscriptionStatus },
        scores: parsedScores
      });
      setMessage('User updated.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update user');
    }
  };

  const reviewProof = async (id, verificationStatus, payoutStatus) => {
    setMessage('');
    setError('');
    try {
      await adminService.reviewProof(id, { verificationStatus, payoutStatus });
      setMessage('Winner review updated.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to review proof');
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={analytics?.totalUsers || 0} tone="emerald" />
        <StatCard label="Prize pool" value={`$${(analytics?.totalPrizePool || 0).toFixed(2)}`} tone="amber" />
        <StatCard label="Charity contributions" value={`$${(analytics?.charityContributions || 0).toFixed(2)}`} tone="blue" />
        <StatCard label="Draws" value={analytics?.totalDraws || 0} tone="rose" />
      </section>

      {message ? <div className="rounded-[1.2rem] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
      {error ? <div className="rounded-[1.2rem] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="page-card p-6">
          <div className="badge">Draw management</div>
          <h2 className="mt-4 text-3xl font-semibold heading-text">Simulate before you publish</h2>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setLogic('random')} className={`btn ${logic === 'random' ? 'btn-primary' : 'btn-secondary'}`}>Random</button>
            <button onClick={() => setLogic('algorithm')} className={`btn ${logic === 'algorithm' ? 'btn-primary' : 'btn-secondary'}`}>Algorithm</button>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={runPreview} className="btn btn-secondary">Run simulation</button>
            <button onClick={publishDraw} className="btn btn-primary">Publish results</button>
          </div>
          {preview ? (
            <div className="mt-6 rounded-[1.2rem] border border-[color:var(--line)] p-4 soft-text">
              <div className="heading-text">Winning numbers: {preview.winningNumbers.join(', ')}</div>
              <div className="mt-2">Pool: ${preview.totalPool.toFixed(2)}</div>
              <div>Rollover next month: ${preview.rolloverToNext.toFixed(2)}</div>
              <div className="mt-2">Entries simulated: {preview.entries.length}</div>
            </div>
          ) : null}
        </div>

        <div className="page-card p-6">
          <div className="badge">User management</div>
          <div className="mt-5 space-y-4">
            <select className="input" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">Select a user to edit</option>
              {users.map((entry) => (
                <option key={entry._id} value={entry._id}>{entry.name} ({entry.email})</option>
              ))}
            </select>
            {selectedUserId ? (
              <form onSubmit={saveUser} className="grid gap-3">
                <input className="input" placeholder="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select className="input" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                    <option value="subscriber">Subscriber</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select className="input" value={userForm.subscriptionStatus} onChange={(e) => setUserForm({ ...userForm, subscriptionStatus: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <input className="input" type="number" min="10" max="100" value={userForm.contributionPercentage} onChange={(e) => setUserForm({ ...userForm, contributionPercentage: e.target.value })} />
                <select className="input" value={userForm.charity} onChange={(e) => setUserForm({ ...userForm, charity: e.target.value })}>
                  <option value="">No charity</option>
                  {charities.map((charity) => (
                    <option key={charity._id} value={charity._id}>{charity.name}</option>
                  ))}
                </select>
                <textarea className="input min-h-32" placeholder="Scores as value|YYYY-MM-DD, one per line" value={userForm.scoresText} onChange={(e) => setUserForm({ ...userForm, scoresText: e.target.value })} />
                <button className="btn btn-primary justify-center">Save user</button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="page-card p-6">
          <div className="badge">Charity management</div>
          <form onSubmit={saveCharity} className="mt-5 grid gap-3">
            <input className="input" placeholder="Name" value={charityForm.name} onChange={(e) => setCharityForm({ ...charityForm, name: e.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Category" value={charityForm.category} onChange={(e) => setCharityForm({ ...charityForm, category: e.target.value })} />
              <input className="input" placeholder="Location" value={charityForm.location} onChange={(e) => setCharityForm({ ...charityForm, location: e.target.value })} />
            </div>
            <input className="input" placeholder="Image URL" value={charityForm.image} onChange={(e) => setCharityForm({ ...charityForm, image: e.target.value })} />
            <input className="input" placeholder="Website" value={charityForm.website} onChange={(e) => setCharityForm({ ...charityForm, website: e.target.value })} />
            <textarea className="input min-h-28" placeholder="Short description" value={charityForm.shortDescription} onChange={(e) => setCharityForm({ ...charityForm, shortDescription: e.target.value })} />
            <textarea className="input min-h-32" placeholder="Full description" value={charityForm.description} onChange={(e) => setCharityForm({ ...charityForm, description: e.target.value })} />
            <label className="flex items-center gap-3 rounded-[1rem] border border-[color:var(--line)] px-4 py-3 text-sm soft-text">
              <input type="checkbox" checked={charityForm.featured} onChange={(e) => setCharityForm({ ...charityForm, featured: e.target.checked })} />
              Featured charity
            </label>
            <div className="flex gap-3">
              <button className="btn btn-primary">{editingCharityId ? 'Update charity' : 'Add charity'}</button>
              {editingCharityId ? <button type="button" onClick={() => { setEditingCharityId(''); setCharityForm(emptyCharityForm); }} className="btn btn-secondary">Cancel edit</button> : null}
            </div>
          </form>
          <div className="mt-6 space-y-3">
            {charities.map((charity) => (
              <div key={charity._id} className="flex items-center justify-between rounded-[1.2rem] border border-[color:var(--line)] px-4 py-4">
                <div>
                  <div className="heading-text">{charity.name}</div>
                  <div className="text-sm soft-text">{charity.category} | {charity.featured ? 'Featured' : 'Standard'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editCharity(charity)} className="btn btn-secondary px-4 py-2 text-sm">Edit</button>
                  <button onClick={() => removeCharity(charity._id)} className="btn border border-red-400/20 px-4 py-2 text-sm text-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-card p-6">
          <div className="badge">Winner verification</div>
          <div className="mt-5 space-y-4">
            {proofs.length ? proofs.map((proof) => (
              <div key={proof._id} className="rounded-[1.2rem] border border-[color:var(--line)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="heading-text">{proof.user?.name}</div>
                    <div className="text-sm soft-text">{proof.draw?.monthKey} | ${proof.amount.toFixed(2)}</div>
                  </div>
                  <div className="badge">{proof.verificationStatus}</div>
                </div>
                <div className="mt-2 text-sm soft-text">Payment: {proof.payoutStatus}</div>
                {proof.proofImage ? <a href={`${apiBaseUrl}${proof.proofImage}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-[color:var(--brand)]">Open uploaded proof</a> : <div className="mt-3 text-sm soft-text">No proof image uploaded yet.</div>}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => reviewProof(proof._id, 'approved', 'paid')} className="btn btn-primary px-4 py-2 text-sm">Approve + Pay</button>
                  <button onClick={() => reviewProof(proof._id, 'pending', 'pending')} className="btn btn-secondary px-4 py-2 text-sm">Keep pending</button>
                  <button onClick={() => reviewProof(proof._id, 'rejected', 'pending')} className="btn border border-red-400/20 px-4 py-2 text-sm text-red-100">Reject</button>
                </div>
              </div>
            )) : <div className="rounded-[1.2rem] border border-dashed border-[color:var(--line)] p-5 soft-text">Winner proofs will appear here when subscribers upload them.</div>}
          </div>
        </div>
      </section>
    </div>
  );
}


