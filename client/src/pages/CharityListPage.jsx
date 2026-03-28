import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { charityService } from '../services';

const fallbackImage = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80';

export default function CharityListPage() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    charityService.list({ search }).then(({ data }) => setCharities(data));
  }, [search]);

  return (
    <div className="space-y-8">
      <section className="page-card p-6">
        <div className="badge">Charities</div>
        <h1 className="mt-5 text-4xl font-semibold heading-text">Choose where your support can flow, now or later</h1>
        <p className="mt-4 soft-text">You do not need a subscription to browse charities or pick one during your free account setup.</p>
        <input className="input mt-6 max-w-xl" placeholder="Search charities" value={search} onChange={(e) => setSearch(e.target.value)} />
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {charities.map((charity) => (
          <Link key={charity._id} to={`/charities/${charity.slug}`} className="glass card-hover overflow-hidden rounded-[1.8rem]">
            <img
              src={charity.image || fallbackImage}
              alt={charity.name}
              className="h-52 w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />
            <div className="p-6">
              <div className="badge">{charity.category}</div>
              <h2 className="mt-4 text-2xl font-semibold heading-text">{charity.name}</h2>
              <p className="mt-3 soft-text">{charity.shortDescription}</p>
              <div className="mt-5 text-sm text-[color:var(--brand)]">{charity.impactMetric?.label}: {charity.impactMetric?.value}</div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
