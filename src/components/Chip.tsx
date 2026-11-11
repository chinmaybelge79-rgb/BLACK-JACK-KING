'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { CHIP_VALUES } from '../types/game';

interface ChipProps {
  value: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  flying?: boolean;
  flyTarget?: { x: number; y: number };
  stackIndex?: number;
  stackTotal?: number;
}

const sizeConfig = {
  small: { size: 36, fontSize: 10, ringSize: 28, innerRingSize: 20, edgeStripeWidth: 3 },
  medium: { size: 56, fontSize: 13, ringSize: 44, innerRingSize: 32, edgeStripeWidth: 4 },
  large: { size: 72, fontSize: 16, ringSize: 56, innerRingSize: 42, edgeStripeWidth: 5 },
};

const CHIP_COLORS: Record<number, { 
  primary: string; 
  secondary: string; 
  text: string; 
  edgeStripe: string;
  edgeStripeAlt: string;
  shadow: string;
}> = {
  1: { 
    primary: '#FAFAFA', 
    secondary: '#F4F4F6', 
    text: '#0F172A', 
    edgeStripe: '#0F172A',
    edgeStripeAlt: '#64748B',
    shadow: 'rgba(15, 23, 42, 0.25)' 
  },
  5: { 
    primary: '#E11D48', 
    secondary: '#BE123C', 
    text: '#FFFFFF', 
    edgeStripe: '#FFFFFF',
    edgeStripeAlt: '#FECACA',
    shadow: 'rgba(225, 29, 72, 0.4)' 
  },
  25: { 
    primary: '#059669', 
    secondary: '#047857', 
    text: '#FFFFFF', 
    edgeStripe: '#FFFFFF',
    edgeStripeAlt: '#A7F3D0',
    shadow: 'rgba(5, 150, 105, 0.4)' 
  },
  100: { 
    primary: '#0F172A', 
    secondary: '#1E293B', 
    text: '#FBBF24', 
    edgeStripe: '#FBBF24',
    edgeStripeAlt: '#FEF08A',
    shadow: 'rgba(15, 23, 42, 0.5)' 
  },
  500: { 
    primary: '#7C2D12', 
    secondary: '#9A3412', 
    text: '#FFFFFF', 
    edgeStripe: '#FFFFFF',
    edgeStripeAlt: '#FECACA',
    shadow: 'rgba(124, 45, 18, 0.4)' 
  },
  1000: { 
    primary: '#FBBF24', 
    secondary: '#F59E0B', 
    text: '#0F172A', 
    edgeStripe: '#0F172A',
    edgeStripeAlt: '#78350F',
    shadow: 'rgba(251, 191, 36, 0.4)' 
  },
};

function formatChipValue(val: number): string {
  if (val >= 1000) return `${val / 1000}K`;
  return `$${val}`;
}

export function Chip({ 
  value, 
  selected = false, 
  disabled = false, 
  onClick, 
  size = 'medium',
  className,
  flying = false,
  flyTarget,
  stackIndex = 0,
  stackTotal = 1,
}: ChipProps) {
  const config = sizeConfig[size];
  const colors = CHIP_COLORS[value] || CHIP_COLORS[1];
  
  const stackOffset = stackTotal > 1 ? {
    x: (Math.random() - 0.5) * 4,
    y: -stackIndex * (config.size * 0.15),
    rotate: (Math.random() - 0.5) * 3,
  } : { x: 0, y: 0, rotate: 0 };

  const chipStyle: React.CSSProperties = {
    width: config.size,
    height: config.size,
    borderRadius: '50%',
    background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    boxShadow: `
      0 ${config.size * 0.08}px ${config.size * 0.15}px ${colors.shadow},
      0 ${config.size * 0.04}px ${config.size * 0.08}px ${colors.shadow},
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1),
      ${selected ? `0 0 0 3px ${colors.edgeStripe}60, 0 0 20px ${colors.shadow}80` : ''}
    `.replace(/\s+/g, ' ').trim(),
    transform: `translate(${stackOffset.x}px, ${stackOffset.y}px) rotate(${stackOffset.rotate}deg)`,
    zIndex: stackTotal - stackIndex,
  };

  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  if (flying && flyTarget) {
    return (
      <AnimatePresence>
        <motion.div
          className={cn('fixed pointer-events-none z-50', className)}
          style={chipStyle}
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
            scale: 0.6, 
            opacity: 0,
            rotate: 360 
          }}
          transition={{ 
            duration: 0.55, 
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="font-mono font-bold" style={{ 
            fontSize: config.fontSize, 
            color: colors.text,
            lineHeight: 1,
          }}>
            {formatChipValue(value)}
          </span>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.button
      className={cn(
        'relative flex items-center justify-center rounded-full',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        selected && 'ring-2 ring-emerald-500/60 ring-offset-2 ring-offset-slate-950 scale-[1.05]',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      whileHover={{ 
        scale: disabled ? 1 : 1.08,
        y: disabled ? 0 : -3,
        boxShadow: `
          0 ${config.size * 0.12}px ${config.size * 0.25}px ${colors.shadow},
          0 0 30px ${colors.shadow}60,
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.15)
        `.replace(/\s+/g, ' ').trim(),
      }}
      style={chipStyle}
      aria-label={`Bet ${formatChipValue(value)}`}
      aria-pressed={selected}
    >
      {/* Edge stripes - classic casino chip detail */}
      <div className="absolute inset-0 rounded-full" style={{
        background: `repeating-conic-gradient(
          ${colors.edgeStripe} 0deg,
          ${colors.edgeStripe} 8deg,
          transparent 8deg,
          transparent 16deg,
          ${colors.edgeStripeAlt} 16deg,
          ${colors.edgeStripeAlt} 24deg,
          transparent 24deg,
          transparent 32deg
        )`,
        maskImage: `radial-gradient(circle at center, transparent 65%, black 66%)`,
        WebkitMaskImage: `radial-gradient(circle at center, transparent 65%, black 66%)`,
        opacity: 0.6,
        pointerEvents: 'none',
      }} />

      {/* Inner bevel highlight */}
      <div className="absolute inset-1 rounded-full pointer-events-none" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
        opacity: 0.8,
      }} />

      {/* Center value */}
      <span className="relative z-10 font-mono font-bold select-none" style={{ 
        fontSize: config.fontSize, 
        color: colors.text,
        lineHeight: 1,
        textShadow: value === 1 || value === 1000 ? '0 1px 2px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.3)',
      }}>
        {formatChipValue(value)}
      </span>

      {/* Inner ring */}
      <div className="absolute rounded-full border" style={{
        width: config.innerRingSize,
        height: config.innerRingSize,
        borderColor: `${colors.edgeStripe}30`,
        pointerEvents: 'none',
      }} />

      {/* Selected glow ring */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            boxShadow: `0 0 0 2px ${colors.edgeStripe}, 0 0 20px ${colors.shadow}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Subtle shine sweep on hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0, x: '-100%' }}
        whileHover={{ opacity: 0.15, x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          pointerEvents: 'none',
        }}
      />
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
      {chips.map((value, index) => (
        <Chip
          key={value}
          value={value}
          selected={selectedValue === value}
          disabled={disabled}
          onClick={() => onSelect(value)}
          size={size}
          stackIndex={index}
          stackTotal={chips.length}
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
      className="flex items-baseline gap-2"
      initial={animated ? { opacity: 0, y: 10 } : undefined}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="text-slate-500 text-xs font-semibold tracking-wider uppercase">
        TOTAL BET
      </span>
      <motion.span
        className={cn(
          'font-mono font-bold tabular-nums text-slate-50',
          size === 'small' ? 'text-xl' : size === 'medium' ? 'text-3xl' : 'text-4xl'
        )}
        animate={{ 
          textShadow: [
            '0 0 0 transparent',
            '0 0 20px rgba(16, 185, 129, 0.6)',
            '0 0 0 transparent',
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {formatCurrency(amount)}
      </motion.span>
    </motion.div>
  );
}

export function BettingCircle({ 
  chips = [], 
  totalBet = 0,
  className,
}: { 
  chips?: Array<{ value: number; x: number; y: number; rotation: number }>;
  totalBet?: number;
  className?: string;
}) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer betting circle ring */}
      <div className="absolute inset-0 rounded-full border-2 border-dashed" style={{
        borderColor: 'rgba(16, 185, 129, 0.3)',
        background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
        animation: 'pulse-ring 3s ease-in-out infinite',
      }} />
      
      {/* Inner betting circle */}
      <div className="absolute inset-4 rounded-full border" style={{
        borderColor: 'rgba(16, 185, 129, 0.15)',
        background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
      }} />
      
      {/* Center text when empty */}
      {chips.length === 0 && totalBet === 0 && (
        <div className="relative z-10 text-center">
          <span className="text-slate-600 text-xs font-medium uppercase tracking-wider">PLACE BETS</span>
          <div className="text-slate-500 text-xs mt-1">Click chips to bet</div>
        </div>
      )}
      
      {/* Stacked chips */}
      <div className="relative z-10 flex flex-col items-center gap-0">
        {chips.map((chip, index) => (
          <Chip
            key={`${chip.value}-${index}`}
            value={chip.value}
            size="medium"
            style={{
              transform: `translate(${chip.x}px, ${chip.y}px) rotate(${chip.rotation}deg)`,
              zIndex: chips.length - index,
            }}
          />
        ))}
      </div>
      
      {totalBet > 0 && (
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-slate-400 text-xs uppercase tracking-wider">TOTAL</span>
          <div className="font-mono font-bold text-emerald-400 text-sm">
            ${totalBet.toLocaleString()}
          </div>
        </motion.div>
      )}
    </div>
  );
}