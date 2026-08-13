import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  selected?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export default function Card({ hover = false, selected = false, disabled = false, className = '', children, ...rest }: CardProps) {
  const classes = [
    'card',
    hover ? 'card-hover' : '',
    selected ? 'card-selected' : '',
    disabled ? 'card-disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
