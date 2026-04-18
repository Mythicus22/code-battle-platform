import axios from 'axios';

// Matches Lyzr structured output schema exactly
export interface TestCase {
  input: string;
  expected_output: string;
}

export interface ProblemData {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Expert';
  time_limit: number; // minutes
  description: string;
  constraints: string;
  hint: string;
  test_cases: TestCase[];
  generation_notes: string;
  language?: string;
}

class AIService {
  private get apiKey() { return process.env.AI_AGENT_API_KEY || ''; }
  private get agentId() { return process.env.AI_AGENT_ID || ''; }
  private get baseUrl() { return process.env.AI_AGENT_API_URL || 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/'; }

  async generateProblem(trophies: number, language: string): Promise<ProblemData> {
    try {
      // Unique session per request so Lyzr doesn't reuse context
      const sessionId = `${this.agentId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const prompt = `You are an elite competitive programming algorithm setter. Generate a unique coding problem identically formatted to LeetCode/GFG equivalents.
    Difficulty requirement based on user trophies (${trophies}): ${this.getDifficultyByTrophies(trophies)}.
    Language requested: ${language}.
    Provide a robust narrative.
    CRITICALLY: You MUST generate EXACTLY between 10 to 15 rigorous test cases (basic, standard, extreme edge cases) strictly matching the I/O formatting.
    Output ONLY raw valid JSON conforming exactly to this structure:
    { "title": "", "description": "", "difficulty": "", "time_limit": <num_minutes>, "constraints": "", "hint": "", "test_cases": [{ "input": "", "expected_output": "" }] }`;

      const response = await axios.post(this.baseUrl, {
        user_id: 'devanshparti@gmail.com',
        agent_id: this.agentId,
        session_id: sessionId,
        message: prompt
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        timeout: 30000
      });

      let raw: string = response.data?.response;
      if (!raw) throw new Error('Empty AI response');

      // Strip markdown fences
      raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) raw = jsonMatch[0];

      let problemData: ProblemData;
      try {
        problemData = JSON.parse(raw);
      } catch {
        console.error('Failed to parse AI response:', raw?.substring(0, 300));
        return this.generateMockProblem(trophies, language);
      }

      // Validate Lyzr schema fields
      if (!problemData.title || !Array.isArray(problemData.test_cases) || problemData.test_cases.length < 1) {
        console.error('Invalid AI response structure:', problemData);
        return this.generateMockProblem(trophies, language);
      }

      problemData.language = language;
      return problemData;
    } catch (error) {
      console.error('AI service error:', error);
      return this.generateMockProblem(trophies, language);
    }
  }

  private generateMockProblem(trophies: number, language: string): ProblemData {
    const difficulty = this.getDifficultyByTrophies(trophies) as ProblemData['difficulty'];
    return {
      title: this.generateTitle(language, difficulty),
      description: this.generateDescription(),
      difficulty,
      time_limit: this.getTimeLimitByDifficulty(difficulty),
      hint: this.generateHint(difficulty),
      constraints: this.generateConstraints(difficulty),
      language,
      test_cases: [
        { input: '3\n1 2 3', expected_output: '6' },
        { input: '5\n-1 0 1 2 3', expected_output: '5' },
        { input: '1\n42', expected_output: '42' },
        { input: '4\n10 20 30 40', expected_output: '100' },
        { input: '0\n', expected_output: '0' },
        { input: '2\n-100 100', expected_output: '0' },
        { input: '6\n1 1 1 1 1 1', expected_output: '6' },
        { input: '3\n100 -50 25', expected_output: '75' },
        { input: '2\n999 1', expected_output: '1000' },
        { input: '10\n1 2 3 4 5 6 7 8 9 10', expected_output: '55' }
      ],
      generation_notes: `Mock fallback: ${difficulty} ${language} problem.`
    };
  }

  private getDifficultyByTrophies(trophies: number): string {
    if (trophies < 1000) return 'Easy';
    if (trophies < 2000) return 'Medium';
    if (trophies < 3000) return 'Hard';
    if (trophies < 4000) return 'Very Hard';
    return 'Expert';
  }

  private getTimeLimitByDifficulty(difficulty: string): number {
    const limits: Record<string, number> = {
      'Easy': 5, 'Medium': 15, 'Hard': 30, 'Very Hard': 60, 'Expert': 90
    };
    return limits[difficulty] ?? 15;
  }

  private generateTitle(language: string, difficulty: string): string {
    const titles: Record<string, Record<string, string[]>> = {
      javascript: {
        Easy: ['Array Sum', 'String Reverse', 'Find Maximum'],
        Medium: ['Two Sum', 'Valid Parentheses', 'Merge Arrays'],
        Hard: ['Longest Substring', 'Binary Tree Path', 'Dynamic Array'],
        'Very Hard': ['Graph Traversal', 'Complex DP', 'Advanced Trees'],
        Expert: ['Optimal Pathfinding', 'Advanced Algorithms', 'Complex Optimization']
      },
      python: {
        Easy: ['List Operations', 'String Manipulation', 'Basic Math'],
        Medium: ['Dictionary Usage', 'List Comprehension', 'Set Operations'],
        Hard: ['Advanced Recursion', 'Complex Data Structures', 'Algorithm Design'],
        'Very Hard': ['Optimization Problems', 'Advanced Algorithms', 'Complex Logic'],
        Expert: ['Competitive Programming', 'Advanced Optimization', 'Complex Systems']
      },
      java: {
        Easy: ['Array Processing', 'String Methods', 'Basic Collections'],
        Medium: ['HashMap Usage', 'ArrayList Operations', 'Object Design'],
        Hard: ['Advanced Collections', 'Complex Algorithms', 'Design Patterns'],
        'Very Hard': ['Performance Optimization', 'Advanced Data Structures', 'Complex Systems'],
        Expert: ['Enterprise Algorithms', 'Advanced Optimization', 'System Design']
      },
      cpp: {
        Easy: ['Vector Operations', 'String Processing', 'Basic STL'],
        Medium: ['Map Usage', 'Algorithm Library', 'Pointer Operations'],
        Hard: ['Advanced STL', 'Memory Management', 'Performance Algorithms'],
        'Very Hard': ['Competitive Programming', 'Advanced Algorithms', 'Optimization'],
        Expert: ['High Performance', 'Advanced Optimization', 'Complex Algorithms']
      }
    };
    const langTitles = titles[language] || titles.javascript;
    const diffTitles = langTitles[difficulty] || langTitles.Easy;
    return diffTitles[Math.floor(Math.random() * diffTitles.length)];
  }

  private generateDescription(): string {
    return `Given an array of integers, find the sum of all elements.\n\nInput Format:\nFirst line contains integer n (array size)\nSecond line contains n space-separated integers\n\nOutput Format:\nSingle integer — the sum\n\nExample:\nInput:\n3\n1 2 3\nOutput:\n6`;
  }

  private generateHint(difficulty: string): string {
    const hints: Record<string, string> = {
      Easy: 'Use a simple loop to iterate through the array.',
      Medium: 'Consider using a hash map for O(1) lookups.',
      Hard: 'Think about dynamic programming or divide and conquer.',
      'Very Hard': 'An advanced algorithm with optimal time complexity is needed.',
      Expert: 'Complex optimization with multiple constraints required.'
    };
    return hints[difficulty] || hints.Easy;
  }

  private generateConstraints(difficulty: string): string {
    const constraints: Record<string, string> = {
      Easy: '1 ≤ n ≤ 100, -100 ≤ arr[i] ≤ 100',
      Medium: '1 ≤ n ≤ 1000, -1000 ≤ arr[i] ≤ 1000',
      Hard: '1 ≤ n ≤ 10000, -10000 ≤ arr[i] ≤ 10000',
      'Very Hard': '1 ≤ n ≤ 100000, -100000 ≤ arr[i] ≤ 100000',
      Expert: '1 ≤ n ≤ 1000000, -1000000 ≤ arr[i] ≤ 1000000'
    };
    return constraints[difficulty] || constraints.Easy;
  }
}

export const aiService = new AIService();
