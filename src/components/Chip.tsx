'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { CHIP_COLORS, CHIP_TEXT_COLORS } from '../types/game';

interface ChipProps {
  value: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  flying?: boolean;
  flyTarget?: { x: number; y: number };
}

const sizeClasses = {
  small: 'w-10 h-10 text-xs',
  medium: 'w-14 h-14 text-sm',
  large: 'w-16 h-16 text-base',
};

const ringSizes = {
  small: 'w-8 h-8',
  medium: 'w-11 h-11',
  large: 'w-13 h-13',
};

const innerRingSizes = {
  small: 'w-6 h-6',
  medium: 'w-8 h-8',
  large: 'w-10 h-10',
};

export function Chip({ 
  value, 
  selected = false, 
  disabled = false, 
  onClick, 
  size = 'medium',
  className,
  flying = false,
  flyTarget,
}: ChipProps) {
  const color = CHIP_COLORS[value] || '#ffffff';
  const textColor = CHIP_TEXT_COLORS[value] || '#06060a';
  
  const formatValue = (val: number) => {
    if (val >= 1000) return `$${val / 1000}K`;
    return `$${val}`;
  };

  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  const chipStyle = {
    backgroundColor: color,
    boxShadow: selected 
      ? `0 0 30px ${color}80, 0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)`
      : `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)`,
  } as React.CSSProperties;

  if (flying && flyTarget) {
    return (
      <AnimatePresence>
        <motion.div
          className={cn('fixed pointer-events-none z-50', sizeClasses[size], 'rounded-full flex items-center justify-center', className)}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 1, 
            opacity: 1,
            rotate: 0 
          }}
          animate={{ 
            x: flyTarget.x, 
            y: flyTarget.y, 
            scale: 0.5, 
            opacity: 0,
            rotate: 180 
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
          }}
          style={chipStyle}
        >
          <span className={cn('font-mono font-bold', `text-[${textColor}]`)}>{formatValue(value)}</span>
          <div className={cn('absolute rounded-full border border-white/30', ringSizes[size])} />
          <div className={cn('absolute rounded-full border border-black/10', innerRingSizes[size])} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.button
      className={cn(
        sizeClasses[size],
        'relative rounded-full flex items-center justify-center',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-polymarket-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-polymarket-bg',
        disabled && 'opacity-50 cursor-not-allowed',
        selected && 'ring-2 ring-polymarket-primary ring-offset-2 ring-offset-polymarket-bg scale-105',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      whileHover={{ 
        scale: disabled ? 1 : 1.08,
        y: disabled ? 0 : -2,
        boxShadow: `0 12px 40px ${color}60, 0 0 40px ${color}40`,
      }}
      style={chipStyle}
      aria-label={`Bet ${formatValue(value)}`}
      aria-pressed={selected}
    >
      <span className={cn('font-mono font-bold relative z-10', `text-[${textColor}]`)}>{formatValue(value)}</span>
      
      {/* Outer ring */}
      <div className={cn('absolute rounded-full border border-white/30', ringSizes[size])} />
      
      {/* Inner ring */}
      <div className={cn('absolute rounded-full border border-black/10', innerRingSizes[size])} />
      
      {/* Selected indicator */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-polymarket-primary"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      )}
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
    </motion.button>
  );
}

export function ChipStack({ 
  chips, 
  selectedValue,
  onSelect,
  disabled = false,
  size = 'medium',
  horizontal = true,
}: { 
  chips: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  horizontal?: boolean;
}) {
  return (
    <div className={cn(
      horizontal ? 'flex items-center gap-2 flex-wrap justify-center' : 'flex flex-col items-center gap-2',
      'w-full'
    )}>
      {chips.map(value => (
        <Chip
          key={value}
          value={value}
          selected={selectedValue === value}
          disabled={disabled}
          onClick={() => onSelect(value)}
          size={size}
        />
      ))}
    </div>
  );
}

export function BetDisplay({ 
  amount, 
  size = 'large',
  animated = true,
}: { 
  amount: number;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}) {
  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <motion.div
      className="flex items-baseline gap-1"
      initial={animated ? { opacity: 0, y: 10 } : undefined}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="text-polymarket-textMuted text-xs font-medium tracking-wider uppercase">
        BET
      </span>
      <motion.span
        className={cn(
          'font-mono font-bold tabular-nums text-polymarket-text',
          size === 'small' ? 'text-xl' : size === 'medium' ? 'text-3xl' : 'text-4xl'
        )}
        animate={{ 
          textShadow: [
            '0 0 0 transparent',
            '0 0 20px rgba(0, 212, 170, 0.5)',
            '0 0 0 transparent',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {formatCurrency(amount)}
      </motion.span>
    </motion.div>
  );
}