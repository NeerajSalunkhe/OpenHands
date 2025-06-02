'use client';

import { motion } from 'framer-motion';

export default function FadeInSection({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  );
}
