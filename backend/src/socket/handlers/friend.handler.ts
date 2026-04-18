// @ts-nocheck
import { Server, Socket } from 'socket.io';
import User from '../../models/User.model';

export function registerFriendHandlers(io: Server, socket: Socket): void {
  socket.on('send_friend_request', async (data: { targetUserId?: string; targetUsername?: string }) => {
    try {
      const userId = socket.data.userId;
      const { targetUserId, targetUsername } = data;

      if (!targetUserId && !targetUsername) {
        socket.emit('error', { message: 'Target user ID or username required.' });
        return;
      }

      let targetUser;
      if (targetUserId) {
        targetUser = await User.findById(targetUserId);
      } else {
        targetUser = await User.findOne({ username: targetUsername });
      }
      
      const currentUser = await User.findById(userId);

      if (!targetUser || !currentUser) {
        socket.emit('error', { message: 'User not found.' });
        return;
      }

      if (userId === targetUser._id.toString()) {
        socket.emit('error', { message: 'Cannot friend yourself.' });
        return;
      }

      // Check if already friends
      if (currentUser.friends.includes(targetUser._id as any)) {
        socket.emit('error', { message: 'Already friends.' });
        return;
      }

      // Check if request already sent
      if (targetUser.friendRequests.includes(userId as any)) {
        socket.emit('error', { message: 'Request already sent.' });
        return;
      }

      // Check if they already sent us a request (auto-accept)
      if (currentUser.friendRequests.includes(targetUser._id as any)) {
         currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== targetUser._id.toString());
         currentUser.friends.push(targetUser._id as any);
         targetUser.friends.push(currentUser._id as any);
         await currentUser.save();
         await targetUser.save();
         
         socket.emit('friend_request_accepted', { message: 'Friend request accepted!', friend: { id: targetUser._id, username: targetUser.username } });
         io.to(`user:${targetUser._id}`).emit('friend_request_accepted', { message: 'Friend request accepted!', friend: { id: currentUser._id, username: currentUser.username } });
         return;
      }

      targetUser.friendRequests.push(userId as any);
      await targetUser.save();

      socket.emit('friend_request_sent', { message: 'Request sent successfully.' });
      console.log(`[Friend Request] ${currentUser.username} sent a request to ${targetUser.username}`);
      io.to(`user:${targetUser._id.toString()}`).emit('friend_request_received', {
        fromUserId: currentUser._id,
        fromUsername: currentUser.username,
      });
    } catch (error: any) {
      console.error('Send friend request error:', error);
      socket.emit('error', { message: 'Failed to send request.' });
    }
  });

  socket.on('accept_friend_request', async (data: { requesterId: string }) => {
    try {
      const userId = socket.data.userId;
      const { requesterId } = data;

      const currentUser = await User.findById(userId);
      const requesterUser = await User.findById(requesterId);

      if (!currentUser || !requesterUser) {
        socket.emit('error', { message: 'User not found.' });
        return;
      }

      if (!currentUser.friendRequests.map(id => id.toString()).includes(requesterId)) {
        socket.emit('error', { message: 'No friend request from this user.' });
        return;
      }

      // Accept
      currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== requesterId);
      currentUser.friends.push(requesterId as any);
      requesterUser.friends.push(userId as any);

      await currentUser.save();
      await requesterUser.save();

      console.log(`[Friend Request] ${currentUser.username} accepted a request from ${requesterUser.username}`);

      socket.emit('friend_request_accepted', { message: 'Request accepted.', friend: { id: requesterUser._id, username: requesterUser.username } });
      io.to(`user:${requesterId}`).emit('friend_request_accepted', { message: 'Request accepted.', friend: { id: currentUser._id, username: currentUser.username } });
    } catch (error: any) {
      console.error('Accept friend request error:', error);
      socket.emit('error', { message: 'Failed to accept request.' });
    }
  });

  socket.on('reject_friend_request', async (data: { requesterId: string }) => {
     try {
       const userId = socket.data.userId;
       const { requesterId } = data;
       const currentUser = await User.findById(userId);
       if (!currentUser) return;

       currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== requesterId);
       await currentUser.save();

       console.log(`[Friend Request] ${currentUser.username} rejected a request from ID: ${requesterId}`);

       socket.emit('friend_request_rejected', { message: 'Request rejected.' });
     } catch (e) {
       console.error('Reject friend request error:', e);
     }
  });

  socket.on('send_friend_message', async (data: { friendId: string, text: string }) => {
    try {
      const userId = socket.data.userId;
      const { friendId, text } = data;
      
      const currentUser = await User.findById(userId);
      if (!currentUser || !currentUser.friends.includes(friendId as any)) {
         socket.emit('error', { message: 'You are not friends with this user.' });
         return;
      }
      
      const messageObj = {
         fromId: userId,
         fromUsername: currentUser.username,
         toId: friendId,
         text,
         timestamp: new Date()
      };
      
      // Echo to sender so they see it
      socket.emit('friend_message', messageObj);
      
      // Send to recipient
      io.to(`user:${friendId}`).emit('friend_message', messageObj);
    } catch(e) {
      console.error('Send friend message error:', e);
    }
  });
}
