'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { CardComponent, HandDisplay } from './Card';
import { Button, ActionButton } from './Button';
import { Chip, BetDisplay } from './Chip';
import { useGameStore, useGamePhase, usePlayerHands, useDealerHand, useActiveHandIndex, useBalance, useCurrentBet, useSelectedChip, useInsuranceBet, useDealerPlayed, useShowResult, useLastResult, useStats, useSettings, useDeck } from '../store/gameStore';
import { calculateHandValue, isBust, canSplit, canDouble, CHIP_VALUES } from '../types/game';
import { Loader2, Volume2, VolumeX, Settings, RefreshCw, Check, X } from 'lucide-react';

export function GameTable() {
  const phase = useGamePhase();
  const playerHands = usePlayerHands();
  const dealerHand = useDealerHand();
  const activeHandIndex = useActiveHandIndex();
  const balance = useBalance();
  const currentBet = useCurrentBet();
  const selectedChip = useSelectedChip();
  const insuranceBet = useInsuranceBet();
  const dealerPlayed = useDealerPlayed();
  const showResult = useShowResult();
  const lastResult = useLastResult();
  const stats = useStats();
  const settings = useSettings();
  const deck = useDeck();
  
  const {
    placeBet,
    clearBet,
    deal,
    hit,
    stand,
    doubleDown,
    split,
    takeInsurance,
    declineInsurance,
    newGame,
    setSelectedChip,
    updateSettings,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [flyingChips, setFlyingChips] = useState<{ value: number; id: string }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeHand = playerHands[activeHandIndex];
  const handValue = activeHand ? calculateHandValue(activeHand.cards).value : 0;
  const handSoft = activeHand ? calculateHandValue(activeHand.cards).soft : false;
  const handBusted = activeHand ? isBust(activeHand.cards) : false;
  const handBlackjack = activeHand ? calculateHandValue(activeHand.cards).isBlackjack : false;
  const showDealerValue = dealerPlayed || phase === 'gameOver';
  const dealerValue = showDealerValue ? calculateHandValue(dealerHand).value : 
    dealerHand.length > 0 ? calculateHandValue([dealerHand[0]]).value : 0;

  const canDoubleCurrent = activeHand && canDouble(activeHand, balance);
  const canSplitCurrent = activeHand && canSplit(activeHand) && balance >= activeHand.bet;
  const dealerShowingAce = dealerHand.length > 0 && dealerHand[0].rank === 'A' && dealerHand[0].faceUp;

  const handleChipClick = (value: number) => {
    if (phase !== 'betting') return;
    if (currentBet + value > balance) return;
    
    const id = `${value}-${Date.now()}`;
    setFlyingChips(prev => [...prev, { value, id }]);
    placeBet(value);
    
    setTimeout(() => {
      setFlyingChips(prev => prev.filter(c => c.id !== id));
    }, 400);
  };

  const handleDeal = () => {
    if (phase !== 'betting') return;
    if (currentBet === 0) return;
    deal();
  };

  const handleNewGame = () => {
    newGame();
  };

  const handleRebetAndDeal = () => {
    if (phase !== 'betting') return;
    if (currentBet > 0) {
      deal();
    }
  };

  const showInsurance = phase === 'playerTurn' && dealerShowingAce && insuranceBet === 0 && balance >= currentBet / 2;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-polymarket-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-polymarket-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-polymarket-textMuted">Loading table...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-polymarket-bg relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-polymarket-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-polymarket-secondary/5 blur-3xl" />
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,#06060a_100%)]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 px-4 md:px-8 py-4 border-b border-polymarket-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Balance & Stats */}
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <div className="glass-panel px-5 py-3 min-w-[160px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-polymarket-textMuted tracking-wider uppercase">
                  Bankroll
                </span>
                <motion.span
                  className="font-mono font-bold text-xl text-polymarket-primary tabular-nums"
                  animate={{ textShadow: ['0 0 0 transparent', '0 0 20px rgba(0,212,170,0.5)', '0 0 0 transparent'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ${balance.toLocaleString()}
                </motion.span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4 border-l border-polymarket-border/50 pl-4 hidden sm:flex">
              <StatBadge label="W" value={stats.wins} color="text-polymarket-success" />
              <StatBadge label="L" value={stats.losses} color="text-polymarket-danger" />
              <StatBadge label="P" value={stats.pushes} color="text-polymarket-warning" />
              <StatBadge label="BJ" value={stats.blackjacks} color="text-polymarket-primary" />
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-2">
            <IconButton
              variant="ghost"
              size="small"
              onClick={() => updateSettings({ sound: !settings.sound })}
              aria-label={settings.sound ? 'Mute sound' : 'Enable sound'}
              className="text-polymarket-textMuted hover:text-polymarket-text"
            >
              {settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </IconButton>
            <IconButton
              variant="ghost"
              size="small"
              onClick={() => updateSettings({ animations: !settings.animations })}
              aria-label={settings.animations ? 'Disable animations' : 'Enable animations'}
              className="text-polymarket-textMuted hover:text-polymarket-text"
            >
              <Settings className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </header>

      {/* Flying Chips Animation */}
      <AnimatePresence>
        {flyingChips.map(({ value, id }) => (
          <Chip
            key={id}
            value={value}
            flying
            flyTarget={{ x: 0, y: -200 }}
            size="medium"
          />
        ))}
      </AnimatePresence>

      {/* Main Game Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 flex flex-col">
        {/* Dealer Area */}
        <DealerArea 
          dealerHand={dealerHand} 
          dealerValue={dealerValue}
          showDealerValue={showDealerValue}
          phase={phase}
          dealerPlayed={dealerPlayed}
          showInsurance={showInsurance}
          onInsurance={takeInsurance}
          onDeclineInsurance={declineInsurance}
          settings={settings}
        />

        {/* Result Banner */}
        <AnimatePresence>
          {showResult && lastResult && (
            <motion.div
              className="relative z-20 mx-4 md:mx-0 mb-6"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ResultBanner message={lastResult} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player Area */}
        <div className="flex-1 flex flex-col">
          <PlayerArea
            playerHands={playerHands}
            activeHandIndex={activeHandIndex}
            phase={phase}
            handValue={handValue}
            handSoft={handSoft}
            handBusted={handBusted}
            handBlackjack={handBlackjack}
            canDouble={canDoubleCurrent}
            canSplit={canSplitCurrent}
            currentBet={currentBet}
            balance={balance}
            onHit={() => hit(activeHandIndex)}
            onStand={() => stand(activeHandIndex)}
            onDouble={() => doubleDown(activeHandIndex)}
            onSplit={() => split(activeHandIndex)}
            settings={settings}
          />

          {/* Betting / Action Controls */}
          <GameControls
            phase={phase}
            currentBet={currentBet}
            selectedChip={selectedChip}
            balance={balance}
            onChipSelect={handleChipClick}
            onClearBet={clearBet}
            onDeal={handleDeal}
            onNewGame={handleNewGame}
            onRebetAndDeal={handleRebetAndDeal}
            settings={settings}
            canDeal={currentBet > 0}
            updateSettings={updateSettings}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 md:px-8 py-4 border-t border-polymarket-border/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-polymarket-textMuted tracking-wider">
            Blackjack pays 3:2 • Dealer stands on soft 17 • Insurance pays 2:1 • {deck.length} cards remaining
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 bg-polymarket-bgSecondary/50 rounded-xl border border-polymarket-border/50">
      <span className={cn('font-mono font-bold text-sm tabular-nums', color)}>{value}</span>
      <span className="text-[10px] font-semibold text-polymarket-textMuted uppercase tracking-wider">{label}</span>
    </div>
  );
}

function DealerArea({ 
  dealerHand, 
  dealerValue, 
  showDealerValue, 
  phase, 
  dealerPlayed, 
  showInsurance, 
  onInsurance, 
  onDeclineInsurance,
  settings,
}: { 
  dealerHand: any[];
  dealerValue: number;
  showDealerValue: boolean;
  phase: string;
  dealerPlayed: boolean;
  showInsurance: boolean;
  onInsurance: () => void;
  onDeclineInsurance: () => void;
  settings: any;
}) {
  return (
    <div className="mb-8 animate-slide-down">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-polymarket-textMuted tracking-wider uppercase">
            Dealer
          </span>
          <AnimatePresence mode="wait">
            {showDealerValue && dealerHand.length > 0 && (
              <motion.div
                key="dealer-value"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="px-3 py-1 bg-polymarket-primaryDim border border-polymarket-primary/30 rounded-xl font-mono font-bold text-polymarket-primary text-sm"
              >
                {dealerValue}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {showInsurance && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-polymarket-warning font-medium">
              Insurance?
            </span>
            <Button size="small" variant="outline" onClick={onInsurance}>
              Accept
            </Button>
            <Button size="small" variant="ghost" onClick={onDeclineInsurance}>
              Decline
            </Button>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-center min-h-[140px]">
        <HandDisplay 
          cards={dealerHand} 
          size="medium" 
          faceUp={showDealerValue || dealerPlayed || phase === 'gameOver'}
          animated={settings.animations}
        />
      </div>
    </div>
  );
}

function PlayerArea({ 
  playerHands, 
  activeHandIndex, 
  phase, 
  handValue, 
  handSoft, 
  handBusted, 
  handBlackjack,
  canDouble, 
  canSplit, 
  currentBet, 
  balance,
  onHit, 
  onStand, 
  onDouble, 
  onSplit,
  settings,
}: { 
  playerHands: any[];
  activeHandIndex: number;
  phase: string;
  handValue: number;
  handSoft: boolean;
  handBusted: boolean;
  handBlackjack: boolean;
  canDouble: boolean;
  canSplit: boolean;
  currentBet: number;
  balance: number;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  settings: any;
}) {
  if (playerHands.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-polymarket-bgTeritary border border-polymarket-border/50 flex items-center justify-center">
            <span className="text-6xl opacity-30">♠</span>
          </div>
          <h3 className="text-xl font-medium text-polymarket-textMuted mb-2">Place your bet to start</h3>
          <p className="text-polymarket-textMuted/50">Select chips and press DEAL</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-end pb-4 animate-slide-up">
      {/* Multiple hands (split) */}
      {playerHands.length > 1 && (
        <div className="w-full max-w-4xl mb-6 flex flex-wrap justify-center gap-3">
          {playerHands.map((hand, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300',
                index === activeHandIndex 
                  ? 'border-polymarket-primary bg-polymarket-primaryDim shadow-glow-primary' 
                  : 'border-polymarket-border bg-polymarket-bgSecondary/50',
                hand.completed && 'opacity-60'
              )}
              style={{ minWidth: '200px' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-polymarket-textMuted uppercase">
                  Hand {index + 1}
                </span>
                {hand.doubled && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-polymarket-warning bg-polymarket-warning/10 rounded">
                    2×
                  </span>
                )}
                {hand.blackjack && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-polymarket-primary bg-polymarket-primaryDim rounded">
                    BJ
                  </span>
                )}
                {hand.busted && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-polymarket-danger bg-polymarket-dangerDim rounded">
                    BUST
                  </span>
                )}
              </div>
              <HandDisplay 
                cards={hand.cards} 
                size="small" 
                faceUp={true}
                animated={settings.animations}
              />
              <div className="font-mono font-bold text-polymarket-primary text-sm">
                {calculateHandValue(hand.cards).value}
              </div>
              <span className="text-xs text-polymarket-textMuted font-mono tabular-nums">
                ${hand.bet.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Single hand or active hand display */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-4">
        <motion.div
          key={activeHandIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center gap-4"
        >
          <HandDisplay 
            cards={playerHands[activeHandIndex]?.cards || []} 
            size="medium" 
            faceUp={true}
            animated={settings.animations}
          />

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <HandValueDisplay 
              value={handValue} 
              soft={handSoft} 
              busted={handBusted} 
              blackjack={handBlackjack} 
            />
            
            {playerHands[activeHandIndex]?.doubled && (
              <span className="px-3 py-1 bg-polymarket-warning/10 border border-polymarket-warning/30 rounded-xl text-xs font-bold text-polymarket-warning">
                DOUBLED
              </span>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        {phase === 'playerTurn' && !handBusted && !handBlackjack && playerHands[activeHandIndex] && !playerHands[activeHandIndex].completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-3 w-full max-w-4xl px-4"
          >
            <ActionButton
              label="HIT"
              onClick={onHit}
              variant="primary"
              shortcut="H"
              disabled={handBusted || handBlackjack}
            />
            <ActionButton
              label="STAND"
              onClick={onStand}
              variant="secondary"
              shortcut="S"
              disabled={handBusted || handBlackjack}
            />
            {canDouble && (
              <ActionButton
                label="DOUBLE"
                onClick={onDouble}
                variant="success"
                shortcut="D"
                disabled={balance < currentBet}
              />
            )}
            {canSplit && (
              <ActionButton
                label="SPLIT"
                onClick={onSplit}
                variant="secondary"
                shortcut="P"
                disabled={balance < currentBet}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function HandValueDisplay({ value, soft, busted, blackjack }: { value: number; soft: boolean; busted: boolean; blackjack: boolean }) {
  const displayValue = soft && value !== 21 ? `${value}/${value - 10}` : String(value);
  const color = busted ? 'text-polymarket-danger' : blackjack ? 'text-polymarket-primary' : 'text-polymarket-primary';
  const bgColor = busted ? 'bg-polymarket-dangerDim' : blackjack ? 'bg-polymarket-primaryDim' : 'bg-polymarket-primaryDim';
  const borderColor = busted ? 'border-polymarket-danger/30' : blackjack ? 'border-polymarket-primary/30' : 'border-polymarket-primary/30';

  return (
    <motion.div
      className={cn('px-4 py-2 rounded-xl font-mono font-bold text-lg', color, bgColor, borderColor, 'border')}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      key={value}
    >
      {displayValue}
      {soft && value !== 21 && (
        <span className="ml-1 text-xs font-normal opacity-70">(soft)</span>
      )}
      {blackjack && (
        <span className="ml-2 text-xs font-bold animate-pulse">★</span>
      )}
    </motion.div>
  );
}

function GameControls({ 
  phase, 
  currentBet, 
  selectedChip, 
  balance, 
  onChipSelect, 
  onClearBet, 
  onDeal, 
  onNewGame, 
  onRebetAndDeal,
  settings,
  canDeal,
  updateSettings,
}: { 
  phase: string;
  currentBet: number;
  selectedChip: number;
  balance: number;
  onChipSelect: (value: number) => void;
  onClearBet: () => void;
  onDeal: () => void;
  onNewGame: () => void;
  onRebetAndDeal: () => void;
  settings: any;
  canDeal: boolean;
  updateSettings: (settings: any) => void;
}) {
  if (phase === 'betting') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto mt-6 animate-slide-up"
      >
        <BettingControls
          currentBet={currentBet}
          selectedChip={selectedChip}
          balance={balance}
          onChipSelect={onChipSelect}
          onClearBet={onClearBet}
          onDeal={onDeal}
          canDeal={canDeal}
          settings={settings}
          phase={phase}
        />
      </motion.div>
    );
  }

  if (phase === 'gameOver') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto mt-6 animate-slide-up flex flex-col items-center gap-3"
      >
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Button 
            variant="primary" 
            size="large" 
            fullWidth={true}
            onClick={onNewGame}
            className="min-w-[160px]"
          >
            New Game
          </Button>
          {settings.autoRebet && currentBet > 0 && (
            <Button 
              variant="success" 
              size="large" 
              fullWidth={true}
              onClick={onRebetAndDeal}
              className="min-w-[160px]"
            >
              Rebet & Deal
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-polymarket-textMuted">
          <input
            type="checkbox"
            id="auto-rebet"
            checked={settings.autoRebet}
            onChange={(e) => e.target.checked !== settings.autoRebet && updateSettings({ autoRebet: e.target.checked })}
            className="w-4 h-4 rounded border-polymarket-border bg-polymarket-bgTeritary text-polymarket-primary focus:ring-polymarket-primary"
          />
          <label htmlFor="auto-rebet" className="cursor-pointer select-none">
            Auto Rebet
          </label>
        </div>
      </motion.div>
    );
  }

  return null;
}

function BettingControls({ 
  currentBet, 
  selectedChip, 
  balance, 
  onChipSelect, 
  onClearBet, 
  onDeal, 
  canDeal,
  settings,
  phase,
}: { 
  currentBet: number;
  selectedChip: number;
  balance: number;
  onChipSelect: (value: number) => void;
  onClearBet: () => void;
  onDeal: () => void;
  canDeal: boolean;
  settings: any;
  phase: string;
}) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-polymarket-border/50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-polymarket-textMuted tracking-wider uppercase">
            Chip Selection
          </span>
          <BetDisplay amount={currentBet} size="large" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          {CHIP_VALUES.map(value => (
            <Chip
              key={value}
              value={value}
              selected={selectedChip === value}
              disabled={currentBet + value > balance || phase !== 'betting'}
              onClick={() => onChipSelect(value)}
              size="medium"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {currentBet > 0 && (
          <Button 
            variant="secondary" 
            size="medium" 
            onClick={onClearBet}
            className="min-w-[120px]"
          >
            Clear Bet
          </Button>
        )}
        
        <Button 
          variant="primary" 
          size="large" 
          onClick={onDeal}
          disabled={!canDeal}
          className="min-w-[160px] flex-1 sm:flex-none"
        >
          {currentBet > 0 ? 'DEAL CARDS' : 'PLACE BET'}
        </Button>
      </div>

      {currentBet > 0 && (
        <p className="mt-4 text-center text-xs text-polymarket-textMuted">
          Total bet: <span className="font-mono text-polymarket-text">${currentBet.toLocaleString()}</span>
          {balance < currentBet && (
            <span className="text-polymarket-danger ml-2">(Insufficient funds)</span>
          )}
        </p>
      )}
    </div>
  );
}

function ResultBanner({ message }: { message: string }) {
  const isWin = message.includes('WIN') || message.includes('BLACKJACK');
  const isPush = message.includes('PUSH');
  
  return (
    <div className={cn(
      'relative px-6 py-4 rounded-2xl border text-center overflow-hidden',
      isWin 
        ? 'bg-polymarket-primaryDim border-polymarket-primary/30 shadow-glow-primary' 
        : isPush 
          ? 'bg-polymarket-warning/10 border-polymarket-warning/30' 
          : 'bg-polymarket-dangerDim border-polymarket-danger/30 shadow-glow-danger'
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-0 bg-[var(--tw-gradient-stops)]" style={{ 
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite'
      }} />
      
      <motion.p
        className="relative font-medium text-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ color: isWin ? '#00d4aa' : isPush ? '#f59e0b' : '#ef4444' }}
      >
        {message}
      </motion.p>
    </div>
  );
}

function IconButton({ 
  variant = 'ghost', 
  size = 'medium', 
  disabled, 
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: { 
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  'aria-label': string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizeMap = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-polymarket-primary to-[#00b894] text-polymarket-textInverse hover:from-[#00e8bb] hover:to-[#00d4aa] hover:shadow-glow-primary active:scale-[0.98]',
    secondary: 'bg-polymarket-bgTeritary border border-polymarket-border text-polymarket-text hover:bg-polymarket-border hover:border-polymarket-borderHover active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-polymarket-danger to-[#dc2626] text-white hover:from-[#f87171] hover:to-[#ef4444] hover:shadow-glow-danger active:scale-[0.98]',
    success: 'bg-gradient-to-r from-polymarket-success to-[#16a34a] text-white hover:from-[#4ade80] hover:to-[#22c55e] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] active:scale-[0.98]',
    ghost: 'bg-transparent text-polymarket-textMuted hover:text-polymarket-text hover:bg-polymarket-bgTeritary active:scale-[0.98]',
    outline: 'bg-transparent border border-polymarket-border text-polymarket-text hover:border-polymarket-primary hover:text-polymarket-primary hover:bg-polymarket-primaryDim active:scale-[0.98]',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-polymarket-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-polymarket-bg',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeMap[size],
        className
      )}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}