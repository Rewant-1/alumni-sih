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

    // Initialize socket connection
    const socketInstance = io('http://localhost:5000', {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      if (error.message === 'Authentication error') {
        console.warn('Token may be invalid or expired. Try logging in again.');
        // Optionally clear invalid token
        // localStorage.removeItem('token');
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
