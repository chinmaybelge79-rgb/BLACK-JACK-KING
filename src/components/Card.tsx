'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import type { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
  faceUp?: boolean;
  animated?: boolean;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const sizeClasses = {
  small: 'w-[56px] h-[78px] rounded-lg',
  medium: 'w-[80px] h-[112px] rounded-xl',
  large: 'w-[100px] h-[140px] rounded-2xl',
};

const suitSymbols: Record<string, string> = {
  '♠': '♠',
  '♥': '♥',
  '♦': '♦',
  '♣': '♣',
};

const suitColors: Record<string, string> = {
  '♠': '#000000',
  '♣': '#000000',
  '♥': '#dc2626',
  '♦': '#dc2626',
};

function getSuitPattern(suit: string, size: 'small' | 'medium' | 'large') {
  const patterns: Record<string, Record<string, React.ReactNode>> = {
    '♠': {
      small: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 8 6 8 10c0 3.5 2.5 7 4 8.5.7.7 1.5 1 2.5 1s1.8-.3 2.5-1C13.5 17 16 13.5 16 10c0-4-4-8-4-8z"/></svg>,
      medium: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 8 6 8 10c0 3.5 2.5 7 4 8.5.7.7 1.5 1 2.5 1s1.8-.3 2.5-1C13.5 17 16 13.5 16 10c0-4-4-8-4-8z"/></svg>,
      large: <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 8 6 8 10c0 3.5 2.5 7 4 8.5.7.7 1.5 1 2.5 1s1.8-.3 2.5-1C13.5 17 16 13.5 16 10c0-4-4-8-4-8z"/></svg>,
    },
    '♥': {
      small: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
      medium: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
      large: <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
    },
    '♦': {
      small: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
      medium: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
      large: <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
    },
    '♣': {
      small: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm8 0c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z"/></svg>,
      medium: <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm8 0c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z"/></svg>,
      large: <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm8 0c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z"/></svg>,
    },
  };
  return patterns[suit]?.[size] || patterns['♠'][size];
}

function getCornerRank(rank: string, size: 'small' | 'medium' | 'large') {
  const fontSizes = { small: 'text-[11px]', medium: 'text-[14px]', large: 'text-[18px]' };
  return fontSizes[size];
}

function renderPips(rank: string, suit: string, size: 'small' | 'medium' | 'large') {
  const pipCount = parseInt(rank, 10);
  const suitPattern = getSuitPattern(suit, size);
  
  const arrangements: Record<number, Array<{row: number, col: number}>> = {
    1: [{row: 1, col: 1}],
    2: [{row: 0, col: 1}, {row: 2, col: 1}],
    3: [{row: 0, col: 1}, {row: 1, col: 1}, {row: 2, col: 1}],
    4: [{row: 0, col: 0}, {row: 0, col: 2}, {row: 2, col: 0}, {row: 2, col: 2}],
    5: [{row: 0, col: 0}, {row: 0, col: 2}, {row: 1, col: 1}, {row: 2, col: 0}, {row: 2, col: 2}],
    6: [{row: 0, col: 0}, {row: 0, col: 2}, {row: 1, col: 0}, {row: 1, col: 2}, {row: 2, col: 0}, {row: 2, col: 2}],
    7: [{row: 0, col: 0}, {row: 0, col: 2}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 2, col: 0}, {row: 2, col: 2}],
    8: [{row: 0, col: 0}, {row: 0, col: 2}, {row: 0, col: 1}, {row: 1, col: 0}, {row: 1, col: 2}, {row: 2, col: 0}, {row: 2, col: 2}, {row: 2, col: 1}],
    9: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 0}, {row: 1, col: 2}, {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, {row: 1, col: 1}],
    10: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 1, col: 0}, {row: 1, col: 2}, {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, {row: 1, col: 1}, {row: 0, col: 1}],
  };

  const positions = arrangements[pipCount] || [];
  
  return positions.map((_pos, i) => (
    <div 
      key={i} 
      className="flex items-center justify-center"
      style={{ 
        width: size === 'small' ? '16px' : size === 'medium' ? '24px' : '32px',
        height: size === 'small' ? '16px' : size === 'medium' ? '24px' : '32px',
      }}
    >
      {suitPattern}
    </div>
  ));
}

function CardFace({ card, size, suitColor, rankDisplay, suitDisplay }: { 
  card: CardType; 
  size: 'small' | 'medium' | 'large';
  suitColor: string;
  rankDisplay: string;
  suitDisplay: string;
}) {
  return (
    <div className="relative h-full w-full bg-white">
      {/* Top Left Corner */}
      <div className="absolute top-1.5 left-1.5 flex flex-col items-start z-10">
        <span className={cn(getCornerRank(rankDisplay, size), 'font-bold leading-none', `text-[${suitColor}]`)}>{rankDisplay}</span>
        <span className={cn(getCornerRank(rankDisplay, size), 'leading-none', `text-[${suitColor}]`)}>{getSuitPattern(suitDisplay, size)}</span>
      </div>
      
      {/* Center Suit */}
      <div className="absolute inset-0 flex items-center justify-center z-5">
        <div className={cn('flex items-center justify-center', `text-[${suitColor}]`)}>
          {getSuitPattern(suitDisplay, size)}
        </div>
      </div>
      
      {/* Bottom Right Corner (rotated 180) */}
      <div className="absolute bottom-1.5 right-1.5 flex flex-col items-end z-10" style={{ transform: 'rotate(180deg)' }}>
        <span className={cn(getCornerRank(rankDisplay, size), 'font-bold leading-none', `text-[${suitColor}]`)}>{rankDisplay}</span>
        <span className={cn(getCornerRank(rankDisplay, size), 'leading-none', `text-[${suitColor}]`)}>{getSuitPattern(suitDisplay, size)}</span>
      </div>
      
      {/* Pip pattern for number cards */}
      {(['2','3','4','5','6','7','8','9','10'].includes(card.rank)) && (
        <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none z-5">
          <div className={cn(
            'flex flex-wrap justify-center items-center gap-1',
            size === 'small' && 'gap-0.5',
            size === 'large' && 'gap-1.5'
          )}>
            {renderPips(card.rank, card.suit, size)}
          </div>
        </div>
      )}
      
      {/* Face card indicators */}
      {(['J','Q','K'].includes(card.rank)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
          <div className="text-center">
            {getSuitPattern(suitDisplay, size)}
            <div className={cn(
              'font-serif font-bold mt-1',
              size === 'small' && 'text-xs',
              size === 'medium' && 'text-sm',
              size === 'large' && 'text-base'
            )}>
              {card.rank === 'J' && 'JACK'}
              {card.rank === 'Q' && 'QUEEN'}
              {card.rank === 'K' && 'KING'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardBack({ size }: { size: 'small' | 'medium' | 'large' }) {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center">
      <div className="absolute inset-2 border border-emerald-500/30 rounded-lg" />
      <div className="absolute inset-4 border border-emerald-500/20 rounded" />
      
      <div className="relative flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {['♠', '♥', '♦', '♣'].map((s, i) => (
            <span 
              key={s} 
              className={cn(
                'text-slate-400/50 font-light',
                size === 'small' && 'text-xs',
                size === 'medium' && 'text-sm',
                size === 'large' && 'text-base'
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {s}
            </span>
          ))}
        </div>
        <div className={cn(
          'rounded-full border-2 border-emerald-500/50 flex items-center justify-center',
          size === 'small' && 'w-8 h-8',
          size === 'medium' && 'w-12 h-12',
          size === 'large' && 'w-16 h-16'
        )}>
          <motion.div
            className={cn(
              'rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600',
              size === 'small' && 'w-4 h-4',
              size === 'medium' && 'w-6 h-6',
              size === 'large' && 'w-8 h-8'
            )}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
}

export function CardComponent({ 
  card, 
  size = 'medium', 
  faceUp = true, 
  animated = true, 
  delay = 0,
  className,
  style,
  onClick,
}: CardProps) {
  const suitColor = suitColors[card.suit] || '#000000';
  const rankDisplay = card.rank;
  const suitDisplay = suitSymbols[card.suit] || card.suit;

  return (
    <AnimatePresence mode="wait">
      {faceUp ? (
        <motion.div
          key="front"
          className={cn(
            sizeClasses[size],
            'relative bg-white border border-gray-200 shadow-lg overflow-hidden',
            className
          )}
          style={style}
          initial={animated ? { scale: 0.8, opacity: 0, rotate: -10 } : undefined}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            delay: animated ? delay : 0,
          }}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
        >
          <CardFace 
            card={card} 
            size={size} 
            suitColor={suitColor} 
            rankDisplay={rankDisplay} 
            suitDisplay={suitDisplay} 
          />
        </motion.div>
      ) : (
        <motion.div
          key="back"
          className={cn(
            sizeClasses[size],
            'relative overflow-hidden',
            className
          )}
          style={style}
          initial={animated ? { scale: 0.8, opacity: 0, rotate: 10 } : undefined}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotate: -10 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            delay: animated ? delay : 0,
          }}
        >
          <CardBack size={size} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CardBackComponent({ 
  size = 'medium', 
  animated = true, 
  delay = 0,
  className,
}: { 
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        sizeClasses[size],
        'relative overflow-hidden',
        className
      )}
      initial={animated ? { opacity: 0, scale: 0.8, rotate: -180 } : undefined}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        delay,
      }}
    >
      <CardBack size={size} />
    </motion.div>
  );
}

export function HandDisplay({ 
  cards, 
  size = 'medium',
  faceUp = true,
  animated = true,
  maxVisible = 7,
  className,
}: { 
  cards: CardType[];
  size?: 'small' | 'medium' | 'large';
  faceUp?: boolean;
  animated?: boolean;
  maxVisible?: number;
  className?: string;
}) {
  const visibleCards = cards.slice(0, maxVisible);
  const hiddenCount = cards.length - maxVisible;

  const offsets: Record<string, number> = {
    small: 18,
    medium: 24,
    large: 30,
  };

  const offset = offsets[size];
  const cardWidth = { small: 56, medium: 80, large: 100 }[size];

  return (
    <div className={cn('flex items-center justify-center gap-0', className)} style={{ 
      minWidth: visibleCards.length > 0 ? `${cardWidth + (visibleCards.length - 1) * offset}px` : 'auto' 
    }}>
      {visibleCards.map((card, index) => (
        <CardComponent
          key={card.id}
          card={card}
          size={size}
          faceUp={faceUp}
          animated={animated}
          delay={animated ? index * 100 : 0}
          style={{ zIndex: visibleCards.length - index }}
        />
      ))}
      {hiddenCount > 0 && (
        <motion.div
          className={cn(sizeClasses[size], 'bg-slate-800 border border-slate-700 flex items-center justify-center')}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ zIndex: 0 }}
        >
          <span className={cn('text-slate-400 font-mono font-semibold', size === 'small' && 'text-xs', size === 'medium' && 'text-sm', size === 'large' && 'text-base')}>
            +{hiddenCount}
          </span>
        </motion.div>
      )}
    </div>
  );
}