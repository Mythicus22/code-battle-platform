// @ts-nocheck
import { Server, Socket } from 'socket.io';
import { joinQueue, leaveQueue } from '../../services/matchmaking.service';
import User from '../../models/User.model';
import Match from '../../models/Match.model';
import { aiService } from '../../services/ai.service';
import { updateMatchStats } from '../../services/trophy.service';
import { checkAndAwardBadges } from '../../services/badge.service';
import env from '../../config/env';

export function registerMatchmakingHandlers(io: Server, socket: Socket): void {
  socket.on('join_matchmaking', async (data: { betAmount: number; language: string; cryptoBetting?: boolean; cryptoBetAmount?: string }) => {
    try {
      const userId = socket.data.userId;
      const { betAmount, language } = data;
      console.log(`[Matchmaking] User ${userId} joining queue. Wager: ${betAmount}, Language: ${language}`);

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Check bet limit if betting
      if (betAmount > 0) {
        const today = new Date().toDateString();
        const lastBetDate = user.lastBetDate?.toDateString();
        if (lastBetDate !== today) {
          user.betsToday = 0;
          user.lastBetDate = new Date();
        }

        if (user.betsToday >= env.MAX_BETS_PER_DAY) {
          socket.emit('error', {
            message: 'Daily bet limit reached',
          });
          return;
        }
      }

      // Join queue
      const opponent = await joinQueue({
        userId: userId,
        trophies: user.trophies,
        betAmount: betAmount,
        socketId: socket.id,
        language: language,
      });

      if (opponent) {
        // Match found!
        await createMatch(io, user, opponent, betAmount, language);
      } else {
        // In queue, waiting
        socket.emit('matchmaking_status', {
          status: 'waiting',
          message: 'Looking for opponent...',
        });
      }
    } catch (error: any) {
      console.error('Matchmaking error:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('leave_matchmaking', async () => {
    try {
      const userId = socket.data.userId;
      console.log(`[Matchmaking] User ${userId} leaving queue.`);
      await leaveQueue(userId);
      socket.emit('matchmaking_status', {
        status: 'left',
        message: 'Left matchmaking queue',
      });
    } catch (error: any) {
      console.error('Leave queue error:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('challenge_friend', async (data: { friendId: string; betAmount: number; language: string; cryptoBetting?: boolean; cryptoBetAmount?: string }) => {
    try {
      const userId = socket.data.userId;
      const { friendId, betAmount, language, cryptoBetting, cryptoBetAmount } = data;

      const user = await User.findById(userId);
      const friend = await User.findById(friendId);
      if (!user || !friend) {
        socket.emit('error', { message: 'User not found.' });
        return;
      }

      if (!user.friends.includes(friendId as any)) {
        socket.emit('error', { message: 'Must be friends to challenge.' });
        return;
      }

      const challengeData = {
        challengerId: user._id,
        challengerUsername: user.username,
        betAmount,
        language,
        cryptoBetting,
        cryptoBetAmount
      };

      console.log(`[Friend Challenge] ${user.username} challenged ${friend.username} (Friend ID: ${friendId}), wager: ${betAmount}, mode: ${cryptoBetting}`);

      io.to(`user:${friendId}`).emit('friend_challenged', challengeData);
      socket.emit('challenge_sent', { message: 'Challenge sent! Waiting for friend.' });

    } catch (e: any) {
      socket.emit('error', { message: e.message });
    }
  });

  socket.on('accept_challenge', async (data: { challengerId: string; language?: string }) => {
    try {
      const userId = socket.data.userId;
      const { challengerId, language } = data;

      const user = await User.findById(userId);
      const challenger = await User.findById(challengerId);

      if (!user || !challenger) return;
      
      console.log(`[Friend Challenge] ${user.username} ACCEPTED challenge from ${challenger.username}`);
      
      await createMatch(io, challenger, { userId: user._id }, 0, language || 'javascript');
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });
}

async function createMatch(
  io: Server,
  player1Data: any,
  player2Request: any,
  betAmount: number,
  language: string
): Promise<void> {
  try {
    // Get player2 data
    const player2 = await User.findById(player2Request.userId);
    if (!player2) {
      return;
    }

    // Generate problem using AI service - use player1's language
    const avgTrophies = Math.round((player1Data.trophies + player2.trophies) / 2);
    const problemData = await aiService.generateProblem(avgTrophies, language);
    // time_limit from Lyzr is in minutes — convert to seconds for storage
    const timeLimitSeconds = problemData.time_limit * 60;

    // Create match with embedded problem data
    const match = await Match.create({
      player1: player1Data._id,
      player2: player2._id,
      problem: {
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        timeLimitSeconds,
        constraints: problemData.constraints,
        hint: problemData.hint,
        testCases: problemData.test_cases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expected_output,
          explanation: ''
        })),
        tags: [],
        language: problemData.language || language
      },
      timeLimit: timeLimitSeconds,
      status: 'IN_PROGRESS',
      betAmount: betAmount > 0 ? betAmount : undefined,
      startedAt: new Date(),
    });

    // Update bet counts if betting
    if (betAmount > 0) {
      await User.findByIdAndUpdate(player1Data._id, {
        $inc: { betsToday: 1 },
        lastBetDate: new Date(),
      });
      await User.findByIdAndUpdate(player2._id, {
        $inc: { betsToday: 1 },
        lastBetDate: new Date(),
      });
    }

    // Notify both players
    const gameData = {
      matchId: match._id,
      opponent: {
        username: player2.username,
        trophies: player2.trophies,
      },
      problem: {
        title: problemData.title,
        description: problemData.description,
        timeLimitSeconds,
        constraints: problemData.constraints,
        hint: problemData.hint,
        difficulty: problemData.difficulty,
        language: problemData.language || language,
      },
      betAmount,
    };

    io.to(`user:${player1Data._id}`).emit('match_found', gameData);
    io.to(`user:${player2._id}`).emit('match_found', {
      ...gameData,
      opponent: {
        username: player1Data.username,
        trophies: player1Data.trophies,
      },
    });

    // Create game room
    const roomId = `match:${match._id}`;
    io.in(`user:${player1Data._id}`).socketsJoin(roomId);
    io.in(`user:${player2._id}`).socketsJoin(roomId);

    // Start game countdown
    setTimeout(() => {
      io.to(roomId).emit('game_start', {
        matchId: match._id,
        startTime: Date.now(),
      });
      
      // Set match timeout based on AI estimated time
      setTimeout(async () => {
        try {
          const currentMatch = await Match.findById(match._id);
          if (currentMatch && currentMatch.status === 'IN_PROGRESS') {
            await handleTimeUp(io, currentMatch);
          }
        } catch (error) {
          console.error('Match timeout error:', error);
        }
      }, timeLimitSeconds * 1000);
    }, 3000);
  } catch (error) {
    console.error('Create match error:', error);
  }
}

async function handleTimeUp(io: Server, match: any): Promise<void> {
  try {
    const p1Submissions = match.player1Submissions.filter((s: any) => s.allPassed);
    const p2Submissions = match.player2Submissions.filter((s: any) => s.allPassed);
    
    let winnerId;
    let reason = 'timeout';
    
    if (p1Submissions.length > 0 && p2Submissions.length === 0) {
      winnerId = match.player1;
      reason = 'timeout_winner_p1';
    } else if (p2Submissions.length > 0 && p1Submissions.length === 0) {
      winnerId = match.player2;
      reason = 'timeout_winner_p2';
    } else if (p1Submissions.length > 0 && p2Submissions.length > 0) {
      // Both have passing solutions - compare runtimes
      const p1Best = Math.min(...p1Submissions.map((s: any) => s.totalRuntime || Infinity));
      const p2Best = Math.min(...p2Submissions.map((s: any) => s.totalRuntime || Infinity));
      winnerId = p1Best <= p2Best ? match.player1 : match.player2;
      reason = 'timeout_best_runtime';
    } else {
      // Neither has passing solution - it's a draw, but we need a winner
      // Give it to player with more test cases passed
      const p1BestScore = match.player1Submissions.length > 0
        ? Math.max(...match.player1Submissions.map((s: any) =>
            s.testResults ? s.testResults.filter((r: any) => r.passed).length : 0
          ))
        : 0;
      const p2BestScore = match.player2Submissions.length > 0
        ? Math.max(...match.player2Submissions.map((s: any) =>
            s.testResults ? s.testResults.filter((r: any) => r.passed).length : 0
          ))
        : 0;
      
      winnerId = p1BestScore >= p2BestScore ? match.player1 : match.player2;
      reason = 'timeout_most_tests';
    }
    
    match.winner = winnerId;
    match.status = 'COMPLETED';
    match.endedAt = new Date();
    await match.save();
    
    // Update stats
    const loserId = winnerId.toString() === match.player1.toString()
      ? match.player2.toString()
      : match.player1.toString();
    await updateMatchStats(winnerId.toString(), loserId);
    await checkAndAwardBadges(winnerId.toString());
    
    // Notify players
    const roomId = `match:${match._id}`;
    io.to(roomId).emit('game_end', {
      winner: winnerId,
      reason: reason,
      message: 'Time\'s up!'
    });
    
  } catch (error) {
    console.error('Handle time up error:', error);
  }
}

