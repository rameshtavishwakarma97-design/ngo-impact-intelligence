import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastItem {
  id: string;
  title: string;
  desc?: string;
  type?: 'success' | 'alert' | 'info';
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss?: (id: string) => void;
}

export const SonnerToast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-auto sm:w-full pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.16 } }}
            transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.22 }}
            onClick={() => onDismiss?.(toast.id)}
            className="pointer-events-auto flex items-start gap-3 bg-[#FCFBF8] border border-[#E5DFD3] p-4 rounded-2xl shadow-xl backdrop-blur-md cursor-pointer select-none"
          >
            {/* 180ms SVG Animated Checkmark or Alert (Botanical Moss) */}
            <div className="mt-0.5 w-5 h-5 rounded-full bg-[#E8F3EC] text-[#2E6B4E] flex items-center justify-center flex-shrink-0">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M4 12l5 5L20 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1C1917] tracking-tight">{toast.title}</p>
              {toast.desc && (
                <p className="text-[11px] text-[#6B655C] leading-relaxed mt-0.5">{toast.desc}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
