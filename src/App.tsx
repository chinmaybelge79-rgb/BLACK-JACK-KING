'use client';

import { GameTable } from './components/GameTable';
import { useGameStore } from './store/gameStore';
import './styles/polymarket.css';

export default function App() {
  useGameStore.getState();

  return (
    <div className="min-h-screen w-full">
      <GameTable />
    </div>
  );
}