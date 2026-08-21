import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { executeCodeSafely, TestCase } from '../services/codeExecution.service';

// Built-in Question Template Bank categorized by Language & Topic
const QUESTION_BANK: Record<string, Array<{
  title: string;
  description: string;
  parameters: string[];
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  exampleInput: string;
  exampleOutput: string;
  starterCode: Record<string, string>;
  solutionCode: Record<string, string>;
  testCases: TestCase[];
  topic: string;
}>> = {
  python: [
    {
      title: 'Two Sum Problem',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      parameters: ['nums', 'target'],
      inputFormat: 'nums = [2, 7, 11, 15], target = 9',
      outputFormat: '[0, 1]',
      constraints: '2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9',
      exampleInput: '[2, 7, 11, 15], 9',
      exampleOutput: '[0, 1]',
      starterCode: {
        python: 'def solution(nums, target):\n    # Write your solution here\n    pass',
        javascript: 'function solution(nums, target) {\n  // Write your solution here\n}',
        java: 'public class Solution {\n    public int[] solution(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}',
        cpp: 'vector<int> solution(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}',
        c: 'int* solution(int* nums, int numsSize, int target) {\n    // Write your solution here\n    return 0;\n}',
      },
      solutionCode: {
        python: 'def solution(nums, target):\n    seen = {}\n    for i in range(len(nums)):\n        diff = target - nums[i]\n        if diff in seen:\n            return [seen[diff], i]\n        seen[nums[i]] = i\n    return []',
        javascript: 'function solution(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
        java: 'public class Solution {\n    public int[] solution(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) return new int[]{map.get(diff), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}',
        cpp: 'vector<int> solution(vector<int>& nums, int target) {\n    unordered_map<int, int> mp;\n    for (size_t i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (mp.count(diff)) return {mp[diff], (int)i};\n        mp[nums[i]] = i;\n    }\n    return {};\n}',
        c: 'int* solution(int* nums, int numsSize, int target) {\n    static int res[2];\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            if (nums[i] + nums[j] == target) {\n                res[0] = i; res[1] = j;\n                return res;\n            }\n        }\n    }\n    return res;\n}',
      },
      testCases: [
        { args: [[2, 7, 11, 15], 9], input: '[[2, 7, 11, 15], 9]', expectedOutput: '[0,1]', isHidden: false },
        { args: [[3, 2, 4], 6], input: '[[3, 2, 4], 6]', expectedOutput: '[1,2]', isHidden: false },
        { args: [[3, 3], 6], input: '[[3, 3], 6]', expectedOutput: '[0,1]', isHidden: true },
      ],
      topic: 'Arrays & Hashing',
    },
    {
      title: 'Reverse String Words',
      description: 'Given an input string s, reverse the order of words in the string.',
      parameters: ['s'],
      inputFormat: 's = "the sky is blue"',
      outputFormat: '"blue is sky the"',
      constraints: '1 <= s.length <= 10^4',
      exampleInput: '"the sky is blue"',
      exampleOutput: '"blue is sky the"',
      starterCode: {
        python: 'def solution(s):\n    # Write your solution here\n    pass',
        javascript: 'function solution(s) {\n  // Write your solution here\n}',
        java: 'public String solution(String s) { return ""; }',
        cpp: 'string solution(string s) { return ""; }',
        c: 'char* solution(char* s) { return s; }',
      },
      solutionCode: {
        python: 'def solution(s):\n    return " ".join(s.split()[::-1])',
        javascript: 'function solution(s) {\n  return s.trim().split(/\\s+/).reverse().join(" ");\n}',
        java: 'public String solution(String s) {\n    String[] words = s.trim().split("\\\\s+");\n    StringBuilder sb = new StringBuilder();\n    for (int i = words.length - 1; i >= 0; i--) {\n        sb.append(words[i]);\n        if (i > 0) sb.append(" ");\n    }\n    return sb.toString();\n}',
        cpp: 'string solution(string s) {\n    stringstream ss(s);\n    string word, res = "";\n    vector<string> words;\n    while (ss >> word) words.push_back(word);\n    for (int i = (int)words.size() - 1; i >= 0; i--) {\n        res += words[i] + (i > 0 ? " " : "");\n    }\n    return res;\n}',
        c: 'char* solution(char* s) {\n    return s;\n}',
      },
      testCases: [
        { args: ['the sky is blue'], input: '"the sky is blue"', expectedOutput: '"blue is sky the"', isHidden: false },
        { args: ['  hello world  '], input: '"  hello world  "', expectedOutput: '"world hello"', isHidden: false },
        { args: ['a good   example'], input: '"a good   example"', expectedOutput: '"example good a"', isHidden: true },
      ],
      topic: 'String Manipulation',
    },
    {
      title: 'Valid Palindrome Check',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      parameters: ['s'],
      inputFormat: 's = "A man, a plan, a canal: Panama"',
      outputFormat: 'true',
      constraints: '1 <= s.length <= 2 * 10^5',
      exampleInput: '"A man, a plan, a canal: Panama"',
      exampleOutput: 'true',
      starterCode: {
        python: 'def solution(s):\n    # Write your solution here\n    pass',
        javascript: 'function solution(s) {\n  // Write your solution here\n}',
        java: 'public boolean solution(String s) { return true; }',
        cpp: 'bool solution(string s) { return true; }',
        c: 'bool solution(char* s) { return true; }',
      },
      solutionCode: {
        python: 'def solution(s):\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]',
        javascript: 'function solution(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}',
        java: 'public boolean solution(String s) {\n    String clean = s.toLowerCase().replaceAll("[^a-z0-9]", "");\n    return clean.equals(new StringBuilder(clean).reverse().toString());\n}',
        cpp: 'bool solution(string s) {\n    string clean = "";\n    for (char c : s) {\n        if (isalnum(c)) clean += tolower(c);\n    }\n    string rev = clean;\n    reverse(rev.begin(), rev.end());\n    return clean == rev;\n}',
        c: 'bool solution(char* s) {\n    int l = 0, r = strlen(s) - 1;\n    while (l < r) {\n        while (l < r && !isalnum(s[l])) l++;\n        while (l < r && !isalnum(s[r])) r--;\n        if (tolower(s[l]) != tolower(s[r])) return false;\n        l++; r--;\n    }\n    return true;\n}',
      },
      testCases: [
        { args: ['A man, a plan, a canal: Panama'], input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
        { args: ['race a car'], input: '"race a car"', expectedOutput: 'false', isHidden: false },
        { args: [' '], input: '" "', expectedOutput: 'true', isHidden: true },
      ],
      topic: 'Strings & Two Pointers',
    },
    {
      title: 'Find Maximum Subarray Sum',
      description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
      parameters: ['nums'],
      inputFormat: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
      outputFormat: '6',
      constraints: '1 <= nums.length <= 10^5',
      exampleInput: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
      exampleOutput: '6',
      starterCode: {
        python: 'def solution(nums):\n    # Write your solution here\n    pass',
        javascript: 'function solution(nums) {\n  // Write your solution here\n}',
        java: 'public int solution(int[] nums) { return 0; }',
        cpp: 'int solution(vector<int>& nums) { return 0; }',
        c: 'int solution(int* nums, int size) { return 0; }',
      },
      solutionCode: {
        python: 'def solution(nums):\n    max_so_far = nums[0]\n    curr = nums[0]\n    for i in range(1, len(nums)):\n        curr = max(nums[i], curr + nums[i])\n        max_so_far = max(max_so_far, curr)\n    return max_so_far',
        javascript: 'function solution(nums) {\n  let maxSoFar = nums[0], curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxSoFar = Math.max(maxSoFar, curr);\n  }\n  return maxSoFar;\n}',
        java: 'public int solution(int[] nums) {\n    int maxSoFar = nums[0], curr = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        maxSoFar = Math.max(maxSoFar, curr);\n    }\n    return maxSoFar;\n}',
        cpp: 'int solution(vector<int>& nums) {\n    int maxSoFar = nums[0], curr = nums[0];\n    for (size_t i = 1; i < nums.size(); i++) {\n        curr = max(nums[i], curr + nums[i]);\n        maxSoFar = max(maxSoFar, curr);\n    }\n    return maxSoFar;\n}',
        c: 'int solution(int* nums, int size) {\n    int maxSoFar = nums[0], curr = nums[0];\n    for (int i = 1; i < size; i++) {\n        curr = (nums[i] > curr + nums[i]) ? nums[i] : curr + nums[i];\n        if (curr > maxSoFar) maxSoFar = curr;\n    }\n    return maxSoFar;\n}',
      },
      testCases: [
        { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], input: '[[-2, 1, -3, 4, -1, 2, 1, -5, 4]]', expectedOutput: '6', isHidden: false },
        { args: [[1]], input: '[[1]]', expectedOutput: '1', isHidden: false },
        { args: [[5, 4, -1, 7, 8]], input: '[[5, 4, -1, 7, 8]]', expectedOutput: '23', isHidden: true },
      ],
      topic: 'Dynamic Programming',
    },
    {
      title: 'Merge Sorted Arrays',
      description: 'Given two sorted integer arrays nums1 and nums2, merge nums2 into nums1 as one sorted array.',
      parameters: ['nums1', 'nums2'],
      inputFormat: 'nums1 = [1, 2, 3], nums2 = [2, 5, 6]',
      outputFormat: '[1, 2, 2, 3, 5, 6]',
      constraints: '0 <= nums1.length, nums2.length <= 200',
      exampleInput: '[1, 2, 3], [2, 5, 6]',
      exampleOutput: '[1, 2, 2, 3, 5, 6]',
      starterCode: {
        python: 'def solution(nums1, nums2):\n    # Write your solution here\n    pass',
        javascript: 'function solution(nums1, nums2) {\n  // Write your solution here\n}',
        java: 'public int[] solution(int[] n1, int[] n2) { return n1; }',
        cpp: 'vector<int> solution(vector<int>& n1, vector<int>& n2) { return n1; }',
        c: 'int* solution(int* n1, int n1s, int* n2, int n2s) { return n1; }',
      },
      solutionCode: {
        python: 'def solution(nums1, nums2):\n    return sorted(nums1 + nums2)',
        javascript: 'function solution(nums1, nums2) {\n  return [...nums1, ...nums2].sort((a, b) => a - b);\n}',
        java: 'public int[] solution(int[] n1, int[] n2) {\n    int[] res = new int[n1.length + n2.length];\n    System.arraycopy(n1, 0, res, 0, n1.length);\n    System.arraycopy(n2, 0, res, n1.length, n2.length);\n    Arrays.sort(res);\n    return res;\n}',
        cpp: 'vector<int> solution(vector<int>& n1, vector<int>& n2) {\n    vector<int> res = n1;\n    res.insert(res.end(), n2.begin(), n2.end());\n    sort(res.begin(), res.end());\n    return res;\n}',
        c: 'int* solution(int* n1, int n1s, int* n2, int n2s) {\n    return n1;\n}',
      },
      testCases: [
        { args: [[1, 2, 3], [2, 5, 6]], input: '[[1, 2, 3], [2, 5, 6]]', expectedOutput: '[1,2,2,3,5,6]', isHidden: false },
        { args: [[1], []], input: '[[1], []]', expectedOutput: '[1]', isHidden: false },
        { args: [[0, 9], [1, 5, 8]], input: '[[0, 9], [1, 5, 8]]', expectedOutput: '[0,1,5,8,9]', isHidden: true },
      ],
      topic: 'Sorting & Algorithms',
    },
  ],
};

export async function setupCodingTest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      language = 'Python',
      difficulty = 'Intermediate',
      questionCount = 5,
      durationMinutes = 30,
    } = req.body;

    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { skills: true, projects: true },
    });

    const isResumePersonalized = !!latestResume;

    const pool = QUESTION_BANK[language.toLowerCase()] || QUESTION_BANK['python'];
    const selected = pool.slice(0, Math.min(questionCount, pool.length));

    const codingTest = await prisma.codingTest.create({
      data: {
        userId,
        language,
        difficulty,
        totalQuestions: selected.length,
        durationMinutes,
        status: 'in_progress',
        questions: {
          create: selected.map((q, idx) => ({
            orderIndex: idx + 1,
            title: q.title,
            description: q.description,
            inputFormat: q.inputFormat,
            outputFormat: q.outputFormat,
            constraints: q.constraints,
            exampleInput: q.exampleInput,
            exampleOutput: q.exampleOutput,
            starterCode: JSON.stringify(q.starterCode),
            solutionCode: JSON.stringify(q.solutionCode),
            testCases: JSON.stringify(q.testCases),
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return res.status(201).json({
      message: 'Coding test created successfully',
      test: codingTest,
      isResumePersonalized,
    });
  } catch (error) {
    console.error('Setup coding test error:', error);
    return res.status(500).json({ error: 'Failed to initialize coding test' });
  }
}

export async function getCodingTest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const codingTest = await prisma.codingTest.findFirst({
      where: { id, userId },
      include: {
        questions: true,
        submissions: true,
      },
    });

    if (!codingTest) {
      return res.status(404).json({ error: 'Coding test not found' });
    }

    return res.json({ test: codingTest });
  } catch (error) {
    console.error('Get coding test error:', error);
    return res.status(500).json({ error: 'Failed to fetch coding test' });
  }
}

export async function runCode(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { testId } = req.params;
    const { questionId, code, language } = req.body;

    const testQuestion = await prisma.codingTestQuestion.findFirst({
      where: { id: questionId, testId },
    });

    if (!testQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    let allTestCases: TestCase[] = [];
    try {
      allTestCases = JSON.parse(testQuestion.testCases);
    } catch (e) {}

    const visibleTestCases = allTestCases.filter((tc) => !tc.isHidden);

    const executionResult = await executeCodeSafely(
      code,
      language || 'Python',
      visibleTestCases.length > 0 ? visibleTestCases : allTestCases
    );

    return res.json({ executionResult });
  } catch (error) {
    console.error('Run code error:', error);
    return res.status(500).json({ error: 'Code execution unavailable' });
  }
}

export async function submitQuestion(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { testId } = req.params;
    const { questionId, code, language } = req.body;

    const testQuestion = await prisma.codingTestQuestion.findFirst({
      where: { id: questionId, testId },
    });

    if (!testQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    let allTestCases: TestCase[] = [];
    try {
      allTestCases = JSON.parse(testQuestion.testCases);
    } catch (e) {}

    const executionResult = await executeCodeSafely(code, language || 'Python', allTestCases);

    const submission = await prisma.codingSubmission.create({
      data: {
        testId,
        questionId,
        code,
        language: language || 'Python',
        status: executionResult.status,
        passedTestCases: executionResult.passedTestCases,
        totalTestCases: executionResult.totalTestCases,
        stdout: executionResult.stdout,
        executionTimeMs: executionResult.executionTimeMs,
      },
    });

    return res.json({ submission, executionResult });
  } catch (error) {
    console.error('Submit question error:', error);
    return res.status(500).json({ error: 'Failed to submit question' });
  }
}

export async function finishCodingTest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { testId } = req.params;
    const { timeTakenSec = 0 } = req.body;

    const codingTest = await prisma.codingTest.findFirst({
      where: { id: testId, userId },
      include: {
        questions: true,
        submissions: true,
      },
    });

    if (!codingTest) {
      return res.status(404).json({ error: 'Coding test not found' });
    }

    const totalQuestions = codingTest.questions.length;
    let passedQuestionsCount = 0;
    let totalPassedCases = 0;
    let totalCases = 0;

    const latestSubmissionsByQuestion: Record<string, any> = {};
    codingTest.submissions.forEach((sub) => {
      latestSubmissionsByQuestion[sub.questionId] = sub;
    });

    Object.values(latestSubmissionsByQuestion).forEach((sub: any) => {
      if (sub.status === 'passed') passedQuestionsCount++;
      totalPassedCases += sub.passedTestCases || 0;
      totalCases += sub.totalTestCases || 0;
    });

    const score = Math.round((passedQuestionsCount / (totalQuestions || 1)) * 100);
    const accuracy = totalCases > 0 ? Math.round((totalPassedCases / totalCases) * 100) : score;

    const strengths = [
      `Language proficiency in ${codingTest.language}`,
      `Completed ${passedQuestionsCount} of ${totalQuestions} algorithmic questions`,
    ];
    const improvements = [
      `Practice edge case handling and optimization for ${codingTest.language}`,
    ];

    const aiFeedback = `Candidate completed ${passedQuestionsCount} out of ${totalQuestions} coding questions in ${codingTest.language} (${codingTest.difficulty} difficulty) with an overall score of ${score}% and ${accuracy}% test-case accuracy. Time taken: ${Math.floor(timeTakenSec / 60)} minutes.`;

    const updated = await prisma.codingTest.update({
      where: { id: testId },
      data: {
        status: 'completed',
        score,
        accuracy,
        timeTakenSec,
        strengths: JSON.stringify(strengths),
        improvements: JSON.stringify(improvements),
        aiFeedback,
        completedAt: new Date(),
      },
    });

    return res.json({ message: 'Coding test finished', test: updated });
  } catch (error) {
    console.error('Finish coding test error:', error);
    return res.status(500).json({ error: 'Failed to finish coding test' });
  }
}

export async function getCodingHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    const tests = await prisma.codingTest.findMany({
      where: { userId, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: true,
      },
    });

    return res.json({ tests });
  } catch (error) {
    console.error('Get coding history error:', error);
    return res.status(500).json({ error: 'Failed to fetch coding history' });
  }
}
