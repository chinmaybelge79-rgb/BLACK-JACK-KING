'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { PlayingCard, HandDisplay, CardBackComponent } from './PlayingCard';
import { Button, ActionButton } from './Button';
import { Chip, ChipStack, BetDisplay, BettingCircle } from './Chip';
import { useGameStore, useGamePhase, usePlayerHands, useDealerHand, useActiveHandIndex, useBalance, useCurrentBet, useSelectedChip, useInsuranceBet, useDealerPlayed, useShowResult, useLastResult, useStats, useSettings, useDeck } from '../store/gameStore';
import { calculateHandValue, isBust, canSplit, canDouble, CHIP_VALUES } from '../types/game';
import { Loader2, Volume2, VolumeX, Settings, RefreshCw, Check, X, ChevronDown, Crown, Zap, Shield } from 'lucide-react';

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
  
  // Mutable copy of CHIP_VALUES for array operations
  const chipValues = [...CHIP_VALUES] as number[];
  
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
  const [flyingChips, setFlyingChips] = useState<Array<{ value: number; id: string; targetX: number; targetY: number }>>([]);
  const bettingCircleRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dealAnimationKey, setDealAnimationKey] = useState(0);

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
  const dealerBusted = dealerHand.length > 0 && isBust(dealerHand);
  const dealerBlackjack = dealerHand.length >= 2 && calculateHandValue(dealerHand).isBlackjack;

  const canDoubleCurrent = activeHand && canDouble(activeHand, balance);
  const canSplitCurrent = activeHand && canSplit(activeHand) && balance >= activeHand.bet;
  const dealerShowingAce = dealerHand.length > 0 && dealerHand[0].rank === 'A' && dealerHand[0].faceUp;

  const handleChipClick = useCallback((value: number) => {
    if (phase !== 'betting') return;
    if (currentBet + value > balance) return;
    
    const id = `${value}-${Date.now()}`;
    const circleRect = bettingCircleRef.current?.getBoundingClientRect();
    const chipRect = document.querySelector(`[data-chip-value="${value}"]`)?.getBoundingClientRect();
    
    if (circleRect && chipRect) {
      const targetX = chipRect.left - circleRect.left + (Math.random() - 0.5) * 20;
      const targetY = chipRect.top - circleRect.top + (Math.random() - 0.5) * 20 - 100;
      setFlyingChips(prev => [...prev, { value, id, targetX, targetY }]);
    }
    
    placeBet(value);
    
    setTimeout(() => {
      setFlyingChips(prev => prev.filter(c => c.id !== id));
    }, 600);
  }, [phase, currentBet, balance, placeBet]);

  const handleDeal = useCallback(() => {
    if (phase !== 'betting') return;
    if (currentBet === 0) return;
    setDealAnimationKey(k => k + 1);
    deal();
  }, [phase, currentBet, deal]);

  const handleNewGame = useCallback(() => {
    newGame();
  }, [newGame]);

  const handleRebetAndDeal = useCallback(() => {
    if (phase !== 'betting') return;
    if (currentBet > 0) {
      setDealAnimationKey(k => k + 1);
      deal();
    }
  }, [phase, currentBet, deal]);

  const showInsurance = phase === 'playerTurn' && dealerShowingAce && insuranceBet === 0 && balance >= currentBet / 2;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-table-felt flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-slate-400 font-medium">Preparing table...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-table-felt relative overflow-hidden">
      {/* Casino atmospheric lighting */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Main emerald glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl opacity-60" style={{ filter: 'blur(120px)' }} />
        {/* Secondary indigo glow */}
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl opacity-40" style={{ filter: 'blur(100px)' }} />
        {/* Center table highlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-emerald-500/3 blur-3xl" style={{ filter: 'blur(150px)' }} />
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50" />
        {/* Subtle felt texture */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Top Bar - Casino HUD */}
      <header className="relative z-20 px-4 md:px-6 py-4 border-b border-slate-800/50 backdrop-blur-sm" style={{ background: 'rgba(11, 13, 18, 0.8)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Balance & Stats */}
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <div className="relative flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ 
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">BANKROLL</span>
              </div>
              <motion.span
                className="font-mono font-bold text-xl tabular-nums" style={{ color: '#FBBF24', textShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }}
                animate={{ textShadow: ['0 0 0 transparent', '0 0 20px rgba(251, 191, 36, 0.6)', '0 0 0 transparent'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                ${balance.toLocaleString()}
              </motion.span>
            </div>
            
            <div className="flex items-center gap-2 ml-4 border-l border-slate-700/50 pl-4 hidden sm:flex">
              <StatBadge label="W" value={stats.wins} color="text-emerald-400" icon={<Check className="w-3 h-3" />} />
              <StatBadge label="L" value={stats.losses} color="text-rose-400" icon={<X className="w-3 h-3" />} />
              <StatBadge label="P" value={stats.pushes} color="text-amber-400" icon={<Shield className="w-3 h-3" />} />
              <StatBadge label="BJ" value={stats.blackjacks} color="text-emerald-400" icon={<Crown className="w-3 h-3" />} />
            </div>
          </div>

          {/* Settings & Four Color Mode */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSettings && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 p-3 rounded-2xl shadow-2xl z-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div className="space-y-3">
                      <SettingToggle 
                        label="Sound Effects" 
                        value={settings.sound} 
                        onChange={(v) => updateSettings({ sound: v })}
                        icon={<Volume2 className="w-4 h-4" />}
                        iconOff={<VolumeX className="w-4 h-4" />}
                      />
                      <SettingToggle 
                        label="Animations" 
                        value={settings.animations} 
                        onChange={(v) => updateSettings({ animations: v })}
                        icon={<Zap className="w-4 h-4" />}
                      />
                      <SettingToggle 
                        label="4-Color Deck" 
                        value={settings.fourColorMode} 
                        onChange={(v) => updateSettings({ fourColorMode: v })}
                        icon={<Crown className="w-4 h-4" />}
                        description="Diamonds=Blue, Clubs=Green"
                      />
                      <SettingToggle 
                        label="Auto Rebet" 
                        value={settings.autoRebet} 
                        onChange={(v) => updateSettings({ autoRebet: v })}
                        icon={<RefreshCw className="w-4 h-4" />}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Flying Chips Animation */}
      <AnimatePresence>
        {flyingChips.map(({ value, id, targetX, targetY }) => (
          <Chip
            key={id}
            value={value}
            flying
            flyTarget={{ x: targetX, y: targetY }}
            size="medium"
          />
        ))}
      </AnimatePresence>

      {/* Main Game Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col">
        {/* Table Markings */}
        <TableMarkings dealerPlayed={dealerPlayed} phase={phase} />

        {/* Dealer Area */}
        <DealerArea 
          dealerHand={dealerHand} 
          dealerValue={dealerValue}
          dealerBusted={dealerBusted}
          dealerBlackjack={dealerBlackjack}
          showDealerValue={showDealerValue}
          phase={phase}
          dealerPlayed={dealerPlayed}
          showInsurance={showInsurance}
          onInsurance={takeInsurance}
          onDeclineInsurance={declineInsurance}
          settings={settings}
          fourColorMode={settings.fourColorMode}
          dealAnimationKey={dealAnimationKey}
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
            fourColorMode={settings.fourColorMode}
            dealAnimationKey={dealAnimationKey}
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
            bettingCircleRef={bettingCircleRef}
            flyingChips={flyingChips}
            chipValues={chipValues}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 md:px-6 py-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-slate-500 tracking-wider">
            Blackjack pays 3:2 • Dealer stands on soft 17 • Insurance pays 2:1
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="font-mono tabular-nums">{deck.length} cards</span>
            <span className="px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">
              {settings.fourColorMode ? '4-COLOR' : '2-COLOR'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SettingToggle({ label, value, onChange, icon, iconOff, description }: { 
  label: string; 
  value: boolean; 
  onChange: (v: boolean) => void; 
  icon: React.ReactNode;
  iconOff?: React.ReactNode;
  description?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 rounded-full border-2 transition-all duration-200" style={{
          borderColor: value ? '#10B981' : 'rgba(100, 116, 139, 0.5)',
          background: value ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'rgba(30, 41, 59, 0.8)',
        }}>
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-lg"
            animate={{ x: value ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
        </div>
      </div>
      <div className="flex-1 text-left">
        <span className="text-slate-100 font-medium text-sm">{label}</span>
        {description && <span className="text-slate-500 text-xs">{description}</span>}
      </div>
      <div className="flex items-center">
        {value ? icon : iconOff}
      </div>
    </label>
  );
}

function StatBadge({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl" style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(100, 116, 139, 0.2)',
      backdropFilter: 'blur(10px)',
    }}>
      <div className="flex items-center gap-1">
        <span className={cn('font-mono font-bold text-sm tabular-nums', color)}>{value}</span>
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function TableMarkings({ dealerPlayed, phase }: { dealerPlayed: boolean; phase: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Dealer zone semi-circle */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-t-full" style={{
        border: '1px solid rgba(16, 185, 129, 0.1)',
        background: 'radial-gradient(ellipse at center top, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
      }}>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">DEALER</span>
          <div className="text-[10px] text-slate-700 mt-1">MUST STAND ON 17</div>
        </div>
      </div>

      {/* Player zone semi-circle */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-b-full" style={{
        border: '1px solid rgba(16, 185, 129, 0.1)',
        background: 'radial-gradient(ellipse at center bottom, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
      }}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">PLAYER</span>
          <div className="text-[10px] text-slate-700 mt-1">BLACKJACK PAYS 3 TO 2</div>
        </div>
      </div>

      {/* Center betting circle marking */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full" style={{
        border: '1px dashed rgba(16, 185, 129, 0.2)',
        background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        animation: 'pulse-ring 3s ease-in-out infinite',
      }} />

      {/* Insurance line when dealer shows Ace */}
      {(phase === 'playerTurn' || phase === 'insurance') && (
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[300px] h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent)',
        }}>
          <span className="absolute left-1/2 -translate-x-1/2 -top-6 text-center text-[10px] font-medium text-amber-400/80 uppercase tracking-wider">
            INSURANCE LINE
          </span>
        </div>
      )}
    </div>
  );
}

function DealerArea({ 
  dealerHand, 
  dealerValue, 
  dealerBusted, 
  dealerBlackjack,
  showDealerValue, 
  phase, 
  dealerPlayed, 
  showInsurance, 
  onInsurance, 
  onDeclineInsurance,
  settings,
  fourColorMode,
  dealAnimationKey,
}: { 
  dealerHand: any[];
  dealerValue: number;
  dealerBusted: boolean;
  dealerBlackjack: boolean;
  showDealerValue: boolean;
  phase: string;
  dealerPlayed: boolean;
  showInsurance: boolean;
  onInsurance: () => void;
  onDeclineInsurance: () => void;
  settings: any;
  fourColorMode: boolean;
  dealAnimationKey: number;
}) {
  return (
    <div className="relative mb-10 animate-slide-down" style={{ perspective: '1200px' }}>
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">DEALER</span>
          <AnimatePresence mode="wait">
            {showDealerValue && dealerHand.length > 0 && (
              <HandValuePill 
                value={dealerValue} 
                busted={dealerBusted} 
                blackjack={dealerBlackjack}
                soft={false}
                key="dealer-value"
              />
            )}
          </AnimatePresence>
        </div>
        
        {showInsurance && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" /> Insurance?
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

      <div className="flex items-center justify-center min-h-[160px]">
        <HandDisplay 
          cards={dealerHand} 
          size="medium" 
          faceUp={showDealerValue || dealerPlayed || phase === 'gameOver'}
          animated={settings.animations}
          fourColorMode={fourColorMode}
          dealFromShoe={true}
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
  fourColorMode,
  dealAnimationKey,
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
  fourColorMode: boolean;
  dealAnimationKey: number;
}) {
  if (playerHands.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-12"
        >
          <div className="w-28 h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
          }}>
            <span className="text-7xl opacity-20">♠</span>
          </div>
          <h3 className="text-xl font-medium text-slate-300 mb-2">Place your bet to start</h3>
          <p className="text-slate-500">Select chips and press DEAL CARDS</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-end pb-6 animate-slide-up">
      {/* Multiple hands (split) */}
      {playerHands.length > 1 && (
        <div className="w-full max-w-4xl mb-8 flex flex-wrap justify-center gap-4">
          {playerHands.map((hand, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 relative',
                index === activeHandIndex 
                  ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                  : 'border-slate-700/50 bg-slate-900/50',
                hand.completed && 'opacity-60'
              )}
              style={{ minWidth: '220px' }}
            >
              {/* Hand bet indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-slate-950" style={{
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                boxShadow: '0 2px 10px rgba(251, 191, 36, 0.4)',
              }}>
                ${hand.bet.toLocaleString()}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Hand {index + 1}</span>
                {hand.doubled && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded-full">
                    2×
                  </span>
                )}
                {hand.blackjack && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" /> BJ
                  </span>
                )}
                {hand.busted && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 rounded-full">
                    BUST
                  </span>
                )}
              </div>
              <HandDisplay 
                cards={hand.cards} 
                size="small" 
                faceUp={true}
                animated={settings.animations}
                fourColorMode={fourColorMode}
              />
              <HandValuePill 
                value={calculateHandValue(hand.cards).value} 
                busted={hand.busted} 
                blackjack={hand.blackjack}
                soft={calculateHandValue(hand.cards).soft}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Single hand or active hand display */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-5">
        <motion.div
          key={activeHandIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center gap-5"
        >
          <HandDisplay 
            cards={playerHands[activeHandIndex]?.cards || []} 
            size="large" 
            faceUp={true}
            animated={settings.animations}
            fourColorMode={fourColorMode}
          />

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <HandValuePill 
              value={handValue} 
              soft={handSoft} 
              busted={handBusted} 
              blackjack={handBlackjack} 
            />
            
            {playerHands[activeHandIndex]?.doubled && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> DOUBLED
              </motion.span>
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
              leftIcon={<Zap className="w-4 h-4" />}
              disabled={handBusted || handBlackjack}
            />
            <ActionButton
              label="STAND"
              onClick={onStand}
              variant="secondary"
              shortcut="S"
              leftIcon={<Shield className="w-4 h-4" />}
              disabled={handBusted || handBlackjack}
            />
            {canDouble && (
              <ActionButton
                label="DOUBLE"
                onClick={onDouble}
                variant="success"
                shortcut="D"
                leftIcon={<Zap className="w-4 h-4" />}
                disabled={balance < currentBet}
              />
            )}
            {canSplit && (
              <ActionButton
                label="SPLIT"
                onClick={onSplit}
                variant="outline"
                shortcut="P"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                disabled={balance < currentBet}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function HandValuePill({ 
  value, 
  soft, 
  busted, 
  blackjack 
}: { 
  value: number; 
  soft: boolean; 
  busted: boolean; 
  blackjack: boolean;
}) {
  const displayValue = soft && value !== 21 ? `${value}/${value - 10}` : String(value);
  
  if (busted) {
    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-4 py-2 rounded-xl font-mono font-bold text-lg flex items-center gap-2"
        style={{ 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#FCA5A5',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
          {displayValue}
        </motion.span>
        <span className="text-xs font-bold animate-pulse">BUST</span>
      </motion.span>
    );
  }

  if (blackjack) {
    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-4 py-2 rounded-xl font-mono font-bold text-lg flex items-center gap-2"
        style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          color: '#34D399',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <span className="relative">
          {displayValue}
          <span className="absolute -top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75" />
        </span>
        <span className="text-xs font-bold flex items-center gap-1">
          <Crown className="w-3 h-3 animate-bounce" /> BLACKJACK
        </span>
      </motion.span>
    );
  }

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      key={value}
      className="px-4 py-2 rounded-xl font-mono font-bold text-lg flex items-center gap-2"
      style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#34D399',
        boxShadow: '0 0 15px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {displayValue}
      {soft && value !== 21 && (
        <span className="text-xs font-normal opacity-70 px-2 py-0.5 rounded bg-slate-800/50">SOFT</span>
      )}
    </motion.span>
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
  bettingCircleRef,
  flyingChips,
  chipValues,
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
  bettingCircleRef: React.RefObject<HTMLDivElement | null>;
  flyingChips: Array<{ value: number; id: string; targetX: number; targetY: number }>;
  chipValues: number[];
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
          flyingChips={flyingChips}
          chipValues={chipValues}
        />
      </motion.div>
    );
  }

  if (phase === 'gameOver') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto mt-6 animate-slide-up flex flex-col items-center gap-4"
      >
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Button 
            variant="primary" 
            size="large" 
            fullWidth={true}
            onClick={onNewGame}
            className="min-w-[160px]"
            leftIcon={<RefreshCw className="w-4 h-4" />}
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
              leftIcon={<Zap className="w-4 h-4" />}
            >
              Rebet & Deal
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoRebet}
              onChange={(e) => e.target.checked !== settings.autoRebet && updateSettings({ autoRebet: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 appearance-none"
            />
            <span>Auto Rebet</span>
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
  flyingChips,
  chipValues,
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
  flyingChips: Array<{ value: number; id: string; targetX: number; targetY: number }>;
  chipValues: number[];
}) {
  // Create chip positions for betting circle display
  const chipCounts = chipValues.map((v: number) => ({
    value: v,
    count: Math.floor((currentBet % (v * 10)) / v) // Simplified for display
  })).filter((c: { count: number }) => c.count > 0);

  const totalChipsInCircle = Math.min(chipCounts.reduce((sum: number, c: { count: number }) => sum + c.count, 0), 12);

  return (
    <div className="relative" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '24px', backdropFilter: 'blur(20px)' }}>
      {/* Betting Circle */}
      <div className="p-8">
        <BettingCircle 
          chips={Array.from({ length: totalChipsInCircle }, (_, i) => ({
            value: chipValues[i % chipValues.length],
            x: (Math.random() - 0.5) * 30,
            y: (Math.random() - 0.5) * 30,
            rotation: (Math.random() - 0.5) * 15,
          }))}
          totalBet={currentBet}
        />
      </div>

      <div className="px-6 pb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">CHIP SELECTION</span>
            <BetDisplay amount={currentBet} size="large" />
          </div>
          
          <ChipStack
            chips={chipValues}
            selectedValue={selectedChip}
            onSelect={onChipSelect}
            disabled={phase !== 'betting'}
            size="medium"
            horizontal={true}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {currentBet > 0 && (
            <Button 
              variant="secondary" 
              size="medium" 
              onClick={onClearBet}
              className="min-w-[130px]"
              leftIcon={<X className="w-4 h-4" />}
            >
              Clear Bet
            </Button>
          )}
          
          <Button 
            variant="primary" 
            size="large" 
            onClick={onDeal}
            disabled={!canDeal}
            className="min-w-[180px] flex-1 sm:flex-none"
            leftIcon={currentBet > 0 ? <Zap className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
          >
            {currentBet > 0 ? 'DEAL CARDS' : 'PLACE BET'}
          </Button>
        </div>

        {currentBet > 0 && (
          <p className="mt-4 text-center text-xs text-slate-500">
            Total bet: <span className="font-mono text-slate-100">${currentBet.toLocaleString()}</span>
            {balance < currentBet && (
              <span className="text-rose-400 ml-2">(Insufficient funds)</span>
            )}
          </p>
        )}
      </div>
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
        ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
        : isPush 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-rose-500/10 border-rose-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-0" style={{ 
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite'
      }} />
      
      <motion.p
        className="relative font-medium text-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ color: isWin ? '#34D399' : isPush ? '#FBBF24' : '#F87171' }}
      >
        {message}
      </motion.p>
    </div>
  );
}