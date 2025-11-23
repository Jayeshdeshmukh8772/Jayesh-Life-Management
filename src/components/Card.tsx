import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      className={`
        bg-white/10 backdrop-blur-md rounded-2xl p-6
        border border-white/20 shadow-xl
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
