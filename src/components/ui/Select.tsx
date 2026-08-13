import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, id, className = '', children, ...rest }, ref) => {
  const selectId = id || label;
  return (
    <div className="field">
      <label htmlFor={selectId}>{label}</label>
      <select id={selectId} ref={ref} className={`select ${className}`} aria-invalid={!!error} {...rest}>
        {children}
      </select>
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
