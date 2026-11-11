import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCardColor(suit: string): string {
  return suit === '♥' || suit === '♦' ? '#ef4444' : '#06060a';
}

export function getRankDisplay(rank: string): string {
  return rank;
}

export function getSuitDisplay(suit: string): string {
  const suits: Record<string, string> = {
    '♠': '♠',
    '♥': '♥',
    '♦': '♦',
    '♣': '♣',
  };
  return suits[suit] || suit;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}