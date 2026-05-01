import { Server, Socket } from 'socket.io';
import GlobalMessage from '../../models/GlobalMessage.model';

export function registerChatHandlers(io: Server, socket: Socket) {
    socket.on('send_chat', async (data: { username: string, text: string, timestamp: string, avatar?: string }) => {
        try {
            const newMsg = new GlobalMessage({
                senderId: socket.data.userId,
                senderName: data.username,
                senderAvatar: data.avatar || '',
                message: data.text,
            });
            await newMsg.save();
            
            // Broadcast the message globally to all connected users
            io.emit('chat_message', {
                _id: newMsg._id,
                username: data.username,
                text: data.text,
                avatar: data.avatar,
                timestamp: data.timestamp
            });
        } catch (error) {
            console.error('Failed to save chat message:', error);
        }
    });
}
