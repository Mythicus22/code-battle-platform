import { Server, Socket } from 'socket.io';

export function registerChatHandlers(io: Server, socket: Socket) {
    socket.on('send_chat', (data: { username: string, text: string, timestamp: string }) => {
        // Broadcast the message globally to all connected users
        io.emit('chat_message', data);
    });
}
