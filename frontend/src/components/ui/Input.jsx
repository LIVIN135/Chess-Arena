import React from 'react';

export const Input = React.forwardRef(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#8B949E]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg bg-[#0E1116] border ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-[#21262D] focus:border-[#7FB069] focus:ring-[#7FB069]/20'
          } px-3.5 py-2 text-sm text-[#F0F6FC] placeholder-[#484F58] transition-colors duration-150 focus:outline-none focus:ring-2 ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#8B949E]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
