import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // default 240ms
  formatter?: (val: number) => string;
  className?: string;
}

/**
 * AnimatedNumber
 * Emil Kowalski & Jakub Krehel craft standards:
 * - Tabular figures [font-variant-numeric:tabular-nums]
 * - 240ms fast ease-out interpolation (cubic-bezier(0.32, 0.72, 0, 1))
 * - Prevents layout shifts with tabular nums
 * - Smooth interruptible transition when value changes rapidly (e.g. slider drag)
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 240,
  formatter,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const startValRef = useRef<number>(value);
  const targetValRef = useRef<number>(value);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    startValRef.current = displayValue;
    targetValRef.current = value;
    startTimeRef.current = performance.now();

    // Apple/Emil drawer curve: cubic-bezier(0.32, 0.72, 0, 1) approximation
    const easeOutCubic = (t: number): number => {
      // standard cubic ease-out
      return 1 - Math.pow(1 - t, 3);
    };

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      const current = startValRef.current + (targetValRef.current - startValRef.current) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(targetValRef.current);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = formatter
    ? formatter(displayValue)
    : decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString('en-IN');

  return (
    <span className={`inline-block tabular-nums [font-variant-numeric:tabular-nums] ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
