import React, { FC, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

/**
 * Large, thumb-friendly button component
 * Designed for mobile-first interaction
 */
export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-neon-green text-bg-primary font-bold shadow-neon-glow hover:shadow-lg',
    secondary: 'bg-bg-secondary border border-bg-tertiary text-white hover:bg-bg-tertiary',
    danger: 'bg-neon-pink text-white font-bold hover:shadow-neon-pink',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-bg-primary',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl',
    xl: 'px-8 py-5 text-xl rounded-2xl font-bold',
  };

  return (
    <button
      className={clsx(
        'transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="animate-spin">⏳</span>}
      {icon && !isLoading && icon}
      {children}
    </button>
  );
};

/**
 * Large status toggle button (Free Now, Free Tonight, etc)
 */
interface StatusToggleButtonProps extends ButtonProps {
  label: string;
  emoji: string;
  isActive?: boolean;
}

export const StatusToggleButton: FC<StatusToggleButtonProps> = ({
  label,
  emoji,
  isActive = false,
  ...props
}) => {
  return (
    <Button
      variant={isActive ? 'primary' : 'secondary'}
      size="xl"
      fullWidth
      className={clsx(
        'mb-4 flex-col h-auto py-6',
        isActive && 'animate-pulse-glow'
      )}
      {...props}
    >
      <span className="text-4xl mb-2">{emoji}</span>
      <span className="text-lg">{label}</span>
    </Button>
  );
};
