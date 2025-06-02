'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransitionOverlay() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    const timeout = setTimeout(() => {
      setShow(false);
    }, 400); // match duration of animation

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="overlay"
          initial={{ opacity: 1, scale: 0.98 }}
          animate={{ opacity: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            // background: 'rgb(0,0,0)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
}
