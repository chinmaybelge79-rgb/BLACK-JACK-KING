'use client';

import { useEffect, useState, useRef } from 'react';
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
  small: 'w-[56px] h-[78px] rounded-lg text-xs',
  medium: 'w-[80px] h-[112px] rounded-xl text-sm',
  large: 'w-[100px] h-[140px] rounded-2xl text-base',
};

const sizeFontSizes = {
  small: 'text-[10px]',
  medium: 'text-[12px]',
  large: 'text-[14px]',
};

const suitSymbols: Record<string, string> = {
  '♠': '♠',
  '♥': '♥',
  '♦': '♦',
  '♣': '♣',
};

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
  const [isMounted, setIsMounted] = useState(false);
  const [flipped, setFlipped] = useState(!faceUp);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    if (animated) {
      const timer = setTimeout(() => {
        setFlipped(false);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setFlipped(!faceUp);
    }
  }, [faceUp, animated, delay]);

  useEffect(() => {
    if (flipped !== !faceUp) {
      setFlipped(!faceUp);
    }
  }, [faceUp]);

  const isRed = card.suit === '♥' || card.suit === '♦';
  const suitColor = isRed ? '#ef4444' : '#06060a';
  const rankDisplay = card.rank;
  const suitDisplay = suitSymbols[card.suit] || card.suit;

  if (!isMounted) {
    return (
      <div 
        className={cn(sizeClasses[size], 'bg-polymarket-bgTeritary border border-polymarket-border')}
        aria-hidden="true"
      />
    );
  }

  const cardContent = (
    <motion.div
      ref={cardRef}
      className={cn(
        sizeClasses[size],
        'relative bg-white rounded-xl border border-polymarket-border/20',
        'shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.02)]',
        'overflow-hidden',
        className
      )}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        zIndex: style?.zIndex,
      }}
      initial={{ rotateY: flipped ? 90 : 0, scale: flipped ? 0.8 : 1, opacity: flipped ? 0 : 1 }}
      animate={{ rotateY: flipped ? 90 : 0, scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        duration: 0.4,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      {/* Card Front */}
      <div className="absolute inset-0 flex flex-col" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
        {/* Top Left */}
        <div className="flex flex-col items-start p-2">
          <span className={cn(sizeFontSizes[size], 'font-mono font-bold leading-none', `text-[${suitColor}]`)}>{rankDisplay}</span>
          <span className={cn(sizeFontSizes[size], 'leading-none', `text-[${suitColor}]`)}>{suitDisplay}</span>
        </div>
        
        {/* Center */}
        <div className="flex-1 flex items-center justify-center">
          <span 
            className={cn(
              size === 'small' ? 'text-3xl' : size === 'medium' ? 'text-5xl' : 'text-7xl',
              'font-light',
              `text-[${suitColor}]`,
              'opacity-90',
              'select-none'
            )}
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            {suitDisplay}
          </span>
        </div>
        
        {/* Bottom Right (rotated 180) */}
        <div className="flex flex-col items-end p-2" style={{ transform: 'rotate(180deg)' }}>
          <span className={cn(sizeFontSizes[size], 'font-mono font-bold leading-none', `text-[${suitColor}]`)}>{rankDisplay}</span>
          <span className={cn(sizeFontSizes[size], 'leading-none', `text-[${suitColor}]`)}>{suitDisplay}</span>
        </div>
      </div>

      {/* Card Back */}
      <AnimatePresence mode="wait">
        {flipped && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-polymarket-bgTeritary to-polymarket-bg border border-polymarket-border flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="flex flex-col items-center gap-1 p-3">
              <div className="flex flex-wrap justify-center gap-1">
                {['♠', '♥', '♦', '♣'].map((s, i) => (
                  <span 
                    key={s} 
                    className={cn(
                      size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base',
                      'text-polymarket-textMuted/30',
                      'font-light'
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="absolute inset-3 border border-polymarket-primary/30 rounded-lg pointer-events-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return cardContent;
}

export function CardBack({ 
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
        'relative bg-gradient-to-br from-polymarket-bgTeritary to-polymarket-bg border border-polymarket-border flex items-center justify-center',
        'overflow-hidden',
        className
      )}
      initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        delay,
      }}
    >
      <div className="flex flex-col items-center gap-1 p-3">
        <div className="flex flex-wrap justify-center gap-1">
          {['♠', '♥', '♦', '♣'].map((s, i) => (
            <span 
              key={s} 
              className={cn(
                size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base',
                'text-polymarket-textMuted/30',
                'font-light'
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {s}
            </span>
          ))}
        </div>
        <div className="absolute inset-3 border border-polymarket-primary/30 rounded-lg pointer-events-none" />
      </div>
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

  return (
    <div className={cn('flex items-center justify-center gap-0', className)} style={{ 
      minWidth: visibleCards.length > 0 ? `calc(${sizeClasses[size].match(/w-\[([^\]]+)\]?/)?.[1] || '80px'} + ${(visibleCards.length - 1) * offset}px)` : 'auto' 
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
          className={cn(sizeClasses[size], 'bg-polymarket-bgSecondary border border-polymarket-border flex items-center justify-center')}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ zIndex: 0 }}
        >
          <span className={cn(sizeFontSizes[size], 'text-polymarket-textMuted font-mono font-semibold')}>
            +{hiddenCount}
          </span>
        </motion.div>
      )}
    </div>
  );
}