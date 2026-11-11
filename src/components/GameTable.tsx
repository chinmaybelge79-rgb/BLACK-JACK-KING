'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, HandDisplay } from './PlayingCard';
import { BetDock } from './BetDock';
import { useGameStore, useGamePhase, usePlayerHands, useDealerHand, useActiveHandIndex, useBalance, useCurrentBet, useSelectedChip, useInsuranceBet, useDealerPlayed, useShowResult, useLastResult, useStats, useSettings, useDeck } from '../store/gameStore';
import { calculateHandValue, isBust, canSplit, canDouble, formatCurrency } from '../types/game';
import { Shield, Crown, Zap, RefreshCw, Settings, Volume2, VolumeX, ChevronDown, Check, X } from 'lucide-react';

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
    placeBet(value);
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
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="text-center">
          <motion.div
            className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-400 font-medium text-sm">Loading table...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 overflow-hidden">
      {/* Top Bar - Compact Casino HUD */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-white/10 backdrop-blur-sm z-10" style={{ background: 'rgba(15, 23, 42, 0.9)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Bankroll & Stats */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(22, 31, 48, 0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">BANKROLL</span>
              </div>
              <motion.span
                className="font-mono font-bold text-lg tabular-nums" style={{ color: '#FBBF24', textShadow: '0 0 16px rgba(251, 191, 36, 0.4)' }}
                animate={{ textShadow: ['0 0 0 transparent', '0 0 16px rgba(251, 191, 36, 0.5)', '0 0 0 transparent'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {formatCurrency(balance)}
              </motion.span>
            </div>
            
            <div className="flex items-center gap-2 ml-3 border-l border-white/10 pl-3 hidden sm:flex">
              <StatPill label="W" value={stats.wins} variant="win" icon={<Check className="w-3 h-3" />} />
              <StatPill label="L" value={stats.losses} variant="loss" icon={<X className="w-3 h-3" />} />
              <StatPill label="P" value={stats.pushes} variant="neutral" icon={<Shield className="w-3 h-3" />} />
              <StatPill label="BJ" value={stats.blackjacks} variant="win" icon={<Crown className="w-3 h-3" />} />
            </div>
          </div>

          {/* Settings Dropdown */}
          <SettingsDropdown settings={settings} updateSettings={updateSettings} />
        </div>
      </header>

      {/* Main Game Area - Flex Layout for 100dvh Fit */}
      <main className="flex-1 flex flex-col min-h-0 relative z-0">
        {/* Dealer Zone */}
<DealerZone
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
          dealAnimationKey={dealAnimationKey}
        />

        {/* Flex Spacer - Pushes Player Zone to bottom */}
        <div className="flex-1 flex flex-col justify-end min-h-0" />

        {/* Player Zone */}
        <PlayerZone
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
          dealAnimationKey={dealAnimationKey}
        />

        {/* Bet Dock - Anchored at Bottom */}
        <div className="flex-shrink-0 px-4 pb-4">
          <BetDock
            phase={phase === 'dealerTurn' ? 'playerTurn' : phase as 'betting' | 'playerTurn' | 'gameOver' | 'dealing'}
            currentBet={currentBet}
            selectedChip={selectedChip}
            balance={balance}
            onChipSelect={handleChipClick}
            onClearBet={clearBet}
            onDeal={handleDeal}
            onHit={() => hit(activeHandIndex)}
            onStand={() => stand(activeHandIndex)}
            onDouble={() => doubleDown(activeHandIndex)}
            onSplit={() => split(activeHandIndex)}
            onNewGame={handleNewGame}
            onRebetAndDeal={handleRebetAndDeal}
            canDouble={canDoubleCurrent}
            canSplit={canSplitCurrent}
            canDeal={currentBet > 0}
            autoRebet={settings.autoRebet}
            onToggleAutoRebet={() => updateSettings({ autoRebet: !settings.autoRebet })}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 px-4 py-2 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>Blackjack pays 3:2 • Dealer stands on soft 17 • Insurance pays 2:1</span>
          <div className="flex items-center gap-3">
            <span className="font-mono tabular-nums">{deck.length} cards</span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
              {settings.fourColorMode ? '4-COLOR' : '2-COLOR'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatPill({ label, value, variant, icon }: { label: string; value: number; variant: 'win' | 'loss' | 'neutral'; icon: React.ReactNode }) {
  const colors = {
    win: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    loss: 'bg-red-500/15 text-red-400 border-red-500/30',
    neutral: 'bg-white/5 text-slate-400 border-white/10',
  };
  
  return (
    <div className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg border ${colors[variant]}`}>
      <div className="flex items-center gap-1">
        <span className="font-mono font-bold text-sm tabular-nums">{value}</span>
        {icon}
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function SettingsDropdown({ settings, updateSettings }: { settings: any; updateSettings: (s: any) => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggles = [
    { key: 'sound', label: 'Sound', icon: settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" /> },
    { key: 'animations', label: 'Animations', icon: <Zap className="w-4 h-4" /> },
    { key: 'fourColorMode', label: '4-Color Deck', icon: <Crown className="w-4 h-4" />, desc: 'Diamonds=Blue, Clubs=Green' },
    { key: 'autoRebet', label: 'Auto Rebet', icon: <RefreshCw className="w-4 h-4" /> },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5" />
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-48"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
              padding: '8px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
              zIndex: 50,
            }}
          >
            <div className="space-y-2">
              {toggles.map(({ key, label, icon, desc }) => (
                <SettingToggle
                  key={key}
                  label={label}
                  value={settings[key]}
                  onChange={(v) => updateSettings({ [key]: v })}
                  icon={icon}
                  desc={desc}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingToggle({ label, value, onChange, icon, desc }: { label: string; value: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; desc?: string }) {
  return (
    <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer group">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="relative w-10 h-5.5 rounded-full border-2 transition-all duration-200" style={{
          borderColor: value ? '#10B981' : 'rgba(148, 163, 184, 0.5)',
          background: value ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'rgba(30, 41, 59, 0.8)',
        }}>
          <motion.div
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-lg"
            animate={{ x: value ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
        </div>
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-white font-medium text-sm truncate">{label}</span>
        </div>
        {desc && <span className="text-slate-500 text-[11px] ml-6">{desc}</span>}
      </div>
    </label>
  );
}

function DealerZone({ 
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
  dealAnimationKey: number;
}) {
  return (
    <div className="flex-shrink-0 px-4 py-4 animate-in">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">DEALER</span>
            <AnimatePresence mode="wait">
              {showDealerValue && dealerHand.length > 0 && (
                <HandValueBadge 
                  value={dealerValue} 
                  busted={dealerBusted} 
                  blackjack={dealerBlackjack}
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
              <button onClick={onInsurance} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 text-white hover:bg-white/5 transition-colors">
                Accept
              </button>
              <button onClick={onDeclineInsurance} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors">
                Decline
              </button>
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
    </div>
  );
}

function PlayerZone({ 
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
  dealAnimationKey: number;
}) {
  if (playerHands.length === 0) {
    return (
      <div className="flex-shrink-0 px-4 pb-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <span className="text-5xl opacity-20">♠</span>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-1">Place your bet to start</h3>
          <p className="text-slate-500 text-sm">Select chips and press DEAL CARDS</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 px-4 pb-4 animate-in">
      <div className="max-w-5xl mx-auto">
        {/* Multiple hands (split) */}
        {playerHands.length > 1 && (
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {playerHands.map((hand, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 relative ${
                  index === activeHandIndex 
                    ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_24px_rgba(16,185,129,0.15)]' 
                    : 'border-white/10 bg-white/5'
                } ${hand.completed ? 'opacity-60' : ''}`}
                style={{ minWidth: '180px' }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-950" style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)',
                }}>
                  {formatCurrency(hand.bet)}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Hand {index + 1}</span>
                  {hand.doubled && <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 rounded-full">2×</span>}
                  {hand.blackjack && <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-1"><Crown className="w-2.5 h-2.5" /> BJ</span>}
                  {hand.busted && <span className="px-1.5 py-0.5 text-[9px] font-bold text-red-300 bg-red-500/20 border border-red-500/30 rounded-full">BUST</span>}
                </div>
                <HandDisplay cards={hand.cards} size="small" faceUp={true} animated={settings.animations} />
                <HandValueBadge value={calculateHandValue(hand.cards).value} busted={hand.busted} blackjack={hand.blackjack} soft={calculateHandValue(hand.cards).soft} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Active hand */}
        <motion.div
          key={activeHandIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center gap-3"
        >
          <HandDisplay 
            cards={playerHands[activeHandIndex]?.cards || []} 
            size="large" 
            faceUp={true}
            animated={settings.animations}
            
          />

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <HandValueBadge value={handValue} soft={handSoft} busted={handBusted} blackjack={handBlackjack} />
            
            {playerHands[activeHandIndex]?.doubled && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> DOUBLED
              </motion.span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function HandValueBadge({ value, soft, busted, blackjack }: { value: number; soft?: boolean; busted: boolean; blackjack: boolean }) {
  const displayValue = soft && value !== 21 ? `${value}/${value - 10}` : String(value);
  
  if (busted) {
    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-3 py-1.5 rounded-lg font-mono font-bold text-base flex items-center gap-2"
        style={{ 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#FCA5A5',
          boxShadow: '0 0 16px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
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
        className="px-3 py-1.5 rounded-lg font-mono font-bold text-base flex items-center gap-2"
        style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          color: '#34D399',
          boxShadow: '0 0 24px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <span className="relative">
          {displayValue}
          <span className="absolute -top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
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
      className="px-3 py-1.5 rounded-lg font-mono font-bold text-base flex items-center gap-2"
      style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#34D399',
        boxShadow: '0 0 12px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {displayValue}
      {soft && value !== 21 && (
        <span className="text-xs font-normal opacity-70 px-2 py-0.5 rounded bg-slate-800/50">SOFT</span>
      )}
    </motion.span>
  );
}