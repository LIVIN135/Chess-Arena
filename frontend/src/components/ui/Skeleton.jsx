import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rect',
  ...props
}) => {
  const variantStyles = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    board: 'rounded-xl aspect-square',
    text: 'rounded h-4',
  };

  return (
    <div
      className={`animate-pulse bg-[#1F242C] ${variantStyles[variant] || variantStyles.rect} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
