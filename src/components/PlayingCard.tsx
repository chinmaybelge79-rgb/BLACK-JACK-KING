'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Card as CardType } from '../types/game';

export interface PlayingCardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
  faceUp?: boolean;
  animated?: boolean;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const sizeConfig = {
  small: { width: 56, height: 78, radius: 8, fontScale: 0.75, cornerOffset: 6, pipSize: 14 },
  medium: { width: 80, height: 112, radius: 10, fontScale: 1, cornerOffset: 10, pipSize: 22 },
  large: { width: 100, height: 140, radius: 12, fontScale: 1.25, cornerOffset: 12, pipSize: 28 },
};

const suitPaths: Record<string, string> = {
  '♠': 'M12 2C12 2 8 6 8 10c0 3.5 2.5 7 4 8.5.7.7 1.5 1 2.5 1s1.8-.3 2.5-1C13.5 17 16 13.5 16 10c0-4-4-8-4-8z',
  '♥': 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  '♦': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  '♣': 'M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm8 0c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z',
};

const suitColors: Record<string, string> = {
  '♠': '#0F172A',
  '♣': '#0F172A',
  '♥': '#DC2626',
  '♦': '#DC2626',
};

function SuitIcon({ suit, size = 1, color }: { suit: string; size?: number; color?: string }) {
  return (
    <svg
      width={24 * size}
      height={24 * size}
      viewBox="0 0 24 24"
      fill={color || suitColors[suit] || '#0F172A'}
      style={{ display: 'block', lineHeight: 1 }}
      aria-hidden="true"
    >
      <path d={suitPaths[suit]} />
    </svg>
  );
}

function getCornerRank(rank: string): string {
  return rank === '10' ? '10' : rank[0];
}

function getPipPositions(rank: string): Array<{ x: number; y: number }> {
  const arrangements: Record<string, Array<{ x: number; y: number }>> = {
    'A': [{ x: 50, y: 50 }],
    '2': [{ x: 50, y: 20 }, { x: 50, y: 80 }],
    '3': [{ x: 50, y: 15 }, { x: 50, y: 50 }, { x: 50, y: 85 }],
    '4': [{ x: 25, y: 20 }, { x: 75, y: 20 }, { x: 25, y: 80 }, { x: 75, y: 80 }],
    '5': [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 50, y: 50 }, { x: 25, y: 85 }, { x: 75, y: 85 }],
    '6': [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 85 }, { x: 75, y: 85 }],
    '7': [{ x: 25, y: 12 }, { x: 75, y: 12 }, { x: 25, y: 38 }, { x: 50, y: 50 }, { x: 75, y: 38 }, { x: 25, y: 88 }, { x: 75, y: 88 }],
    '8': [{ x: 25, y: 10 }, { x: 75, y: 10 }, { x: 25, y: 34 }, { x: 75, y: 34 }, { x: 50, y: 50 }, { x: 25, y: 66 }, { x: 75, y: 66 }, { x: 25, y: 90 }, { x: 75, y: 90 }],
    '9': [{ x: 25, y: 10 }, { x: 50, y: 10 }, { x: 75, y: 10 }, { x: 25, y: 35 }, { x: 75, y: 35 }, { x: 50, y: 50 }, { x: 25, y: 65 }, { x: 75, y: 65 }, { x: 25, y: 90 }, { x: 50, y: 90 }, { x: 75, y: 90 }],
    '10': [{ x: 25, y: 8 }, { x: 75, y: 8 }, { x: 25, y: 26 }, { x: 75, y: 26 }, { x: 50, y: 44 }, { x: 25, y: 62 }, { x: 75, y: 62 }, { x: 25, y: 80 }, { x: 75, y: 80 }, { x: 50, y: 92 }],
  };
  return arrangements[rank] || [];
}

function CardFace({ card, config, suitColor }: { card: CardType; config: typeof sizeConfig.medium; suitColor: string }) {
  const rankDisplay = getCornerRank(card.rank);
  const isFaceCard = ['J', 'Q', 'K'].includes(card.rank);
  const isAce = card.rank === 'A';
  const pipPositions = getPipPositions(card.rank);

  return (
    <div className="relative w-full h-full" style={{ background: '#FFFFFF' }}>
      {/* Inner border */}
      <div className="absolute inset-[1px] rounded-[inherit]" style={{
        border: '1px solid #E2E8F0',
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
          fontSize: `${13 * config.fontScale}px`,
          color: suitColor,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        }}>{rankDisplay}</span>
        <div className="leading-none" style={{ transform: 'translateY(-1px)' }}>
          <SuitIcon suit={card.suit} size={0.9} color={suitColor} />
        </div>
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 5 }}>
        {isFaceCard && (
          <div className="text-center" style={{ transform: 'scale(1.1)' }}>
            <div style={{ filter: `drop-shadow(0 2px 4px ${suitColor}40)` }}>
              <SuitIcon suit={card.suit} size={2.5} color={suitColor} />
            </div>
            <div className="font-serif font-bold mt-2 select-none" style={{
              fontSize: `${10 * config.fontScale}px`,
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
              pipPositions.map((_pos, i) => (
                <div key={i} className="flex items-center justify-center" style={{
                  width: `${config.pipSize}px`,
                  height: `${config.pipSize}px`,
                }}>
                  <SuitIcon suit={card.suit} size={0.8} color={suitColor} />
                </div>
              ))
            ) : (
              <div style={{ filter: `drop-shadow(0 4px 8px ${suitColor}40)` }}>
                <SuitIcon suit={card.suit} size={3} color={suitColor} />
              </div>
            )}
          </div>
        )}

        {/* Ace special large center pip */}
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
              <SuitIcon suit={card.suit} size={3} color={suitColor} />
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
          fontSize: `${13 * config.fontScale}px`,
          color: suitColor,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        }}>{rankDisplay}</span>
        <div className="leading-none" style={{ transform: 'translateY(-1px)' }}>
          <SuitIcon suit={card.suit} size={0.9} color={suitColor} />
        </div>
      </div>
    </div>
  );
}

function CardBack({ config }: { config: typeof sizeConfig.medium }) {
  return (
    <div className="relative w-full h-full" style={{
      background: 'linear-gradient(135deg, #1E293B 0%, #161F30 100%)',
      borderRadius: `${config.radius}px`,
    }}>
      {/* Geometric grid pattern */}
      <svg className="absolute inset-0" style={{ opacity: 0.15 }} viewBox={`0 0 ${config.width} ${config.height}`} preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Inner double border */}
      <div className="absolute inset-[2px] rounded-[calc(inherit_-_2px)]" style={{
        border: '1px solid rgba(59, 130, 246, 0.2)',
        pointerEvents: 'none',
      }} />
      <div className="absolute inset-[6px] rounded-[calc(inherit_-_6px)]" style={{
        border: '1px solid rgba(59, 130, 246, 0.1)',
        pointerEvents: 'none',
      }} />

      {/* Corner accents */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="absolute top-0 left-0" style={{
          width: 24, height: 24,
          borderTop: '1px solid rgba(59, 130, 246, 0.3)',
          borderLeft: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: `${config.radius - 4}px 0 0 0`,
        }} />
        <div className="absolute top-0 right-0" style={{
          width: 24, height: 24,
          borderTop: '1px solid rgba(59, 130, 246, 0.3)',
          borderRight: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: `0 ${config.radius - 4}px 0 0`,
        }} />
        <div className="absolute bottom-0 left-0" style={{
          width: 24, height: 24,
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          borderLeft: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: `0 0 0 ${config.radius - 4}px`,
        }} />
        <div className="absolute bottom-0 right-0" style={{
          width: 24, height: 24,
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          borderRight: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: `0 0 ${config.radius - 4}px 0`,
        }} />
      </div>

      {/* Center subtle emblem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{
          width: config.width * 0.3,
          height: config.width * 0.3,
          borderRadius: '50%',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.15), transparent 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            background: 'linear-gradient(135deg, #1E293B 0%, #161F30 100%)',
          }} />
        </div>
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
}: PlayingCardProps) {
  const config = sizeConfig[size];
  const suitColor = suitColors[card.suit] || '#0F172A';

  const baseStyle: React.CSSProperties = {
    ...style,
    width: config.width,
    height: config.height,
    borderRadius: config.radius,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  };

  return (
    <AnimatePresence mode="wait">
      {faceUp ? (
        <motion.div
          key="front"
          className={className}
          style={baseStyle}
          initial={animated ? { rotateY: 90, scale: 0.9, opacity: 0 } : undefined}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          exit={{ rotateY: -90, scale: 0.9, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 25,
            delay: animated ? delay : 0,
          }}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
            <CardFace card={card} config={config} suitColor={suitColor} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="back"
          className={className}
          style={baseStyle}
          initial={animated ? { rotateY: -90, scale: 0.9, opacity: 0 } : undefined}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          exit={{ rotateY: 90, scale: 0.9, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 25,
            delay: animated ? delay : 0,
          }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <CardBack config={config} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
  const config = sizeConfig[size];
  const offset = config.width * 0.28;

  return (
    <div className={className} style={{ 
      minWidth: visibleCards.length > 0 ? `${config.width + (visibleCards.length - 1) * offset}px` : 'auto' 
    }}>
      {visibleCards.map((card, index) => (
        <PlayingCard
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
        <div className="flex items-center justify-center" style={{
          width: config.width,
          height: config.height,
          borderRadius: config.radius,
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 0,
        }}>
          <span className="text-slate-500 font-mono font-semibold" style={{
            fontSize: size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px',
          }}>
            +{hiddenCount}
          </span>
        </div>
      )}
    </div>
  );
}