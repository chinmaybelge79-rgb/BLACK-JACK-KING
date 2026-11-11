'use client';

import { motion } from 'framer-motion';
import { CHIP_DENOMINATIONS, CHIP_COLORS, formatChipValue } from '../lib/chips';

interface ChipButtonProps {
  value: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium';
  'data-chip-value'?: number;
}

const sizeConfig = {
  small: { size: 40, fontSize: 11, textOffset: 0 },
  medium: { size: 52, fontSize: 13, textOffset: 0 },
};

export function ChipButton({ 
  value, 
  selected = false, 
  disabled = false, 
  onClick, 
  size = 'medium',
  'data-chip-value': dataChipValue,
}: ChipButtonProps) {
  const config = sizeConfig[size];
  const colors = CHIP_COLORS[value as keyof typeof CHIP_COLORS] || CHIP_COLORS[1];
  
  const chipStyle: React.CSSProperties = {
    width: config.size,
    height: config.size,
    borderRadius: '50%',
    background: colors.bg,
    boxShadow: `
      0 2px 8px ${colors.bg}40,
      0 1px 3px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1),
      ${selected ? `0 0 0 2px ${colors.ring}, 0 0 16px ${colors.bg}60` : ''}
    `.replace(/\s+/g, ' ').trim(),
    border: selected ? '2px solid transparent' : `1px solid ${colors.ring}`,
  };

  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  return (
    <motion.button
      className="relative flex items-center justify-center rounded-full transition-all duration-150"
      style={chipStyle}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        y: disabled ? 0 : -2,
        boxShadow: `
          0 6px 20px ${colors.bg}50,
          0 2px 8px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.15)
        `.replace(/\s+/g, ' ').trim(),
      }}
      data-chip-value={dataChipValue ?? value}
      aria-label={`Bet ${formatChipValue(value)}`}
      aria-pressed={selected}
    >
      <span className="relative z-10 font-mono font-bold select-none" style={{ 
        fontSize: config.fontSize, 
        color: colors.text,
        lineHeight: 1,
      }}>
        {formatChipValue(value)}
      </span>
      
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            boxShadow: `0 0 0 2px ${colors.ring}, 0 0 16px ${colors.bg}40`,
            pointerEvents: 'none',
          }}
        />
      )}

      <div className="absolute inset-1 rounded-full pointer-events-none" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
        opacity: 0.8,
      }} />
    </motion.button>
  );
}

interface ChipTrayProps {
  selectedValue: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export function ChipTray({ 
  selectedValue, 
  onSelect, 
  disabled = false,
  size = 'medium',
}: ChipTrayProps) {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap" role="group" aria-label="Chip denominations">
      {CHIP_DENOMINATIONS.map(value => (
        <ChipButton
          key={value}
          value={value}
          selected={selectedValue === value}
          disabled={disabled}
          onClick={() => onSelect(value)}
          size={size}
          data-chip-value={value}
        />
      ))}
    </div>
  );
}

interface BetStackProps {
  amount: number;
  size?: 'small' | 'medium';
  maxChips?: number;
}

export function BetStack({ 
  amount, 
  size = 'medium', 
  maxChips = 8,
}: BetStackProps) {
  const chips = CHIP_DENOMINATIONS.flatMap(denom => {
    const count = Math.floor(amount / denom);
    return Array(count).fill(denom);
  }).slice(0, maxChips);

  if (chips.length === 0) {
    return (
      <div className="flex items-center justify-center gap-1" style={{ minWidth: '60px' }}>
        <span className="text-slate-500 text-xs font-mono">No bet</span>
      </div>
    );
  }

  const config = { small: 32, medium: 44 }[size];
  const offset = config * 0.22;

  return (
    <div className="flex items-center justify-center gap-0" style={{ 
      minWidth: chips.length > 0 ? `${config + (chips.length - 1) * offset}px` : 'auto' 
    }}>
      {chips.map((chipValue, index) => {
        const colors = CHIP_COLORS[chipValue as keyof typeof CHIP_COLORS] || CHIP_COLORS[1];
        return (
          <div
            key={`${chipValue}-${index}`}
            className="flex items-center justify-center rounded-full"
            style={{
              width: config,
              height: config,
              borderRadius: '50%',
              background: colors.bg,
              boxShadow: `
                0 2px 8px ${colors.bg}40,
                0 1px 3px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `.replace(/\s+/g, ' ').trim(),
              border: `1px solid ${colors.ring}`,
              zIndex: chips.length - index,
              transform: `translateX(-${index * offset}px)`,
            }}
          >
            <span className="font-mono font-bold select-none" style={{ 
              fontSize: size === 'small' ? '9px' : '11px', 
              color: colors.text,
              lineHeight: 1,
            }}>
              {formatChipValue(chipValue)}
            </span>
          </div>
        );
      })}
      {chips.length >= maxChips && (
        <div className="flex items-center justify-center rounded-full" style={{
          width: config,
          height: config,
          borderRadius: '50%',
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 0,
        }}>
          <span className="text-slate-400 font-mono font-semibold" style={{
            fontSize: size === 'small' ? '9px' : '11px',
          }}>
            +{chips.length - maxChips + 1}+
          </span>
        </div>
      )}
    </div>
  );
}