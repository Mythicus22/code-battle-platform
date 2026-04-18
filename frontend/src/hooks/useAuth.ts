'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/api';
import { initSocket, getSocket } from '@/lib/socket';

export interface User {
  id: string;
  username: string;
  email: string;
  trophies: number;
  totalGames: number;
  wins: number;
  losses: number;
  winrate: string;
  arena: number;
  badges: string[];
  metamaskAddress?: string;
  walletAddress?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    let socket: ReturnType<typeof getSocket>;
    try {
      initSocket();
      socket = getSocket();
    } catch {
      return;
    }

    const onTrophies = (payload: any) => {
      setUser((prev) => {
        if (!prev || payload.userId !== prev.id) return prev;
        return { ...prev, trophies: payload.trophies };
      });
    };
    const onBadges = (payload: any) => {
      setUser((prev) => {
        if (!prev || payload.userId !== prev.id) return prev;
        const merged = Array.from(new Set([...(prev.badges || []), ...(payload.badges || [])]));
        return { ...prev, badges: merged };
      });
    };
    const onUserUpdated = (payload: any) => {
      if (payload?.user) {
        setUser((prev) => {
          if (!prev) return prev;
          const uid = payload.user._id ?? payload.user.id;
          if (uid?.toString() !== prev.id) return prev;
          return { ...payload.user, id: uid } as User;
        });
      }
    };
    const onGameEnd = () => checkAuth();

    socket.on('trophies:updated', onTrophies);
    socket.on('badges:awarded', onBadges);
    socket.on('user:updated', onUserUpdated);
    socket.on('game_end', onGameEnd);

    return () => {
      socket.off('trophies:updated', onTrophies);
      socket.off('badges:awarded', onBadges);
      socket.off('user:updated', onUserUpdated);
      socket.off('game_end', onGameEnd);
    };
  }, [user?.id]);

  async function checkAuth() {
    try {
      const response = await auth.getMe();
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await auth.login({ email, password });
    setUser(response.data.user);
    return response.data;
  }

  async function signup(username: string, email: string, password: string) {
    const response = await auth.signup({ username, email, password });
    return response.data;
  }

  async function logout() {
    await auth.logout();
    setUser(null);
    window.location.href = '/login';
  }

  return { user, loading, login, signup, logout, refetch: checkAuth };
}