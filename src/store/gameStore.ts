import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, GamePhase, Hand, Card, GameStats, GameSettings } from '../types/game';
import { createDeck, shuffleDeck, calculateHandValue, isBust, canSplit, canDouble, dealerShouldHit, compareHands, formatCurrency } from '../types/game';

interface GameStore extends GameState {
  // Actions
  setPhase: (phase: GamePhase) => void;
  placeBet: (amount: number) => void;
  clearBet: () => void;
  rebet: () => void;
  deal: () => void;
  hit: (handIndex?: number) => void;
  stand: (handIndex?: number) => void;
  doubleDown: (handIndex?: number) => void;
  split: (handIndex?: number) => void;
  takeInsurance: () => void;
  declineInsurance: () => void;
  playDealer: () => void;
  newGame: () => void;
  setSelectedChip: (chip: number) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetStats: () => void;
  addWinnings: (amount: number, resultType: 'win' | 'blackjack' | 'push') => void;
}

const INITIAL_BALANCE = 10000;
const INITIAL_BET = 100;

const defaultStats: GameStats = {
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,
  totalWagered: 0,
  totalWon: 0,
  biggestWin: 0,
  currentStreak: 0,
  bestStreak: 0,
};

const defaultSettings: GameSettings = {
  sound: true,
  animations: true,
  autoRebet: false,
  showHints: true,
  deckPenetration: 0.75,
  fourColorMode: false,
};

const defaultState: GameState = {
  phase: 'betting',
  deck: createDeck(),
  playerHands: [],
  dealerHand: [],
  activeHandIndex: 0,
  balance: INITIAL_BALANCE,
  currentBet: 0,
  selectedChip: INITIAL_BET,
  insuranceBet: 0,
  dealerPlayed: false,
  showResult: false,
  lastResult: '',
  stats: defaultStats,
  settings: defaultSettings,
};

function createInitialHand(bet: number): Hand {
  return {
    cards: [],
    bet,
    doubled: false,
    stood: false,
    busted: false,
    blackjack: false,
    completed: false,
  };
}

function checkBlackjack(hand: Hand): boolean {
  const { isBlackjack } = calculateHandValue(hand.cards);
  return isBlackjack;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setPhase: (phase) => set({ phase }),

      placeBet: (amount) => {
        const { balance, currentBet, phase } = get();
        if (phase !== 'betting') return;
        if (currentBet + amount > balance) return;
        
        set({ 
          currentBet: currentBet + amount,
          balance: balance - amount,
        });
      },

      clearBet: () => {
        const { currentBet, balance, phase } = get();
        if (phase !== 'betting') return;
        
        set({ 
          currentBet: 0,
          balance: balance + currentBet,
        });
      },

      rebet: () => {
        const { currentBet, balance, phase, settings } = get();
        if (phase !== 'betting' || currentBet > 0) return;
        const rebetAmount = settings.autoRebet ? currentBet : 0;
        if (balance < rebetAmount) return;
        
        const lastBet = currentBet;
        if (lastBet > 0 && balance >= lastBet) {
          set({ 
            currentBet: lastBet,
            balance: balance - lastBet,
          });
        }
      },

      setSelectedChip: (chip) => set({ selectedChip: chip }),

      deal: () => {
        const { currentBet, balance, deck, phase, settings } = get();
        if (phase !== 'betting' || currentBet === 0) return;
        if (currentBet > balance) return;

        // Reshuffle if deck penetration reached
        const penetration = settings.deckPenetration;
        if (deck.length < 52 * (1 - penetration)) {
          set({ deck: createDeck() });
        }

        const newDeck = [...deck];
        const playerHand = createInitialHand(currentBet);
        const dealerHand: Card[] = [];

        // Deal 2 cards to player, 2 to dealer (second dealer card face down)
        playerHand.cards.push({ ...newDeck.pop()!, faceUp: true });
        dealerHand.push({ ...newDeck.pop()!, faceUp: true });
        playerHand.cards.push({ ...newDeck.pop()!, faceUp: true });
        dealerHand.push({ ...newDeck.pop()!, faceUp: false });

        const playerBJ = checkBlackjack(playerHand);
        const dealerBJ = checkBlackjack({ ...createInitialHand(0), cards: dealerHand });

        set({
          phase: playerBJ || dealerBJ ? 'gameOver' : 'playerTurn',
          deck: newDeck,
          playerHands: [playerHand],
          dealerHand,
          activeHandIndex: 0,
          dealerPlayed: false,
          showResult: false,
          lastResult: '',
          insuranceBet: 0,
        });

        if (playerBJ || dealerBJ) {
          setTimeout(() => get().playDealer(), 1000);
        }
      },

      hit: (handIndex = 0) => {
        const { phase, deck, playerHands, activeHandIndex } = get();
        const index = handIndex ?? activeHandIndex;
        if (phase !== 'playerTurn' || deck.length === 0) return;
        if (index >= playerHands.length) return;
        
        const hand = playerHands[index];
        if (hand.stood || hand.busted || hand.completed) return;

        const newDeck = [...deck];
        const newCard = { ...newDeck.pop()!, faceUp: true };
        
        const newHands = [...playerHands];
        newHands[index] = {
          ...hand,
          cards: [...hand.cards, newCard],
        };

        const { value, isBlackjack } = calculateHandValue(newHands[index].cards);
        const busted = isBust(newHands[index].cards);

        if (busted) {
          newHands[index] = {
            ...newHands[index],
            busted: true,
            completed: true,
          };
        } else if (isBlackjack) {
          newHands[index] = {
            ...newHands[index],
            blackjack: true,
            completed: true,
          };
        }

        set({ 
          deck: newDeck,
          playerHands: newHands,
        });

        // Check if all hands are complete
        const allComplete = newHands.every(h => h.completed || h.busted || h.blackjack || h.stood);
        if (allComplete) {
          setTimeout(() => get().playDealer(), 500);
        }
      },

      stand: (handIndex = 0) => {
        const { phase, playerHands, activeHandIndex } = get();
        const index = handIndex ?? activeHandIndex;
        if (phase !== 'playerTurn') return;
        if (index >= playerHands.length) return;

        const hand = playerHands[index];
        if (hand.stood || hand.completed) return;

        const newHands = [...playerHands];
        newHands[index] = {
          ...hand,
          stood: true,
          completed: true,
        };

        set({ playerHands: newHands });

        // Check if all hands are complete
        const allComplete = newHands.every(h => h.completed || h.busted || h.blackjack);
        if (allComplete) {
          setTimeout(() => get().playDealer(), 500);
        } else if (get().playerHands.length > 1) {
          // Move to next hand in split scenario
          const nextIndex = newHands.findIndex((h, i) => i > index && !h.completed && !h.busted);
          if (nextIndex !== -1) {
            set({ activeHandIndex: nextIndex });
          }
        }
      },

      doubleDown: (handIndex = 0) => {
        const { phase, balance, playerHands, activeHandIndex, deck } = get();
        const index = handIndex ?? activeHandIndex;
        if (phase !== 'playerTurn' || deck.length === 0) return;
        if (index >= playerHands.length) return;

        const hand = playerHands[index];
        if (!canDouble(hand, balance)) return;

        const newDeck = [...deck];
        const newCard = { ...newDeck.pop()!, faceUp: true };
        const additionalBet = hand.bet;

        const newHands = [...playerHands];
        newHands[index] = {
          ...hand,
          cards: [...hand.cards, newCard],
          bet: hand.bet * 2,
          doubled: true,
          completed: true,
        };

        const busted = isBust(newHands[index].cards);
        if (busted) {
          newHands[index].busted = true;
        }

        set({ 
          deck: newDeck,
          playerHands: newHands,
          balance: balance - additionalBet,
        });

        // Check if all hands are complete
        const allComplete = newHands.every(h => h.completed || h.busted || h.blackjack);
        if (allComplete) {
          setTimeout(() => get().playDealer(), 500);
        }
      },

      split: (handIndex = 0) => {
        const { phase, balance, playerHands, activeHandIndex, deck } = get();
        const index = handIndex ?? activeHandIndex;
        if (phase !== 'playerTurn' || deck.length < 2) return;
        if (index >= playerHands.length) return;

        const hand = playerHands[index];
        if (!canSplit(hand) || balance < hand.bet) return;

        const newDeck = [...deck];
        const card1 = hand.cards[0];
        const card2 = hand.cards[1];

        // Create two new hands
        const hand1 = createInitialHand(hand.bet);
        hand1.cards = [card1, { ...newDeck.pop()!, faceUp: true }];

        const hand2 = createInitialHand(hand.bet);
        hand2.cards = [card2, { ...newDeck.pop()!, faceUp: true }];

        // Check for blackjacks on split hands
        if (checkBlackjack(hand1)) hand1.blackjack = true;
        if (checkBlackjack(hand2)) hand2.blackjack = true;

        const newHands = [
          ...playerHands.slice(0, index),
          hand1,
          hand2,
          ...playerHands.slice(index + 1),
        ];

        set({ 
          deck: newDeck,
          playerHands: newHands,
          balance: balance - hand.bet,
          activeHandIndex: index,
        });
      },

      takeInsurance: () => {
        const { currentBet, balance, phase } = get();
        if (phase !== 'insurance' && phase !== 'playerTurn') return;
        if (balance < currentBet / 2) return;

        set({ 
          insuranceBet: currentBet / 2,
          balance: balance - currentBet / 2,
          phase: 'playerTurn',
        });
      },

      declineInsurance: () => {
        set({ phase: 'playerTurn' });
      },

      playDealer: () => {
        const { dealerHand, deck, playerHands, insuranceBet } = get();
        if (dealerHand.length === 0) return;

        let newDeck = [...deck];
        let newDealerHand = dealerHand.map(c => ({ ...c, faceUp: true }));

        // Dealer plays
        while (dealerShouldHit(newDealerHand)) {
          if (newDeck.length === 0) break;
          newDealerHand.push({ ...newDeck.pop()!, faceUp: true });
        }

        const dealerValue = calculateHandValue(newDealerHand).value;
        const dealerBust = isBust(newDealerHand);

        // Resolve each player hand
        const resolvedHands = playerHands.map(hand => {
          if (hand.completed && !hand.busted && !hand.blackjack) {
            const result = compareHands(hand.cards, newDealerHand);
            return { ...hand, result, completed: true };
          }
          if (hand.busted) {
            return { ...hand, result: 'loss' as const, completed: true };
          }
          if (hand.blackjack) {
            return { ...hand, result: 'blackjack' as const, completed: true };
          }
          return hand;
        });

        // Calculate winnings
        let totalWinnings = 0;
        let resultMessages: string[] = [];
        let hasWin = false;
        let hasBlackjack = false;

        resolvedHands.forEach(hand => {
          let handWinnings = 0;
          switch (hand.result) {
            case 'win':
              handWinnings = hand.bet * 2;
              hasWin = true;
              resultMessages.push(`Hand ${hand.bet}: WIN ${formatCurrency(handWinnings)}`);
              break;
            case 'blackjack':
              handWinnings = hand.bet * 2.5;
              hasWin = true;
              hasBlackjack = true;
              resultMessages.push(`Hand ${hand.bet}: BLACKJACK! ${formatCurrency(handWinnings)}`);
              break;
            case 'push':
              handWinnings = hand.bet;
              resultMessages.push(`Hand ${hand.bet}: PUSH`);
              break;
            case 'loss':
              handWinnings = 0;
              resultMessages.push(`Hand ${hand.bet}: LOSS`);
              break;
          }
          totalWinnings += handWinnings;
        });

        // Insurance payout
        let insuranceMessage = '';
        if (insuranceBet > 0) {
          const dealerBJ = calculateHandValue(newDealerHand).isBlackjack;
          if (dealerBJ) {
            totalWinnings += insuranceBet * 3;
            insuranceMessage = ` Insurance pays ${formatCurrency(insuranceBet * 2)}!`;
          } else {
            insuranceMessage = ` Insurance lost.`;
          }
        }

        const finalBalance = get().balance + totalWinnings;
        const resultText = resultMessages.join(' | ') + insuranceMessage;

        // Update stats
        const { stats } = get();
        const newStats = { ...stats };
        if (hasBlackjack) newStats.blackjacks++;
        if (hasWin) {
          newStats.wins++;
          newStats.currentStreak++;
          newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
        } else if (resolvedHands.some(h => h.result === 'push')) {
          newStats.pushes++;
          newStats.currentStreak = 0;
        } else {
          newStats.losses++;
          newStats.currentStreak = 0;
        }
        newStats.totalWagered += resolvedHands.reduce((sum, h) => sum + h.bet, 0);
        newStats.totalWon += totalWinnings;
        newStats.biggestWin = Math.max(newStats.biggestWin, totalWinnings);

        set({
          phase: 'gameOver',
          dealerHand: newDealerHand,
          deck: newDeck,
          playerHands: resolvedHands,
          dealerPlayed: true,
          showResult: true,
          lastResult: resultText,
          balance: finalBalance,
          stats: newStats,
        });
      },

      newGame: () => {
        const { settings, currentBet, balance, deck } = get();
        
        // Reshuffle if needed
        const penetration = settings.deckPenetration;
        let newDeck = deck;
        if (deck.length < 52 * (1 - penetration)) {
          newDeck = createDeck();
        }

        const newBet = settings.autoRebet && currentBet > 0 && balance >= currentBet ? currentBet : 0;
        const newBalance = settings.autoRebet && currentBet > 0 && balance >= currentBet ? balance - currentBet : balance;

        set({
          phase: newBet > 0 ? 'dealing' : 'betting',
          deck: newDeck,
          playerHands: [],
          dealerHand: [],
          activeHandIndex: 0,
          currentBet: newBet,
          insuranceBet: 0,
          dealerPlayed: false,
          showResult: false,
          lastResult: '',
          balance: newBalance,
        });

        if (newBet > 0) {
          setTimeout(() => get().deal(), 300);
        }
      },

      updateSettings: (newSettings) => set(state => ({
        settings: { ...state.settings, ...newSettings },
      })),

      resetStats: () => set({ stats: defaultStats }),

      addWinnings: (amount, resultType) => set(state => ({
        balance: state.balance + amount,
        stats: {
          ...state.stats,
          totalWon: state.stats.totalWon + amount,
          biggestWin: Math.max(state.stats.biggestWin, amount),
        },
      })),
    }),
    {
      name: 'blackjack-game',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        balance: state.balance,
        stats: state.stats,
        settings: state.settings,
      }),
    }
  )
);

// Selectors for performance
export const useGamePhase = () => useGameStore(state => state.phase);
export const usePlayerHands = () => useGameStore(state => state.playerHands);
export const useDealerHand = () => useGameStore(state => state.dealerHand);
export const useActiveHandIndex = () => useGameStore(state => state.activeHandIndex);
export const useBalance = () => useGameStore(state => state.balance);
export const useCurrentBet = () => useGameStore(state => state.currentBet);
export const useSelectedChip = () => useGameStore(state => state.selectedChip);
export const useInsuranceBet = () => useGameStore(state => state.insuranceBet);
export const useDealerPlayed = () => useGameStore(state => state.dealerPlayed);
export const useShowResult = () => useGameStore(state => state.showResult);
export const useLastResult = () => useGameStore(state => state.lastResult);
export const useStats = () => useGameStore(state => state.stats);
export const useSettings = () => useGameStore(state => state.settings);
export const useDeck = () => useGameStore(state => state.deck);