import React from 'react';
import Button from './Button';

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-[#21262D] bg-[#161B22]/50 ${className}`}>
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F242C] text-[#7FB069] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#F0F6FC]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[#8B949E] max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
