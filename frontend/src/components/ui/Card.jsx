import React from 'react';

export const Card = ({
  children,
  elevated = false,
  hoverLift = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border border-[#21262D] ${
        elevated ? 'bg-[#1F242C]' : 'bg-[#161B22]'
      } p-5 shadow-sm transition-all duration-150 ${
        hoverLift ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-[#30363D]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
