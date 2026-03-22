import mongoose from 'mongoose';
import User from '../src/models/User.model';
import Problem from '../src/models/Problem.model';
import { hashPassword } from '../src/utils/bcrypt';
import { connectDatabase } from '../src/config/database';

async function seed() {
  try {
    await connectDatabase();
    console.log('Starting database seed...');

    await User.deleteMany({});
    await Problem.deleteMany({});

    const hashedPassword = await hashPassword('password123');

    await User.create([
      {
        username: 'alice',
        email: 'alice@example.com',
        password: hashedPassword,
        isVerified: true,
        trophies: 2500,
        totalGames: 50,
        wins: 35,
        losses: 15,
        badges: ['FIRST_BLOOD', 'WIN_STREAK', 'SPEEDSTER'],
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        password: hashedPassword,
        isVerified: true,
        trophies: 1800,
        totalGames: 40,
        wins: 22,
        losses: 18,
        badges: ['FIRST_BLOOD', 'FLAWLESS'],
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: hashedPassword,
        isVerified: true,
        trophies: 3200,
        totalGames: 75,
        wins: 50,
        losses: 25,
        badges: ['FIRST_BLOOD', 'WIN_STREAK', 'ARENA_CHAMPION'],
      },
      {
        username: 'demo',
        email: 'demo@example.com',
        password: hashedPassword,
        isVerified: true,
        trophies: 1000,
        totalGames: 10,
        wins: 5,
        losses: 5,
        badges: ['FIRST_BLOOD'],
      },
    ]);
    console.log('✅ Created sample users');

    await Problem.create([
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
        difficulty: 'Easy',
        difficultyScore: 2,
        estimatedTimeSeconds: 600,
        trophyRange: { min: 0, max: 999 },
        testCases: [
          { input: '2,7,11,15\n9', expectedOutput: '0,1', isHidden: false },
          { input: '3,2,4\n6', expectedOutput: '1,2', isHidden: false },
          { input: '3,3\n6', expectedOutput: '0,1', isHidden: true },
        ],
        hint: 'Use a hash map for O(n) solution',
        timeLimitSeconds: 30,
        tags: ['array', 'hash-table'],
        constraints: '2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9',
      },
      {
        title: 'Valid Parentheses',
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nInput: s = \"()[]{}\"\nOutput: true",
        difficulty: 'Easy',
        difficultyScore: 2,
        estimatedTimeSeconds: 600,
        trophyRange: { min: 0, max: 999 },
        testCases: [
          { input: '()[]{}', expectedOutput: 'true', isHidden: false },
          { input: '([)]', expectedOutput: 'false', isHidden: false },
          { input: '{[]}', expectedOutput: 'true', isHidden: true },
        ],
        hint: 'Use a stack data structure',
        timeLimitSeconds: 30,
        tags: ['string', 'stack'],
        constraints: '1 <= s.length <= 10^4',
      },
      {
        title: 'Maximum Subarray',
        description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.\n\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6',
        difficulty: 'Medium',
        difficultyScore: 4,
        estimatedTimeSeconds: 1200,
        trophyRange: { min: 1000, max: 1999 },
        testCases: [
          { input: '-2,1,-3,4,-1,2,1,-5,4', expectedOutput: '6', isHidden: false },
          { input: '1', expectedOutput: '1', isHidden: false },
          { input: '5,4,-1,7,8', expectedOutput: '23', isHidden: true },
        ],
        hint: "Use Kadane's algorithm",
        timeLimitSeconds: 45,
        tags: ['array', 'dynamic-programming'],
        constraints: '1 <= nums.length <= 10^5',
      },
      {
        title: 'Merge K Sorted Lists',
        description: 'You are given an array of k linked-lists, each sorted in ascending order. Merge all into one sorted linked-list.\n\nInput: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]',
        difficulty: 'Hard',
        difficultyScore: 7,
        estimatedTimeSeconds: 2400,
        trophyRange: { min: 3000, max: 3999 },
        testCases: [
          { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', isHidden: false },
          { input: '[]', expectedOutput: '[]', isHidden: false },
          { input: '[[]]', expectedOutput: '[]', isHidden: true },
        ],
        hint: 'Use a min-heap or priority queue',
        timeLimitSeconds: 60,
        tags: ['linked-list', 'heap'],
        constraints: 'k == lists.length, 0 <= k <= 10^4',
      },
    ]);
    console.log('✅ Created sample problems');

    console.log('\nDatabase seeded successfully!');
    console.log('Test Credentials:');
    console.log('  Email: demo@example.com');
    console.log('  Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
