'use client';

import { GameTable } from './components/GameTable';
import { useGameStore } from './store/gameStore';

export default function App() {
  // Initialize store on mount
  useGameStore.getState();

  return (
    <div className="min-h-screen bg-polymarket-bg">
      <GameTable />
    </div>
  );
}