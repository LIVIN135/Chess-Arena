import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    success: 'bg-[#7FB069]/15 text-[#7FB069] border-[#7FB069]/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    live: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    neutral: 'bg-[#1F242C] text-[#8B949E] border-[#21262D]',
  };

  const dotColors = {
    success: 'bg-[#7FB069]',
    warning: 'bg-amber-400',
    info: 'bg-sky-400',
    danger: 'bg-rose-400',
    live: 'bg-emerald-400',
    neutral: 'bg-[#8B949E]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${dotColors[variant] || 'bg-gray-400'}`} />}
      {children}
    </span>
  );
};

export default Badge;
