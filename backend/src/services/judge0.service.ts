import axios from 'axios';
import env from '../config/env';



const JUDGE0_HEADERS = env.JUDGE0_API_KEY
  ? {
      'X-RapidAPI-Key': env.JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    }
  : {};

export async function executeTestCases(
  code: string,
  languageId: number,
  testCases: Array<{ input: string; expectedOutput: string }>
): Promise<
  Array<{
    testCase: number;
    passed: boolean;
    runtime?: number;
    memory?: number;
    output?: string;
    error?: string;
  }>
> {
  // Batch Submissions implementation for Judge0
  try {
    const submissionsPayload = testCases.map((tc) => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.expectedOutput.trim(),
    }));

    const response = await axios.post(
      `${env.JUDGE0_API_URL}/submissions/batch`,
      { submissions: submissionsPayload },
      {
        headers: JUDGE0_HEADERS,
        params: { base64_encoded: false },
      }
    );

    const tokens = response.data.map((item: any) => item.token).join(',');
    
    // Poll the batch status
    let allFinished = false;
    let finalResults: any[] = [];
    
    for (let i = 0; i < 30; i++) {
        const batchResponse = await axios.get(`${env.JUDGE0_API_URL}/submissions/batch`, {
            headers: JUDGE0_HEADERS,
            params: { tokens, base64_encoded: false }
        });
        
        const results = batchResponse.data.submissions;
        const allDone = results.every((r: any) => r.status && r.status.id > 2);
        
        if (allDone) {
            allFinished = true;
            finalResults = results;
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    if (!allFinished) {
        throw new Error('Batch submission timeout');
    }

    return finalResults.map((result, i) => {
      const tc = testCases[i];
      const passed =
        result.status.id === 3 ||
        (result.stdout?.trim() === tc.expectedOutput.trim());

      return {
        testCase: i + 1,
        passed,
        runtime: result.time ? parseFloat(result.time) : undefined,
        memory: result.memory,
        output: result.stdout,
        error: result.stderr || result.compile_output,
      };
    });

  } catch (error) {
    console.error('Batch execution error:', error);
    // Fallback failure response for all test cases
    return testCases.map((_, i) => ({
        testCase: i + 1,
        passed: false,
        error: 'Execution error or batch rate limit reached',
    }));
  }
}

// Language IDs (common ones)
export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  typescript: 74,
  go: 60,
};
