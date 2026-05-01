import { Router } from 'express';
import { upload } from '../utils/cloudinary';
import { authMiddleware } from '../middleware/auth.middleware';
import { getProfile, updateProfile, getMatches, getFriends, getUserProfile, searchUsers } from '../controllers/user.controller';
import User from '../models/User.model';

const router = Router();

// Cloudinary upload endpoint
router.post('/avatar', authMiddleware, upload.single('profilePicture'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }
    
    // Update user profile picture in DB
    if (req.user && req.user.userId) {
       await User.findByIdAndUpdate(req.user.userId, { profilePicture: req.file.path });
    }

    res.json({ imageUrl: req.file.path });
    return;
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
    return;
  }
});

// Existing routes
router.get('/profile', authMiddleware, getProfile);
router.get('/profile/:username', authMiddleware, getUserProfile); // New public profile route
router.put('/profile', authMiddleware, updateProfile);
router.get('/matches', authMiddleware, getMatches);
router.get('/friends', authMiddleware, getFriends);
router.get('/search', authMiddleware, searchUsers);

export default router;