import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { soundManager } from '../lib/sounds';

export const useGameEvents = () => {
  const { fen, lastMove, isCheck, isCheckmate, isDraw, isStalemate } = useGameStore();
  const { soundEnabled } = useSettingsStore();

  useEffect(() => {
    if (!soundEnabled || fen === 'start') return;

    if (isCheckmate || isDraw || isStalemate) {
      soundManager.play('gameEnd');
    } else if (isCheck) {
      soundManager.play('check');
    } else if (lastMove?.captured) {
      soundManager.play('capture');
    } else {
      soundManager.play('move');
    }
  }, [fen, lastMove, isCheck, isCheckmate, isDraw, isStalemate, soundEnabled]);
};
