const JUDGE0_URL = process.env.JUDGE0_API_URL ?? "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_API_KEY ?? "";

export const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  typescript: 74,
  cpp: 54,
  java: 62,
  c: 50,
  go: 60,
  rust: 73,
};

interface SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

async function submitCode(
  code: string,
  langId: number,
  stdin: string
): Promise<string> {
  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": JUDGE0_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({ source_code: code, language_id: langId, stdin }),
  });
  const data = await res.json();
  return data.token as string;
}

async function getResult(token: string): Promise<SubmissionResult> {
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
      {
        headers: {
          "X-RapidAPI-Key": JUDGE0_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );
    const data: SubmissionResult = await res.json();
    if (data.status.id > 2) return data;
  }
  throw new Error("Execution timed out");
}

export interface TestResult {
  input: string;
  expected: string;
  got: string;
  passed: boolean;
  stderr?: string;
  time?: string;
}

export async function runTests(
  code: string,
  language: string,
  tests: { input: string; expected: string }[]
): Promise<TestResult[]> {
  const langId = LANGUAGE_IDS[language.toLowerCase()];
  if (!langId) throw new Error(`Unsupported language: ${language}`);

  const results = await Promise.all(
    tests.map(async (test) => {
      const token = await submitCode(code, langId, test.input);
      const result = await getResult(token);
      const got = (result.stdout ?? "").trim();
      const expected = test.expected.trim();
      return {
        input: test.input,
        expected,
        got,
        passed: got === expected,
        stderr: result.stderr ?? result.compile_output ?? undefined,
        time: result.time ?? undefined,
      };
    })
  );

  return results;
}
