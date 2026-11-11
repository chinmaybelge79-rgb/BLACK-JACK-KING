'use client';

import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-polymarket-primary to-[#00b894] text-polymarket-textInverse hover:from-[#00e8bb] hover:to-[#00d4aa] hover:shadow-glow-primary active:scale-[0.98]',
  secondary: 'bg-polymarket-bgTeritary border border-polymarket-border text-polymarket-text hover:bg-polymarket-border hover:border-polymarket-borderHover active:scale-[0.98]',
  danger: 'bg-gradient-to-r from-polymarket-danger to-[#dc2626] text-white hover:from-[#f87171] hover:to-[#ef4444] hover:shadow-glow-danger active:scale-[0.98]',
  success: 'bg-gradient-to-r from-polymarket-success to-[#16a34a] text-white hover:from-[#4ade80] hover:to-[#22c55e] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] active:scale-[0.98]',
  ghost: 'bg-transparent text-polymarket-textMuted hover:text-polymarket-text hover:bg-polymarket-bgTeritary active:scale-[0.98]',
  outline: 'bg-transparent border border-polymarket-border text-polymarket-text hover:border-polymarket-primary hover:text-polymarket-primary hover:bg-polymarket-primaryDim active:scale-[0.98]',
};

const sizeStyles = {
  small: 'px-4 py-2 text-xs gap-1.5',
  medium: 'px-6 py-3 text-sm gap-2',
  large: 'px-8 py-4 text-base gap-2',
};

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-polymarket-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-polymarket-bg',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none',
        'active:scale-[0.97]',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span className="relative z-10 whitespace-nowrap">{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
      
      {/* Shine overlay */}
      {!loading && !isDisabled && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </button>
  );
}

interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'fullWidth'> {
  'aria-label': string;
}

export function IconButton({ 
  variant = 'ghost', 
  size = 'medium', 
  loading = false, 
  disabled,
  className,
  children,
  'aria-label': ariaLabel,
  onClick,
  ...props
}: IconButtonProps) {
  const sizeMap = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-polymarket-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-polymarket-bg',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'active:scale-90',
        variantStyles[variant],
        sizeMap[size],
        className
      )}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </button>
  );
}

export function ActionButton({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false,
  loading = false,
  shortcut,
  className,
}: { 
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  shortcut?: string;
  className?: string;
}) {
  return (
    <Button
      variant={variant}
      size="large"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className={cn('min-w-[140px]', className)}
      rightIcon={shortcut && (
        <span className="text-xs text-current/70 font-mono px-2 py-0.5 rounded bg-black/20">
          {shortcut}
        </span>
      )}
    >
      {label}
    </Button>
  );
}