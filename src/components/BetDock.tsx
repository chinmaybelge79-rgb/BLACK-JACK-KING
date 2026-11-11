'use client';

import { motion } from 'framer-motion';
import { ChipTray, BetStack } from './ChipTray';
import { formatCurrency, CHIP_DENOMINATIONS } from '../lib/chips';

interface BetDockProps {
  phase: 'betting' | 'playerTurn' | 'gameOver' | 'dealing';
  currentBet: number;
  selectedChip: number;
  balance: number;
  onChipSelect: (value: number) => void;
  onClearBet: () => void;
  onDeal: () => void;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onNewGame: () => void;
  onRebetAndDeal: () => void;
  canDouble: boolean;
  canSplit: boolean;
  canDeal: boolean;
  autoRebet: boolean;
  onToggleAutoRebet: () => void;
}

export function BetDock({ 
  phase, 
  currentBet, 
  selectedChip, 
  balance,
  onChipSelect,
  onClearBet,
  onDeal,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onNewGame,
  onRebetAndDeal,
  canDouble,
  canSplit,
  canDeal,
  autoRebet,
  onToggleAutoRebet,
}: BetDockProps) {
  const quickActions = [
    { label: 'Clear', action: onClearBet, disabled: currentBet === 0, variant: 'ghost' as const },
    { label: '1/2', action: () => onChipSelect(Math.max(1, Math.floor(currentBet / 2) - currentBet)), disabled: currentBet <= 1, variant: 'ghost' as const },
    { label: '2x', action: () => { if (currentBet * 2 <= balance) onChipSelect(currentBet); }, disabled: currentBet === 0 || currentBet * 2 > balance, variant: 'ghost' as const },
    { label: 'Max', action: () => { if (balance > currentBet) onChipSelect(balance - currentBet); }, disabled: balance <= currentBet, variant: 'ghost' as const },
  ];

  if (phase === 'betting') {
    return (
      <motion.div
        className="w-full max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="pm-surface p-4">
          {/* Top Row: Wager Display + Quick Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WAGER</span>
              <motion.span
                className="font-mono font-bold text-xl tabular-nums text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                key={currentBet}
              >
                {formatCurrency(currentBet)}
              </motion.span>
            </div>
            <div className="flex items-center gap-1.5">
              {quickActions.map(({ label, action, disabled, variant }) => (
                <button
                  key={label}
                  onClick={action}
                  disabled={disabled}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    variant === 'ghost'
                      ? 'text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed'
                      : ''
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Middle Row: Horizontal Chip Tray */}
          <ChipTray
            selectedValue={selectedChip}
            onSelect={onChipSelect}
            disabled={false}
            size="medium"
          />

          {/* Bottom Row: CTA Button */}
          <motion.button
            className="w-full mt-4 px-6 py-3.5 rounded-lg bg-emerald-500 text-white font-semibold text-base"
            onClick={onDeal}
            disabled={!canDeal}
            whileTap={{ scale: 0.98 }}
            whileHover={{ backgroundColor: '#059669' }}
            style={{ 
              background: canDeal ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
              boxShadow: canDeal ? '0 4px 20px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            DEAL CARDS
          </motion.button>

          {/* Auto Rebet Toggle */}
          <label className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRebet}
              onChange={onToggleAutoRebet}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 appearance-none cursor-pointer"
            />
            <span>Auto Rebet</span>
          </label>
        </div>
      </motion.div>
    );
  }

  if (phase === 'playerTurn') {
    return (
      <motion.div
        className="w-full max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="pm-surface p-4">
          {/* Active Bet Display */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ACTIVE BET</span>
              <div className="flex items-center gap-2">
                <BetStack amount={currentBet} size="medium" />
                <span className="font-mono font-bold text-lg tabular-nums text-emerald-400">
                  {formatCurrency(currentBet)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <ActionButton
              label="HIT"
              onClick={onHit}
              variant="primary"
              shortcut="H"
              leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
            />
            <ActionButton
              label="STAND"
              onClick={onStand}
              variant="secondary"
              shortcut="S"
              leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="16" y1="2" x2="16" y2="22"/></svg>}
            />
            {canDouble && (
              <ActionButton
                label="DOUBLE"
                onClick={onDouble}
                variant="primary"
                shortcut="D"
                leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
              />
            )}
            {canSplit && (
              <ActionButton
                label="SPLIT"
                onClick={onSplit}
                variant="secondary"
                shortcut="P"
                leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z"/><line x1="12" y1="19" x2="12" y2="5"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (phase === 'gameOver') {
    return (
      <motion.div
        className="w-full max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="pm-surface p-4">
          <div className="flex flex-col items-center gap-3">
            <motion.button
              className="w-full px-6 py-3.5 rounded-lg bg-emerald-500 text-white font-semibold text-base"
              onClick={onNewGame}
              whileTap={{ scale: 0.98 }}
              whileHover={{ backgroundColor: '#059669' }}
            >
              NEW GAME
            </motion.button>
            
            {autoRebet && currentBet > 0 && (
              <motion.button
                className="w-full px-6 py-3.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold text-base"
                onClick={onRebetAndDeal}
                whileTap={{ scale: 0.98 }}
                whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
              >
                REBET & DEAL
              </motion.button>
            )}

            <label className="flex items-center justify-center gap-2 text-sm text-slate-400 cursor-pointer w-full">
              <input
                type="checkbox"
                checked={autoRebet}
                onChange={onToggleAutoRebet}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 appearance-none cursor-pointer"
              />
              <span>Auto Rebet</span>
            </label>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

function ActionButton({ 
  label, 
  onClick, 
  variant = 'primary',
  shortcut,
  leftIcon,
}: { 
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  shortcut?: string;
  leftIcon?: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-lg font-semibold text-sm transition-all duration-150 ${
        variant === 'primary'
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 hover:border-slate-600'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
      whileTap={{ scale: 0.97 }}
    >
      <div className="flex items-center gap-1">
        {leftIcon}
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className="text-[10px] font-mono text-white/50 uppercase">[{shortcut}]</span>
      )}
    </motion.button>
  );
}