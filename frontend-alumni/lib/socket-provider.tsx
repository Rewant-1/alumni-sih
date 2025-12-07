'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    // Helper to create socket with given transports
    const createSocket = (transports: Array<'websocket' | 'polling'>) =>
      io('http://localhost:5000', {
        path: '/socket.io',
        transports,
        auth: { token },
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

    // Try WebSocket first (faster, avoids xhr polling). If it fails with polling errors,
    // fall back to polling transport for environments where WebSocket is blocked.
    let socketInstance = createSocket(['websocket']);
    let usingWebsocket = true;

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error?.message || error);
      // If websocket transport failed with an XHR/polling error, try fallback to polling
      const msg = (error && (error.message || '')).toLowerCase();
      if (msg.includes('xhr poll error') && usingWebsocket) {
        console.warn('WebSocket transport failed; falling back to polling transport');
        usingWebsocket = false;
        try {
          if (socketInstance.connected) {
            socketInstance.disconnect();
          }
        } catch (e) {}
        if (socketInstance.io?.opts) {
          socketInstance.io.opts.transports = ['polling'];
        }
        socketInstance.connect();
      }

      if (error && error.message === 'Authentication error') {
        console.warn('Token may be invalid or expired. Try logging in again.');
      }
      setIsConnected(false);
    });

    // Online status tracking
    socketInstance.on('userOnline', (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });

    socketInstance.on('userOffline', (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Set socket in next tick to avoid setState during render
    setTimeout(() => setSocket(socketInstance), 0);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
