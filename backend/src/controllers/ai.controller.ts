import { Request, Response } from 'express';
import Problem from '../models/Problem.model';

const SAMPLE_PROBLEMS = [
  {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]`,
    hint: 'Use a hash map to store numbers you have seen along with their indices.',
    difficulty: 'Easy',
    trophyRange: { min: 0, max: 1000 },
    testCases: [
      { input: '2,7,11,15\n9', expectedOutput: '0,1', isHidden: false },
      { input: '3,2,4\n6', expectedOutput: '1,2', isHidden: false },
      { input: '3,3\n6', expectedOutput: '0,1', isHidden: true },
    ],
    timeLimitSeconds: 30,
    tags: ['array', 'hash-table'],
  },
  {
    title: 'Valid Parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nExample:\nInput: s = "()[]{}"\nOutput: true`,
    hint: 'Use a stack to keep track of opening brackets.',
    difficulty: 'Easy',
    trophyRange: { min: 0, max: 1000 },
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { input: '([)]', expectedOutput: 'false', isHidden: false },
      { input: '{[]}', expectedOutput: 'true', isHidden: true },
    ],
    timeLimitSeconds: 30,
    tags: ['string', 'stack'],
  },
  {
    title: 'Maximum Subarray',
    description: `Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.\n\nExample:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6`,
    hint: "Kadane's algorithm: keep track of current max and global max.",
    difficulty: 'Medium',
    trophyRange: { min: 1000, max: 3000 },
    testCases: [
      { input: '-2,1,-3,4,-1,2,1,-5,4', expectedOutput: '6', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '5,4,-1,7,8', expectedOutput: '23', isHidden: true },
    ],
    timeLimitSeconds: 45,
    tags: ['array', 'dynamic-programming'],
  },
  {
    title: 'Longest Palindromic Substring',
    description: `Given a string s, return the longest palindromic substring in s.\n\nExample:\nInput: s = "babad"\nOutput: "bab"`,
    hint: 'Expand around center for each possible center point.',
    difficulty: 'Medium',
    trophyRange: { min: 1000, max: 3000 },
    testCases: [
      { input: 'babad', expectedOutput: 'bab', isHidden: false },
      { input: 'cbbd', expectedOutput: 'bb', isHidden: false },
      { input: 'a', expectedOutput: 'a', isHidden: true },
    ],
    timeLimitSeconds: 45,
    tags: ['string', 'dynamic-programming'],
  },
  {
    title: 'Merge K Sorted Lists',
    description: `You are given an array of k linked-lists, each sorted in ascending order. Merge all into one sorted linked-list.\n\nExample:\nInput: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]`,
    hint: 'Use a min-heap to efficiently find the next smallest element.',
    difficulty: 'Hard',
    trophyRange: { min: 3000, max: 5000 },
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: false },
      { input: '[[]]', expectedOutput: '[]', isHidden: true },
    ],
    timeLimitSeconds: 60,
    tags: ['linked-list', 'heap', 'divide-and-conquer'],
  },
];

export async function generateProblem(req: Request, res: Response): Promise<void> {
  try {
    const { trophies } = req.body;

    let problem;
    if (trophies < 1000) {
      problem = SAMPLE_PROBLEMS[Math.floor(Math.random() * 2)];
    } else if (trophies < 3000) {
      problem = SAMPLE_PROBLEMS[2 + Math.floor(Math.random() * 2)];
    } else {
      problem = SAMPLE_PROBLEMS[4];
    }

    res.json({ problem: { ...problem, hint: undefined } });
  } catch (error) {
    console.error('Generate problem error:', error);
    res.status(500).json({ error: 'Failed to generate problem' });
  }
}

export async function getHint(req: Request, res: Response): Promise<void> {
  try {
    const { problemId } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    res.json({ hint: problem.hint });
  } catch (error) {
    console.error('Get hint error:', error);
    res.status(500).json({ error: 'Failed to fetch hint' });
  }
}
