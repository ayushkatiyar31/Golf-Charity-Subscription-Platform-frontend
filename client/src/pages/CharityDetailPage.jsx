import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { charityService } from '../services';

const fallbackImage = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80';

export default function CharityDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    charityService.detail(slug).then(({ data: detail }) => setData(detail));
  }, [slug]);

  if (!data) {
    return <div className="soft-text">Loading charity profile...</div>;
  }

  const { charity, donations } = data;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
      <section className="glass overflow-hidden rounded-[2rem]">
        <img
          src={charity.image || fallbackImage}
          alt={charity.name}
          className="h-80 w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="p-8">
          <div className="badge">{charity.category}</div>
          <h1 className="mt-5 text-4xl font-semibold heading-text">{charity.name}</h1>
          <p className="mt-4 leading-8 soft-text">{charity.description}</p>
          <div className="mt-6 soft-text">{charity.location} | {charity.website}</div>
        </div>
      </section>
      <section className="page-card p-8">
        <div className="text-sm uppercase tracking-[0.2em] soft-text">Impact snapshot</div>
        <div className="mt-5 text-3xl font-semibold heading-text">{charity.impactMetric?.value}</div>
        <div className="mt-2 soft-text">{charity.impactMetric?.label}</div>
        <div className="mt-8 rounded-[1.5rem] border border-[color:var(--line)] p-5">
          <div className="text-sm soft-text">Platform donations</div>
          <div className="mt-2 text-3xl font-semibold text-[color:var(--brand)]">${(donations.total || 0).toFixed(2)}</div>
          <div className="mt-1 text-sm soft-text">Across {donations.count || 0} contribution records</div>
        </div>
      </section>
    </div>
  );
}
