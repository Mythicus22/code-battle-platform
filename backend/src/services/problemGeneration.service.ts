import { aiService } from './ai.service';
import Problem from '../models/Problem.model';

function getTrophyRangeForDifficulty(difficulty: string): { min: number; max: number } {
  switch (difficulty) {
    case 'Easy': return { min: 0, max: 999 };
    case 'Medium': return { min: 1000, max: 1999 };
    case 'Hard': return { min: 2000, max: 2999 };
    case 'Very Hard': return { min: 3000, max: 3999 };
    case 'Expert': return { min: 4000, max: 9999 };
    default: return { min: 0, max: 999 };
  }
}

export async function generateAndSaveProblem(trophies: number, language = 'javascript') {
  try {
    const aiProblem = await aiService.generateProblem(trophies, language);
    const timeLimitSeconds = aiProblem.time_limit * 60;

    const problemData = {
      title: aiProblem.title,
      description: aiProblem.description,
      difficulty: aiProblem.difficulty as any,
      trophyRange: getTrophyRangeForDifficulty(aiProblem.difficulty),
      testCases: aiProblem.test_cases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expected_output,
        isHidden: false,
        explanation: ''
      })),
      hint: aiProblem.hint,
      timeLimitSeconds,
      memoryLimitMB: 256,
      tags: [],
      constraints: aiProblem.constraints,
      generationNotes: aiProblem.generation_notes,
    };

    return await Problem.create(problemData);
  } catch (error: any) {
    console.error('Problem generation error:', error.message);

    const fallback = await Problem.findOne({
      'trophyRange.min': { $lte: trophies },
      'trophyRange.max': { $gte: trophies },
    });

    if (fallback) return fallback;
    throw new Error('Failed to generate or find suitable problem');
  }
}
