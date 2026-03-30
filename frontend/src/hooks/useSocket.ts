'use client';

import { useState, useEffect, useCallback } from 'react';
import { initSocket, getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = initSocket();
    setSocket(s);
    setConnected(s.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      // Do NOT disconnect - socket should persist across page navigations
    };
  }, []);

  const emit = useCallback(
    (event: string, data?: any) => {
      if (socket?.connected) {
        socket.emit(event, data);
      }
    },
    [socket]
  );

  const on = useCallback(
    (event: string, callback: (data: any) => void) => {
      if (socket) {
        socket.on(event, callback);
      }
    },
    [socket]
  );

  const off = useCallback(
    (event: string, callback?: (data: any) => void) => {
      if (socket) {
        socket.off(event, callback);
      }
    },
    [socket]
  );

  return {
    socket,
    connected,
    emit,
    on,
    off,
  };
}
