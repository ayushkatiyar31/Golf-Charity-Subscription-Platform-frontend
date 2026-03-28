import { motion } from 'framer-motion';

export const SectionTitle = ({ eyebrow, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="max-w-2xl"
  >
    {eyebrow ? <div className="badge mb-4">{eyebrow}</div> : null}
    <h2 className="text-3xl font-semibold heading-text sm:text-4xl">{title}</h2>
    {description ? <p className="mt-4 text-lg leading-8 soft-text">{description}</p> : null}
  </motion.div>
);
