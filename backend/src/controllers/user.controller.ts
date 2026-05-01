import { Request, Response } from 'express';
import User from '../models/User.model';
import Match from '../models/Match.model';
import env from '../config/env';

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId).select('-password -otp');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get recent matches
    const recentMatches = await Match.find({
      $or: [{ player1: user._id }, { player2: user._id }],
      status: 'COMPLETED',
    })
      .sort({ endedAt: -1 })
      .limit(10)
      .populate('player1 player2', 'username trophies')
      .populate('problem', 'title difficulty');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        trophies: user.trophies,
        totalGames: user.totalGames,
        wins: user.wins,
        losses: user.losses,
        winrate: user.winrate,
        arena: user.arena,
        badges: user.badges,
        bestRuntime: user.bestRuntime,
        walletAddress: user.walletAddress,
      },
      recentMatches: recentMatches.map((match) => {
        const p1 = match.player1 as any;
        const p2 = match.player2 as any;
        const isP1 = p1?._id?.toString() === user._id.toString();
        return {
          id: match._id,
          opponent: isP1 ? p2 : p1,
          problem: match.problem,
          won: match.winner?.toString() === user._id.toString(),
          endedAt: match.endedAt,
        };
      }),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.body;
    const userId = req.user?.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    ).select('-password -otp');

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function getBadges(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ badges: user.badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
}

export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select('username trophies totalGames wins losses winrate arena badges profilePicture createdAt')
      .lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

export async function getMatches(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;

    const matches = await Match.find({
      $or: [{ player1: userId }, { player2: userId }],
      status: 'COMPLETED',
    })
      .sort({ endedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('player1 player2', 'username trophies')
      .populate('problem', 'title difficulty');

    res.json({ matches, page });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
}

export async function getRemainingBets(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const today = new Date().toDateString();
    const lastBetDate = user.lastBetDate?.toDateString();
    const betsToday = lastBetDate === today ? user.betsToday : 0;
    const remaining = Math.max(0, env.MAX_BETS_PER_DAY - betsToday);

    res.json({
      betsToday,
      remaining,
      maxPerDay: env.MAX_BETS_PER_DAY,
    });
  } catch (error) {
    console.error('Get remaining bets error:', error);
    res.status(500).json({ error: 'Failed to fetch bet info' });
  }
}

export async function getFriends(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId).populate('friends', 'username trophies profilePicture');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ friends: user.friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
}

export async function searchUsers(req: Request, res: Response): Promise<void> {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.json({ users: [] });
      return;
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user?.userId }
    })
      .select('username trophies profilePicture')
      .limit(10)
      .lean();

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
}
