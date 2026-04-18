import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { socketAuthMiddleware } from './middleware/socketAuth.middleware';
import { registerMatchmakingHandlers } from './handlers/matchmaking.handler';
import { registerGameHandlers } from './handlers/game.handler';
import { registerFriendHandlers } from './handlers/friend.handler';
import { registerChatHandlers } from './handlers/chat.handler';
import env from '../config/env';

let io: SocketIOServer;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(socketAuthMiddleware);

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);

    // Register event handlers
    registerMatchmakingHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerFriendHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}