'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';

interface BettingState {
  matchId: string | null;
  amount: number;
  status: 'idle' | 'pending' | 'settled' | 'failed';
}

export function useBetting() {
  const [bettingState, setBettingState] = useState<BettingState>({
    matchId: null,
    amount: 0,
    status: 'idle',
  });

  const settleBet = useCallback(
    async (matchId: string, winnerAddress: string, loserAddress: string) => {
      try {
        setBettingState((prev) => ({
          ...prev,
          status: 'pending',
        }));

        // Call backend API to settle the bet
        const response = await api.post('/game/crypto-bet/settle', {
          matchId,
          winnerId: winnerAddress,
          loserId: loserAddress,
        });

        setBettingState((prev) => ({
          ...prev,
          status: 'settled',
        }));

        return response.data;
      } catch (error) {
        setBettingState((prev) => ({
          ...prev,
          status: 'failed',
        }));
        throw error;
      }
    },
    []
  );

  const resetBetting = useCallback(() => {
    setBettingState({
      matchId: null,
      amount: 0,
      status: 'idle',
    });
  }, []);

  return {
    bettingState,
    settleBet,
    resetBetting,
  };
}
