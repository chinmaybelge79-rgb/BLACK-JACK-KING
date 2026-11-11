'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import type { Card as CardType } from '../types/game';

export interface PlayingCardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large' | 'xl';
  faceUp?: boolean;
  animated?: boolean;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  isDealerHoleCard?: boolean;
  fourColorMode?: boolean;
}

const sizeConfig = {
  small: { width: 56, height: 78, radius: 8, fontScale: 0.75, cornerOffset: 6, pipSize: 12 },
  medium: { width: 88, height: 122, radius: 12, fontScale: 1, cornerOffset: 10, pipSize: 18 },
  large: { width: 110, height: 152, radius: 16, fontScale: 1.25, cornerOffset: 14, pipSize: 24 },
  xl: { width: 140, height: 194, radius: 20, fontScale: 1.5, cornerOffset: 18, pipSize: 30 },
};

const SUIT_SYMBOLS = {
  '♠': 'spade',
  '♥': 'heart',
  '♦': 'diamond',
  '♣': 'club',
} as const;

function getSuitColor(suit: string, fourColorMode: boolean): string {
  if (fourColorMode) {
    switch (suit) {
      case '♥': return '#E11D48'; // rose-600
      case '♦': return '#2563EB'; // blue-600
      case '♣': return '#059669'; // emerald-600
      case '♠': return '#0F172A'; // slate-900
      default: return '#0F172A';
    }
  }
  return (suit === '♥' || suit === '♦') ? '#E11D48' : '#0F172A';
}

function getSuitSVG(suit: string, size: number, color: string): string {
  const scale = size / 24;
  const strokeWidth = Math.max(1.5, 2 * scale);
  
  const paths: Record<string, string> = {
    '♠': `M12 2C12 2 8 6 8 10c0 3.5 2.5 7 4 8.5.7.7 1.5 1 2.5 1s1.8-.3 2.5-1C13.5 17 16 13.5 16 10c0-4-4-8-4-8z`,
    '♥': `M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z`,
    '♦': `M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z`,
    '♣': `M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm8 0c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z`,
  };

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="${paths[suit]}"/></svg>`;
}

function getRankDisplay(rank: string): string {
  return rank === '10' ? '10' : rank[0];
}

function getPipPositions(rank: string): Array<{x: number, y: number}> {
  const arrangements: Record<string, Array<{x: number, y: number}>> = {
    'A': [{x: 50, y: 50}],
    '2': [{x: 50, y: 20}, {x: 50, y: 80}],
    '3': [{x: 50, y: 15}, {x: 50, y: 50}, {x: 50, y: 85}],
    '4': [{x: 25, y: 20}, {x: 75, y: 20}, {x: 25, y: 80}, {x: 75, y: 80}],
    '5': [{x: 25, y: 15}, {x: 75, y: 15}, {x: 50, y: 50}, {x: 25, y: 85}, {x: 75, y: 85}],
    '6': [{x: 25, y: 15}, {x: 75, y: 15}, {x: 25, y: 50}, {x: 75, y: 50}, {x: 25, y: 85}, {x: 75, y: 85}],
    '7': [{x: 25, y: 12}, {x: 75, y: 12}, {x: 25, y: 38}, {x: 50, y: 50}, {x: 75, y: 38}, {x: 25, y: 88}, {x: 75, y: 88}],
    '8': [{x: 25, y: 10}, {x: 75, y: 10}, {x: 25, y: 34}, {x: 75, y: 34}, {x: 50, y: 50}, {x: 25, y: 66}, {x: 75, y: 66}, {x: 25, y: 90}, {x: 75, y: 90}],
    '9': [{x: 25, y: 10}, {x: 50, y: 10}, {x: 75, y: 10}, {x: 25, y: 35}, {x: 75, y: 35}, {x: 50, y: 50}, {x: 25, y: 65}, {x: 75, y: 65}, {x: 25, y: 90}, {x: 50, y: 90}, {x: 75, y: 90}],
    '10': [{x: 25, y: 8}, {x: 75, y: 8}, {x: 25, y: 26}, {x: 75, y: 26}, {x: 50, y: 44}, {x: 25, y: 62}, {x: 75, y: 62}, {x: 25, y: 80}, {x: 75, y: 80}, {x: 50, y: 92}],
  };
  return arrangements[rank] || [];
}

function SuitIcon({ symbol, size = 1, color }: { symbol: string; size?: number; color?: string }) {
  return (
    <span 
      style={{ 
        display: 'inline-block', 
        lineHeight: 1,
        transform: `scale(${size})`,
        color,
      }} 
      dangerouslySetInnerHTML={{ __html: symbol }} 
    />
  );
}

function CardFace({ card, config, suitColor, rankDisplay, suitSymbol, fourColorMode }: { 
  card: CardType;
  config: typeof sizeConfig.medium;
  suitColor: string;
  rankDisplay: string;
  suitSymbol: string;
  fourColorMode: boolean;
}) {
  const pipPositions = getPipPositions(card.rank);
  const isFaceCard = ['J', 'Q', 'K'].includes(card.rank);
  const isAce = card.rank === 'A';

  return (
    <div className="relative w-full h-full" style={{ background: 'linear-gradient(145deg, #FAFAFA 0%, #F4F4F6 100%)' }}>
      {/* Subtle linen texture overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%2300000005' d='M0 0h4v4H0zM2 0h2v2H2zM0 2h2v2H0z'/%3E%3C/svg%3E")`,
        opacity: 0.15,
        pointerEvents: 'none',
        borderRadius: `${config.radius}px`,
      }} />

      {/* Inner border */}
      <div className="absolute inset-[1px] rounded-[inherit]" style={{
        border: '1px solid rgba(0,0,0,0.06)',
        pointerEvents: 'none',
        borderRadius: `${config.radius - 1}px`,
      }} />

      {/* Top Left Corner */}
      <div className="absolute flex flex-col items-start" style={{
        top: config.cornerOffset,
        left: config.cornerOffset,
        zIndex: 10,
      }}>
        <span className="font-bold leading-none select-none" style={{
          fontSize: `${14 * config.fontScale}px`,
          color: suitColor,
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}>{rankDisplay}</span>
        <div className="leading-none" style={{ transform: 'translateY(-2px)' }}>
          <SuitIcon symbol={suitSymbol} color={suitColor} />
        </div>
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 5 }}>
        {isFaceCard && (
          <div className="text-center" style={{ transform: 'scale(1.1)' }}>
            <div style={{ filter: `drop-shadow(0 2px 4px ${suitColor}40)` }}>
              <SuitIcon symbol={suitSymbol} size={2.5} color={suitColor} />
            </div>
            <div className="font-serif font-bold mt-2 select-none" style={{
              fontSize: `${11 * config.fontScale}px`,
              color: suitColor,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {card.rank === 'J' && 'JACK'}
              {card.rank === 'Q' && 'QUEEN'}
              {card.rank === 'K' && 'KING'}
            </div>
          </div>
        )}

        {!isFaceCard && (
          <div className="flex flex-wrap justify-center items-center gap-1" style={{
            padding: config.cornerOffset * 1.5,
            gap: `${Math.max(2, 4 * config.fontScale)}px`,
          }}>
            {pipPositions.length > 0 ? (
              pipPositions.map((pos, i) => (
                <div key={i} className="flex items-center justify-center" style={{
                  width: `${config.pipSize}px`,
                  height: `${config.pipSize}px`,
                }}>
                  <SuitIcon symbol={suitSymbol} color={suitColor} />
                </div>
              ))
            ) : (
              <div style={{ filter: `drop-shadow(0 4px 8px ${suitColor}40)` }}>
                <SuitIcon symbol={suitSymbol} size={2} color={suitColor} />
              </div>
            )}
          </div>
        )}

        {/* Ace special large center pip with decorative border */}
        {isAce && !isFaceCard && (
          <div className="relative">
            <div style={{
              width: `${config.pipSize * 3}px`,
              height: `${config.pipSize * 3}px`,
              border: `2px solid ${suitColor}`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 0 20px ${suitColor}20, 0 0 30px ${suitColor}30`,
            }}>
              <SuitIcon symbol={suitSymbol} size={3} color={suitColor} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right Corner (rotated 180) */}
      <div className="absolute flex flex-col items-end" style={{
        bottom: config.cornerOffset,
        right: config.cornerOffset,
        transform: 'rotate(180deg)',
        zIndex: 10,
      }}>
        <span className="font-bold leading-none select-none" style={{
          fontSize: `${14 * config.fontScale}px`,
          color: suitColor,
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}>{rankDisplay}</span>
        <div className="leading-none" style={{ transform: 'translateY(-2px)' }}>
          <SuitIcon symbol={suitSymbol} color={suitColor} />
        </div>
      </div>

      {/* Subtle corner accent lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: `${config.radius}px` }}>
        <div className="absolute" style={{
          top: config.cornerOffset - 2,
          left: config.cornerOffset - 2,
          width: 20,
          height: 20,
          borderTop: `1px solid ${suitColor}30`,
          borderLeft: `1px solid ${suitColor}30`,
          borderRadius: `${config.radius}px 0 0 0`,
        }} />
        <div className="absolute" style={{
          bottom: config.cornerOffset - 2,
          right: config.cornerOffset - 2,
          width: 20,
          height: 20,
          borderBottom: `1px solid ${suitColor}30`,
          borderRight: `1px solid ${suitColor}30`,
          borderRadius: `0 0 ${config.radius}px 0`,
        }} />
      </div>
    </div>
  );
}

function CardBack({ config, fourColorMode }: { config: typeof sizeConfig.medium; fourColorMode: boolean }) {
  const primaryColor = fourColorMode ? '#059669' : '#00D4AA';
  const secondaryColor = fourColorMode ? '#2563EB' : '#6366f1';

  return (
    <div className="relative w-full h-full" style={{
      background: `linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)`,
      borderRadius: `${config.radius}px`,
    }}>
      {/* Guilloché pattern background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.3' stroke-opacity='0.03'%3E%3Cpath d='M30 0C13.431 0 0 13.431 0 30s13.431 30 30 30 30-13.431 30-30-13.431-30-30-30zm0 4c14.33 0 26 11.67 26 26S44.33 56 30 56 4 44.33 4 30 11.67 4 26 4zm0 8c10.97 0 20 9.03 20 20S40.97 56 30 56 10 46.97 10 30 19.03 4 30 4zm0 12c7.73 0 14 6.27 14 14S37.73 56 30 56 16 49.73 16 30 22.27 4 30 4z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: `${config.width * 0.6}px`,
        opacity: 0.4,
        pointerEvents: 'none',
        borderRadius: `${config.radius}px`,
      }} />

      {/* Diagonal luxury stripes */}
      <div className="absolute inset-0" style={{
        background: `repeating-linear-gradient(45deg, transparent, transparent 30px, ${primaryColor}15 30px, ${primaryColor}15 60px)`,
        opacity: 0.15,
        pointerEvents: 'none',
        borderRadius: `${config.radius}px`,
      }} />

      {/* Inner double border */}
      <div className="absolute inset-[2px] rounded-[calc(inherit_-_2px)]" style={{
        border: `1px solid ${primaryColor}30`,
        pointerEvents: 'none',
      }} />
      <div className="absolute inset-[6px] rounded-[calc(inherit_-_6px)]" style={{
        border: `1px solid ${primaryColor}15`,
        pointerEvents: 'none',
      }} />

      {/* Corner ornaments */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="absolute top-0 left-0" style={{
          width: 32, height: 32,
          borderTop: `1px solid ${primaryColor}40`,
          borderLeft: `1px solid ${primaryColor}40`,
          borderRadius: `${config.radius - 4}px 0 0 0`,
        }} />
        <div className="absolute top-0 right-0" style={{
          width: 32, height: 32,
          borderTop: `1px solid ${primaryColor}40`,
          borderRight: `1px solid ${primaryColor}40`,
          borderRadius: `0 ${config.radius - 4}px 0 0`,
        }} />
        <div className="absolute bottom-0 left-0" style={{
          width: 32, height: 32,
          borderBottom: `1px solid ${primaryColor}40`,
          borderLeft: `1px solid ${primaryColor}40`,
          borderRadius: `0 0 0 ${config.radius - 4}px`,
        }} />
        <div className="absolute bottom-0 right-0" style={{
          width: 32, height: 32,
          borderBottom: `1px solid ${primaryColor}40`,
          borderRight: `1px solid ${primaryColor}40`,
          borderRadius: `0 0 ${config.radius - 4}px 0`,
        }} />
      </div>

      {/* Center emblem with animated foil shimmer */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{ 
            scale: [1, 1.02, 1],
            rotate: [0, 1, 0, -1, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Outer ring */}
          <div className="relative" style={{
            width: config.width * 0.35,
            height: config.width * 0.35,
            borderRadius: '50%',
            border: `2px solid ${primaryColor}60`,
            background: `conic-gradient(from 0deg, ${primaryColor}00, ${primaryColor}40, ${secondaryColor}40, ${primaryColor}00)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 40px ${primaryColor}30, inset 0 0 40px ${primaryColor}10`,
          }}>
            {/* Inner ring */}
            <div style={{
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              border: `1px solid ${primaryColor}40`,
              background: `radial-gradient(circle at 30% 30%, ${primaryColor}20, transparent 70%), linear-gradient(135deg, #0F172A 0%, #1E293B 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 0 30px ${primaryColor}10`,
            }}>
              {/* Center glyph */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-1">
                  {['♠', '♥', '♦', '♣'].map((s, i) => (
                    <span key={s} style={{
                      fontSize: `${10 * config.fontScale}px`,
                      color: getSuitColor(s, fourColorMode),
                      opacity: 0.6,
                      fontWeight: 300,
                      animationDelay: `${i * 100}ms`,
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
                <motion.div
                  className="rounded-full"
                  style={{
                    width: config.width * 0.12,
                    height: config.width * 0.12,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    boxShadow: `0 0 20px ${primaryColor}60, 0 0 40px ${primaryColor}30`,
                  }}
                  animate={{ 
                    scale: [1, 1.15, 1],
                    boxShadow: [
                      `0 0 20px ${primaryColor}60, 0 0 40px ${primaryColor}30`,
                      `0 0 30px ${primaryColor}80, 0 0 60px ${primaryColor}50`,
                      `0 0 20px ${primaryColor}60, 0 0 40px ${primaryColor}30`,
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subtle "BLACKJACK KING" watermark */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 select-none" style={{
        fontSize: `${7 * config.fontScale}px`,
        color: `${primaryColor}20`,
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        BLACKJACK KING
      </div>
    </div>
  );
}

export function PlayingCard({ 
  card, 
  size = 'medium', 
  faceUp = true, 
  animated = true, 
  delay = 0,
  className,
  style,
  onClick,
  isDealerHoleCard = false,
  fourColorMode = false,
}: PlayingCardProps) {
  const config = sizeConfig[size];
  const suitColor = getSuitColor(card.suit, fourColorMode);
  const rankDisplay = getRankDisplay(card.rank);
  const suitSymbol = getSuitSVG(card.suit, config.pipSize, suitColor);

  const cardShadow = `
    0 ${config.width * 0.06}px ${config.width * 0.15}px rgba(0, 0, 0, 0.35),
    0 ${config.width * 0.03}px ${config.width * 0.08}px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `;

  const baseStyle: React.CSSProperties = {
    ...style,
    width: config.width,
    height: config.height,
    borderRadius: config.radius,
    perspective: '1200px',
    transformStyle: 'preserve-3d' as const,
    boxShadow: cardShadow,
  };

  const flipTransition = { 
    type: 'spring' as const, 
    stiffness: 280, 
    damping: 22,
    delay: animated ? delay : 0,
  };

  return (
    <AnimatePresence mode="wait">
      {faceUp ? (
        <motion.div
          key="front"
          className={cn('relative', className)}
          style={baseStyle}
          initial={animated ? { rotateY: 90, scale: 0.85, opacity: 0 } : undefined}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          exit={{ rotateY: -90, scale: 0.85, opacity: 0 }}
          transition={flipTransition}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
            <CardFace 
              card={card} 
              config={config} 
              suitColor={suitColor} 
              rankDisplay={rankDisplay} 
              suitSymbol={suitSymbol} 
              fourColorMode={fourColorMode}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="back"
          className={cn('relative', className)}
          style={baseStyle}
          initial={animated ? { rotateY: -90, scale: 0.85, opacity: 0 } : undefined}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          exit={{ rotateY: 90, scale: 0.85, opacity: 0 }}
          transition={flipTransition}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <CardBack config={config} fourColorMode={fourColorMode} />
          </div>
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
  fourColorMode = false,
}: { 
  size?: 'small' | 'medium' | 'large' | 'xl';
  animated?: boolean;
  delay?: number;
  className?: string;
  fourColorMode?: boolean;
}) {
  const config = sizeConfig[size];
  const primaryColor = fourColorMode ? '#059669' : '#00D4AA';

  const baseStyle: React.CSSProperties = {
    width: config.width,
    height: config.height,
    borderRadius: config.radius,
    perspective: '1200px',
    transformStyle: 'preserve-3d' as const,
    boxShadow: `
      0 ${config.width * 0.06}px ${config.width * 0.15}px rgba(0, 0, 0, 0.35),
      0 ${config.width * 0.03}px ${config.width * 0.08}px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(0, 0, 0, 0.05)
    `,
  };

  return (
    <motion.div
      className={cn('relative', className)}
      style={baseStyle}
      initial={animated ? { opacity: 0, scale: 0.8, rotate: -10 } : undefined}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        delay,
      }}
    >
      <CardBack config={config} fourColorMode={fourColorMode} />
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
  fourColorMode = false,
  dealFromShoe = false,
  shoePosition,
}: { 
  cards: CardType[];
  size?: 'small' | 'medium' | 'large' | 'xl';
  faceUp?: boolean;
  animated?: boolean;
  maxVisible?: number;
  className?: string;
  fourColorMode?: boolean;
  dealFromShoe?: boolean;
  shoePosition?: { x: number; y: number };
}) {
  const visibleCards = cards.slice(0, maxVisible);
  const hiddenCount = cards.length - maxVisible;
  const config = sizeConfig[size];
  const offset = config.width * 0.28;

  return (
    <div className={cn('flex items-center justify-center gap-0', className)} style={{ 
      minWidth: visibleCards.length > 0 ? `${config.width + (visibleCards.length - 1) * offset}px` : 'auto' 
    }}>
      {visibleCards.map((card, index) => (
        <PlayingCard
          key={card.id}
          card={card}
          size={size}
          faceUp={faceUp}
          animated={animated}
          delay={animated ? index * 120 : 0}
          style={{ 
            zIndex: visibleCards.length - index,
            transformOrigin: 'center center',
          }}
          fourColorMode={fourColorMode}
        />
      ))}
      {hiddenCount > 0 && (
        <motion.div
          className={cn('bg-slate-800/50 border border-slate-700/50 flex items-center justify-center backdrop-blur-sm', `rounded-${size === 'small' ? 'lg' : size === 'medium' ? 'xl' : '2xl'}`)}
          style={{ width: config.width, height: config.height, zIndex: 0 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-slate-400 font-mono font-semibold" style={{
            fontSize: size === 'small' ? '10px' : size === 'medium' ? '12px' : size === 'large' ? '14px' : '16px',
          }}>
            +{hiddenCount}
          </span>
        </motion.div>
      )}
    </div>
  );
}