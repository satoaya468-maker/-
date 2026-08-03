import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
}

/** Тихое появление блока при входе в вьюпорт: только opacity и translateY. */
export function Reveal({ children, className, delay = 0, y = 14, amount = 0.2 }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.65, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

export const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  amount?: number;
}

/** Контейнер со стаггером для однородных списков; элементы оборачивать в <RevealItem>. */
export function RevealGroup({ children, className, amount = 0.15 }: RevealGroupProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : groupVariants}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount, margin: '0px 0px -40px 0px' }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? undefined : itemVariants}>
      {children}
    </motion.div>
  );
}
