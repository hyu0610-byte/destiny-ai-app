import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, id, className = '', ...rest }, ref) => {
  const inputId = id || label;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        ref={ref}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && <p className="error-text" id={`${inputId}-error`} role="alert">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
