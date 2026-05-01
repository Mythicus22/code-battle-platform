import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import gameRoutes from './game.routes';
import aiRoutes from './ai.routes';
import chatRoutes from './chat.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/game', gameRoutes);
router.use('/ai', aiRoutes);
router.use('/chat', chatRoutes);

export default router;