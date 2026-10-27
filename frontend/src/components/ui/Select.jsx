import React from 'react';

export const Select = React.forwardRef(
  ({ label, error, helperText, options = [], className = '', id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-[#8B949E]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-lg bg-[#0E1116] border ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-[#21262D] focus:border-[#7FB069] focus:ring-[#7FB069]/20'
          } px-3.5 py-2 text-sm text-[#F0F6FC] transition-colors duration-150 focus:outline-none focus:ring-2 ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#161B22] text-[#F0F6FC]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p className="text-xs text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#8B949E]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
