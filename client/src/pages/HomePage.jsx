import { motion } from 'framer-motion';
import { ArrowRight, CircleDollarSign, HeartHandshake, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { charityService, userService } from '../services';
import { SectionTitle } from '../components/SectionTitle';
import { StatCard } from '../components/StatCard';

const featureCards = [
  {
    icon: HeartHandshake,
    title: 'Free account, real purpose',
    text: 'Create an account for free, explore charities, manage your scores, and decide later if you want paid subscription perks.'
  },
  {
    icon: Trophy,
    title: 'Optional paid participation',
    text: 'Subscription is a paid upgrade inside your dashboard when you want draw eligibility and contribution automation.'
  },
  {
    icon: CircleDollarSign,
    title: 'Transparent charity-first flow',
    text: 'Donations, subscriptions, winnings, rollover logic, and proof verification stay visible and easy to understand.'
  }
];

export default function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [draws, setDraws] = useState([]);

  useEffect(() => {
    charityService.featured().then(({ data }) => setFeatured(data)).catch(() => {});
    userService.draws().then(({ data }) => setDraws(data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-12">
      <section className="relative overflow-hidden page-card px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,240,194,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,200,87,0.16),transparent_30%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="badge mb-5">Free sign up, paid subscription later</div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight heading-text sm:text-5xl lg:text-6xl">
              Play with purpose. Join for free. Upgrade to a paid plan when you want deeper impact.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 soft-text">
              Golf Charity Subscription Platform starts with a free account experience, then offers a paid subscription upgrade for draw participation and automated charity giving.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn btn-primary">
                Sign Up <ArrowRight size={18} />
              </Link>
              <Link to="/charities" className="btn btn-secondary">
                Explore Charities
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="glass shimmer rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] soft-text">Featured Impact</div>
                <div className="mt-2 text-2xl font-semibold heading-text">{featured?.name || 'Loading featured charity'}</div>
              </div>
              <Sparkles className="text-[color:var(--brand)]" />
            </div>
            <p className="mt-5 soft-text">{featured?.shortDescription || 'Bringing your membership contribution into visible, community-led action.'}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <StatCard label="Free signup" value="Enabled" tone="emerald" />
              <StatCard label="Subscription" value="Paid" tone="amber" />
              <StatCard label="Scores stored" value="Last 5" tone="blue" />
              <StatCard label="Rollover enabled" value="5-match" tone="rose" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {featureCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="glass card-hover rounded-[1.8rem] p-6"
          >
            <card.icon className="text-[color:var(--brand)]" />
            <h3 className="mt-5 text-xl font-semibold heading-text">{card.title}</h3>
            <p className="mt-3 leading-7 soft-text">{card.text}</p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionTitle
          eyebrow="How it works"
          title="A calmer, more flexible path into the platform"
          description="Start with a free account, track your score history, support charities, and subscribe later if you want paid monthly draw eligibility and automated contributions."
        />
        <div className="grid gap-5 sm:grid-cols-3">
          {['Sign up free', 'Track scores', 'Buy subscription'].map((step, index) => (
            <div key={step} className="glass card-hover rounded-[1.5rem] p-5">
              <div className="text-sm text-[color:var(--brand)]">0{index + 1}</div>
              <div className="mt-3 text-xl font-semibold heading-text">{step}</div>
              <p className="mt-3 text-sm leading-7 soft-text">
                {index === 0 && 'Create your account without paying, then pick a charity immediately or come back to it later.'}
                {index === 1 && 'Add scores from 1 to 45 with dates. The app automatically keeps your latest five entries.'}
                {index === 2 && 'Subscription lives inside your dashboard as a paid upgrade for draw participation and premium support.'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="glass rounded-[1.8rem] p-6">
          <SectionTitle
            eyebrow="Why it feels better"
            title="Less pressure, more clarity, stronger impact"
            description="The experience is designed to reduce friction. People can explore, participate, and then choose the paid subscription when the value feels clear."
          />
        </div>
        <div className="glass rounded-[1.8rem] p-6">
          <div className="text-sm uppercase tracking-[0.2em] soft-text">Recent draws</div>
          <div className="mt-5 space-y-4">
            {draws.length ? (
              draws.map((draw) => (
                <div key={draw._id} className="rounded-[1.2rem] border border-[color:var(--line)] p-4">
                  <div className="flex items-center justify-between">
                    <div className="heading-text">{draw.monthKey}</div>
                    <div className="badge">{draw.logic}</div>
                  </div>
                  <div className="mt-3 soft-text">Winning numbers: {draw.winningNumbers.join(', ')}</div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-[color:var(--line)] p-5 soft-text">Published draws will appear here.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
