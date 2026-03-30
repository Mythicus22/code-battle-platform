import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import Match from '../models/Match.model';

export async function generateProblem(req: Request, res: Response): Promise<void> {
  try {
    const { trophies, language = 'javascript' } = req.body;

    if (typeof trophies !== 'number' || trophies < 0) {
      res.status(400).json({ error: 'trophies must be a non-negative number' });
      return;
    }

    const problem = await aiService.generateProblem(trophies, language);
    res.json({ problem });
  } catch (error) {
    console.error('Generate problem error:', error);
    res.status(500).json({ error: 'Failed to generate problem' });
  }
}

export async function getHint(req: Request, res: Response): Promise<void> {
  try {
    const { matchId } = req.body;
    const userId = req.user?.userId;

    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    // Verify user is a participant
    if (match.player1.toString() !== userId && match.player2.toString() !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const problem = match.problem as any;
    res.json({ hint: problem.hint || 'No hint available' });
  } catch (error) {
    console.error('Get hint error:', error);
    res.status(500).json({ error: 'Failed to fetch hint' });
  }
}
