import { Router, Request, Response } from 'express';
import GlobalMessage from '../models/GlobalMessage.model';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/history', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get messages from last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const messages = await GlobalMessage.find({ createdAt: { $gte: twoHoursAgo } })
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({ messages });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;
