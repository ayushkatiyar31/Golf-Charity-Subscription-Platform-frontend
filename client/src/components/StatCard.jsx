import { motion } from 'framer-motion';

export const StatCard = ({ label, value, tone = 'emerald' }) => {
  const toneClass = {
    emerald: 'from-emerald-300/18 to-cyan-300/8',
    amber: 'from-amber-300/18 to-orange-300/8',
    rose: 'from-rose-300/18 to-red-300/8',
    blue: 'from-sky-300/18 to-indigo-300/8'
  }[tone];

  return (
    <motion.div whileHover={{ y: -4 }} className={`glass rounded-[1.6rem] bg-gradient-to-br p-5 ${toneClass}`}>
      <div className="text-sm uppercase tracking-[0.2em] soft-text">{label}</div>
      <div className="mt-3 text-3xl font-semibold heading-text">{value}</div>
    </motion.div>
  );
};
