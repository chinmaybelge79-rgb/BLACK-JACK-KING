export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
  faceUp: boolean;
}

export interface Hand {
  cards: Card[];
  bet: number;
  doubled: boolean;
  stood: boolean;
  busted: boolean;
  blackjack: boolean;
  completed: boolean;
  split?: boolean;
  result?: 'win' | 'loss' | 'push' | 'blackjack';
}

export type GamePhase = 'betting' | 'dealing' | 'playerTurn' | 'insurance' | 'dealerTurn' | 'gameOver';

export interface GameState {
  phase: GamePhase;
  deck: Card[];
  playerHands: Hand[];
  dealerHand: Card[];
  activeHandIndex: number;
  balance: number;
  currentBet: number;
  selectedChip: number;
  insuranceBet: number;
  dealerPlayed: boolean;
  showResult: boolean;
  lastResult: string;
  stats: GameStats;
  settings: GameSettings;
}

export interface GameStats {
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  currentStreak: number;
  bestStreak: number;
}

export interface GameSettings {
  sound: boolean;
  animations: boolean;
  autoRebet: boolean;
  showHints: boolean;
  deckPenetration: number;
}

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const CHIP_VALUES = [1, 5, 25, 100, 500, 1000] as const;

export const CHIP_COLORS: Record<number, string> = {
  1: '#ffffff',
  5: '#ef4444',
  25: '#22c55e',
  100: '#0f0f17',
  500: '#a855f7',
  1000: '#f59e0b',
};

export const CHIP_TEXT_COLORS: Record<number, string> = {
  1: '#06060a',
  5: '#ffffff',
  25: '#06060a',
  100: '#ffffff',
  500: '#ffffff',
  1000: '#06060a',
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach((rank, index) => {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        faceUp: true,
      });
    });
  });
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardValue(card: Card): number {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return parseInt(card.rank, 10);
}

export function calculateHandValue(cards: Card[]): { value: number; soft: boolean; isBlackjack: boolean } {
  let value = 0;
  let aces = 0;
  
  cards.forEach(card => {
    const cardValue = getCardValue(card);
    value += cardValue;
    if (card.rank === 'A') aces++;
  });
  
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  const soft = aces > 0 && value <= 21;
  const isBlackjack = cards.length === 2 && value === 21;
  
  return { value, soft, isBlackjack };
}

export function isBust(cards: Card[]): boolean {
  return calculateHandValue(cards).value > 21;
}

export function canSplit(hand: Hand): boolean {
  return hand.cards.length === 2 && 
         getCardValue(hand.cards[0]) === getCardValue(hand.cards[1]) &&
         !hand.split;
}

export function canDouble(hand: Hand, balance: number): boolean {
  return hand.cards.length === 2 && !hand.doubled && balance >= hand.bet;
}

export function dealerShouldHit(cards: Card[]): boolean {
  const { value, soft } = calculateHandValue(cards);
  return value < 17 || (value === 17 && soft);
}

export function compareHands(playerCards: Card[], dealerCards: Card[]): 'win' | 'loss' | 'push' | 'blackjack' {
  const playerResult = calculateHandValue(playerCards);
  const dealerResult = calculateHandValue(dealerCards);
  
  const playerBJ = playerResult.isBlackjack;
  const dealerBJ = dealerResult.isBlackjack;
  const playerBust = isBust(playerCards);
  const dealerBust = isBust(dealerCards);
  
  if (playerBJ && dealerBJ) return 'push';
  if (playerBJ) return 'blackjack';
  if (dealerBJ) return 'loss';
  if (playerBust) return 'loss';
  if (dealerBust) return 'win';
  if (playerResult.value > dealerResult.value) return 'win';
  if (playerResult.value < dealerResult.value) return 'loss';
  return 'push';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}