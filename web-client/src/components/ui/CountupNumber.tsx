import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CountupNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatFunction?: (value: number) => string;
}

const CountupNumber: React.FC<CountupNumberProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  className = '',
  prefix = '',
  suffix = '',
  formatFunction,
}) => {
  // const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { duration });
  const display = useTransform(spring, latest => {
    if (formatFunction) {
      return formatFunction(latest);
    }

    if (decimals > 0) {
      return latest.toFixed(decimals);
    }

    // 格式化大数字
    if (latest >= 1000000) {
      return (latest / 1000000).toFixed(1) + 'M';
    } else if (latest >= 1000) {
      return (latest / 1000).toFixed(1) + 'K';
    }

    return Math.round(latest).toLocaleString();
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  // useEffect(() => {
  //   const unsubscribe = display.onChange((latest) => {
  //     setDisplayValue(parseFloat(latest.replace(/[^0-9.-]/g, '')) || 0);
  //   });

  //   return () => unsubscribe();
  // }, [display]);

  return (
    <motion.span
      className={`tabular-nums ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
};

export default CountupNumber;
