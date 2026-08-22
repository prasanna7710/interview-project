import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  Code,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Terminal,
  FileCode,
  Copy,
  Clipboard,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface Question {
  id: string;
  orderIndex: number;
  title: string;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  exampleInput?: string;
  exampleOutput?: string;
  starterCode?: string;
  solutionCode?: string;
  testCases?: string;
}

interface TestData {
  id: string;
  language: string;
  difficulty: string;
  totalQuestions: number;
  durationMinutes: number;
  questions: Question[];
}

export const CodingTestPage: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // User Code state per question (strictly starter code initially)
  const [userCodes, setUserCodes] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Execution Results per question
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'testcases'>('description');

  // Solution Reveal State (Revealed per question ID in separate read-only panel)
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // External Compiler Modal State
  const [showExternalModal, setShowExternalModal] = useState(false);

  // Timer countdown in seconds
  const [timeLeftSec, setTimeLeftSec] = useState<number>(1800);

  useEffect(() => {
    async function loadTest() {
      try {
        const res = await api.get(`/coding/tests/${testId}`);
        const test: TestData = res.data.test;
        setTestData(test);
        setTimeLeftSec((test.durationMinutes || 30) * 60);

        // Initialize code states strictly from starterCode templates
        const initialCodes: Record<string, string> = {};
        test.questions.forEach((q) => {
          if (q.starterCode) {
            try {
              const templates = JSON.parse(q.starterCode);
              const langKey = test.language.toLowerCase();
              initialCodes[q.id] = templates[langKey] || templates['python'] || templates['javascript'] || 'def solution(nums, target):\n    # Write your solution here\n    pass';
            } catch (e) {
              initialCodes[q.id] = 'def solution(nums, target):\n    # Write your solution here\n    pass';
            }
          } else {
            initialCodes[q.id] = 'def solution(nums, target):\n    # Write your solution here\n    pass';
          }
        });
        setUserCodes(initialCodes);
      } catch (err) {
        console.error('Failed to load coding test:', err);
        showToast('Failed to load coding test session.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadTest();
  }, [testId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeftSec <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSec]);

  const activeQuestion = testData?.questions[activeQuestionIndex];

  // Helper to extract official solution per question & language (Question-specific)
  const getOfficialSolution = (q: Question): string => {
    if (!q || !testData) return '';
    if (q.solutionCode) {
      try {
        const solObj = JSON.parse(q.solutionCode);
        const langKey = testData.language.toLowerCase();
        return solObj[langKey] || solObj['python'] || solObj['javascript'] || '// Solution unavailable';
      } catch (e) {}
    }
    return '// Official solution unavailable';
  };

  const handleCodeChange = (code: string) => {
    if (!activeQuestion) return;
    setUserCodes((prev) => ({ ...prev, [activeQuestion.id]: code }));
  };

  const handleResetCode = () => {
    if (!activeQuestion || !testData) return;
    if (activeQuestion.starterCode) {
      try {
        const templates = JSON.parse(activeQuestion.starterCode);
        const langKey = testData.language.toLowerCase();
        const defCode = templates[langKey] || templates['python'] || templates['javascript'] || '';
        setUserCodes((prev) => ({ ...prev, [activeQuestion.id]: defCode }));
        showToast('Code reset to default starter template.', 'info');
      } catch (e) {}
    }
  };

  // 1. Copy Code from Editor to Clipboard
  const handleCopyCode = async () => {
    if (!activeQuestion) return;
    const codeToCopy = userCodes[activeQuestion.id] || '';
    try {
      await navigator.clipboard.writeText(codeToCopy);
      showToast('Code copied successfully.', 'success');
    } catch (e) {
      showToast('Failed to copy code to clipboard.', 'error');
    }
  };

  // 2. Paste Code from Clipboard to Editor
  const handlePasteCode = async () => {
    if (!activeQuestion) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUserCodes((prev) => ({ ...prev, [activeQuestion.id]: text }));
        showToast('Code pasted successfully.', 'success');
      } else {
        showToast('Please use Ctrl + V to paste your code.', 'info');
      }
    } catch (e) {
      showToast('Please use Ctrl + V to paste your code.', 'info');
    }
  };

  // 3. Copy Question text to Clipboard
  const handleCopyQuestion = async () => {
    if (!activeQuestion) return;
    const textToCopy = `Question ${activeQuestion.orderIndex}: ${activeQuestion.title}
--------------------------------------------------
Description:
${activeQuestion.description}

Input Format: ${activeQuestion.inputFormat || 'N/A'}
Output Format: ${activeQuestion.outputFormat || 'N/A'}
Constraints: ${activeQuestion.constraints || 'N/A'}

Example Input:
${activeQuestion.exampleInput || 'N/A'}

Example Output:
${activeQuestion.exampleOutput || 'N/A'}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Question copied successfully.', 'success');
    } catch (e) {
      showToast('Failed to copy question.', 'error');
    }
  };

  // 4. Confirm & Reveal Official Solution (Replaces editor content completely with official solution)
  const handleConfirmShowAnswer = () => {
    if (!activeQuestion) return;
    const solCode = getOfficialSolution(activeQuestion);
    setUserCodes((prev) => ({ ...prev, [activeQuestion.id]: solCode }));
    setRevealedSolutions((prev) => ({ ...prev, [activeQuestion.id]: true }));
    setShowAnswerModal(false);
    showToast(`Official solution loaded into editor for Q${activeQuestion.orderIndex}.`, 'info');
  };

  // 5. Copy ONLY the Official Solution code to Clipboard
  const handleCopyAnswer = async () => {
    if (!activeQuestion) return;
    const solCode = getOfficialSolution(activeQuestion);
    try {
      await navigator.clipboard.writeText(solCode);
      showToast('Official solution copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy solution.', 'error');
    }
  };

  // 6. Run Code
  const handleRunCode = async () => {
    if (!activeQuestion || !testId || !testData) return;
    setIsExecuting(true);
    try {
      const code = userCodes[activeQuestion.id] || '';
      const res = await api.post(`/coding/tests/${testId}/run`, {
        questionId: activeQuestion.id,
        code,
        language: testData.language,
      });

      const execResult = res.data.executionResult;
      setExecutionResults((prev) => ({
        ...prev,
        [activeQuestion.id]: execResult,
      }));

      setActiveTab('testcases');
      if (execResult.status === 'passed') {
        showToast('Visible Test Cases Passed! 🎉', 'success');
      } else {
        showToast('Test evaluation finished. Review test cases below.', 'info');
      }
    } catch (err: any) {
      console.error('Run code failed:', err);
      setExecutionResults((prev) => ({
        ...prev,
        [activeQuestion.id]: {
          status: 'unavailable',
          passedTestCases: 0,
          totalTestCases: 1,
          results: [
            {
              testCaseIndex: 1,
              input: activeQuestion.exampleInput || '',
              expectedOutput: activeQuestion.exampleOutput || '',
              actualOutput: 'Code execution is currently unavailable.',
              passed: false,
              error: 'Code execution unavailable',
            },
          ],
        },
      }));
      setActiveTab('testcases');
      showToast('Code execution is currently unavailable.', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  // 7. Submit Question Solution
  const handleSubmitQuestion = async () => {
    if (!activeQuestion || !testId || !testData) return;
    setIsSubmitting(true);
    try {
      const code = userCodes[activeQuestion.id] || '';
      const res = await api.post(`/coding/tests/${testId}/submit-question`, {
        questionId: activeQuestion.id,
        code,
        language: testData.language,
      });

      const execResult = res.data.executionResult;
      setExecutionResults((prev) => ({
        ...prev,
        [activeQuestion.id]: execResult,
      }));

      setActiveTab('testcases');
      showToast(`Question ${activeQuestionIndex + 1} Submitted!`, 'success');

      if (activeQuestionIndex < testData.questions.length - 1) {
        setTimeout(() => setActiveQuestionIndex((prev) => prev + 1), 600);
      }
    } catch (err: any) {
      console.error('Submit question failed:', err);
      showToast('Code execution unavailable. You can review the solution or copy your code to test it externally.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishTest = async () => {
    if (!testId || !testData) return;
    setIsFinishing(true);
    try {
      const timeTakenSec = (testData.durationMinutes * 60) - timeLeftSec;
      await api.post(`/coding/tests/${testId}/finish`, { timeTakenSec });
      showToast('Coding Test Submitted Successfully!', 'success');
      navigate(`/coding/results/${testId}`);
    } catch (err) {
      console.error('Finish test error:', err);
      showToast('Failed to finish coding test.', 'error');
    } finally {
      setIsFinishing(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading || !testData || !activeQuestion) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
      </div>
    );
  }

  const currentResult = executionResults[activeQuestion.id];
  const isAnswerRevealed = !!revealedSolutions[activeQuestion.id];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans select-none text-[#111111]">
      
      {/* Top Navbar Header */}
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#111111] font-bold text-sm">
            <Code className="w-4 h-4 text-[#2563EB]" />
            <span>Coding Test ({testData.language})</span>
          </div>

          <span className="bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] text-xs font-mono px-2 py-0.5 rounded">
            {testData.difficulty}
          </span>
        </div>

        {/* Timer & External Compiler / Finish Test */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-1 rounded-lg text-xs font-mono font-bold text-[#111111]">
            <Clock className="w-3.5 h-3.5 text-[#2563EB] animate-pulse" />
            <span>{formatTimer(timeLeftSec)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowExternalModal(true)}
            className="bg-white hover:bg-gray-50 text-[#111111] border border-[#E5E5E5] text-xs font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
            title="Open External Compiler Options"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
            External Compiler
          </button>

          <button
            type="button"
            onClick={handleFinishTest}
            disabled={isFinishing}
            className="bg-[#111111] hover:bg-black disabled:bg-gray-400 text-white text-xs font-medium px-3.5 py-1 rounded-lg transition-all shadow-2xs flex items-center gap-1.5 active:scale-[0.99]"
          >
            {isFinishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit Complete Test
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4 max-w-7xl w-full mx-auto">
        
        {/* Left Side: Question Details & Navigation */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs overflow-hidden">
          
          {/* Question Tabs Header */}
          <div className="border-b border-[#E5E5E5] p-3 bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {testData.questions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    activeQuestionIndex === idx
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : executionResults[q.id]?.status === 'passed'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-white border border-[#E5E5E5] text-[#111111] hover:bg-gray-50'
                  }`}
                >
                  Q{idx + 1}
                  {executionResults[q.id]?.status === 'passed' && <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-[#666666] text-xs font-mono font-semibold">
              <button
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 hover:text-[#111111] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                {activeQuestionIndex + 1} / {testData.questions.length}
              </span>
              <button
                disabled={activeQuestionIndex === testData.questions.length - 1}
                onClick={() => setActiveQuestionIndex((prev) => Math.min(testData.questions.length - 1, prev + 1))}
                className="p-1 hover:text-[#111111] disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Left Panel Tabs Header */}
          <div className="flex items-center justify-between border-b border-[#E5E5E5] text-xs font-bold text-[#666666] px-4 bg-white">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'description' ? 'border-[#2563EB] text-[#111111]' : 'border-transparent hover:text-[#111111]'
                }`}
              >
                Problem Description
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('testcases')}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'testcases' ? 'border-[#2563EB] text-[#111111]' : 'border-transparent hover:text-[#111111]'
                }`}
              >
                Test Cases & Output
                {currentResult && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${currentResult.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {currentResult.passedTestCases}/{currentResult.totalTestCases}
                  </span>
                )}
              </button>
            </div>

            {/* Top Action Buttons: Copy Question & Show Answer */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyQuestion}
                className="text-[#666666] hover:text-[#111111] text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-[#F5F5F5] border border-[#E5E5E5] transition-colors"
                title="Copy question text to clipboard"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Question
              </button>

              {!isAnswerRevealed ? (
                <button
                  type="button"
                  onClick={() => setShowAnswerModal(true)}
                  className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Show Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealedSolutions((prev) => ({ ...prev, [activeQuestion.id]: false }))}
                  className="text-[#666666] hover:text-[#111111] text-[11px] font-medium flex items-center gap-1 px-2 py-1"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Hide Answer
                </button>
              )}
            </div>
          </div>

          {/* Left Content Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs text-[#111111] leading-relaxed">
            {activeTab === 'description' ? (
              <>
                <h3 className="text-sm font-bold text-[#111111]">
                  {activeQuestion.orderIndex}. {activeQuestion.title}
                </h3>
                <p className="text-[#666666] whitespace-pre-line">{activeQuestion.description}</p>

                {activeQuestion.inputFormat && (
                  <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E5E5] space-y-1">
                    <h4 className="font-bold text-[#111111] text-[10px] font-mono uppercase tracking-wider">Input Format</h4>
                    <p className="font-mono text-[#666666]">{activeQuestion.inputFormat}</p>
                  </div>
                )}

                {activeQuestion.outputFormat && (
                  <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E5E5] space-y-1">
                    <h4 className="font-bold text-[#111111] text-[10px] font-mono uppercase tracking-wider">Output Format</h4>
                    <p className="font-mono text-[#666666]">{activeQuestion.outputFormat}</p>
                  </div>
                )}

                {activeQuestion.constraints && (
                  <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E5E5] space-y-1">
                    <h4 className="font-bold text-[#111111] text-[10px] font-mono uppercase tracking-wider">Constraints</h4>
                    <p className="font-mono text-[#666666]">{activeQuestion.constraints}</p>
                  </div>
                )}

                {activeQuestion.exampleInput && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E5E5]">
                      <h4 className="font-bold text-[#111111] text-[10px] font-mono uppercase tracking-wider">Example Input</h4>
                      <code className="block mt-1 font-mono text-[#2563EB]">{activeQuestion.exampleInput}</code>
                    </div>
                    <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E5E5]">
                      <h4 className="font-bold text-[#111111] text-[10px] font-mono uppercase tracking-wider">Example Output</h4>
                      <code className="block mt-1 font-mono text-emerald-700">{activeQuestion.exampleOutput}</code>
                    </div>
                  </div>
                )}

                {/* SEPARATE READ-ONLY OFFICIAL SOLUTION PANEL */}
                {isAnswerRevealed && (
                  <div className="mt-6 bg-[#111111] text-white p-4 rounded-xl font-mono text-xs border border-[#222222] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#333333] pb-2.5">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> Official Solution (Q{activeQuestion.orderIndex} - {testData.language})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyAnswer}
                          className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-[11px] font-sans font-semibold flex items-center gap-1 border border-white/20"
                        >
                          <Copy className="w-3 h-3" /> Copy Answer
                        </button>
                        <button
                          type="button"
                          onClick={() => setRevealedSolutions((prev) => ({ ...prev, [activeQuestion.id]: false }))}
                          className="text-gray-400 hover:text-white text-[11px] font-sans"
                        >
                          Hide Answer
                        </button>
                      </div>
                    </div>

                    <pre className="overflow-x-auto text-emerald-400 leading-relaxed pt-1 whitespace-pre-wrap">
                      {getOfficialSolution(activeQuestion)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              /* Test Cases & Execution Panel */
              <div className="space-y-4">
                {currentResult ? (
                  <>
                    <div className="flex items-center justify-between bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E5E5]">
                      <span className="font-bold text-[#111111]">Execution Evaluation:</span>
                      <span className={`font-mono font-bold px-2.5 py-1 rounded text-xs ${
                        currentResult.status === 'passed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : currentResult.status === 'unavailable'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {currentResult.status === 'passed'
                          ? '✓ All Test Cases Passed'
                          : currentResult.status === 'unavailable'
                          ? 'Not Evaluated (Execution Unavailable)'
                          : '✗ Test Cases Failed'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentResult.results?.map((resItem: any) => (
                        <div
                          key={resItem.testCaseIndex}
                          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                            resItem.passed
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-red-50/50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5 font-mono">
                              {resItem.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              Test Case {resItem.testCaseIndex} {resItem.isHidden ? '(Hidden)' : ''}
                            </span>
                            <span className={resItem.passed ? 'text-emerald-700 font-mono' : 'text-red-700 font-mono'}>
                              {resItem.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>

                          {!resItem.isHidden && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                              <div>
                                <span className="text-[#666666] font-sans block">Input:</span>
                                <span className="text-[#111111]">{resItem.input}</span>
                              </div>
                              <div>
                                <span className="text-[#666666] font-sans block">Expected Output:</span>
                                <span className="text-emerald-700">{resItem.expectedOutput}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[#666666] font-sans block">Actual Output:</span>
                                <span className={resItem.passed ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                                  {resItem.actualOutput}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-[#666666] space-y-2 bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E5E5]">
                    <Terminal className="w-7 h-7 text-gray-400 mx-auto" />
                    <p className="text-xs font-medium">Click "Run Code" or "Submit Solution" to evaluate test cases.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Editor Panel */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs overflow-hidden">
          
          {/* Code Editor Header & Toolbars */}
          <div className="border-b border-[#E5E5E5] p-3 bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <FileCode className="w-4 h-4 text-[#2563EB]" />
              <span>Solution Editor ({testData.language})</span>
            </div>

            {/* Utility Buttons: Copy Code, Paste Code, Reset Code */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[#666666] hover:text-[#111111] text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#E5E5E5] transition-colors"
                title="Copy editor code to clipboard"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>

              <button
                type="button"
                onClick={handlePasteCode}
                className="text-[#666666] hover:text-[#111111] text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#E5E5E5] transition-colors"
                title="Paste code from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" /> Paste Code
              </button>

              <button
                type="button"
                onClick={handleResetCode}
                className="text-[#666666] hover:text-[#111111] text-[11px] font-medium flex items-center gap-1 px-2 py-1 hover:bg-gray-200 transition-colors rounded"
                title="Reset Code Template"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Web Code Editor Textarea Container */}
          <div className="flex-1 relative bg-[#111111] text-gray-100 font-mono text-xs p-4 flex flex-col">
            <textarea
              value={userCodes[activeQuestion.id] || ''}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="def solution(nums, target):\n    # Write your solution here\n    pass"
              spellCheck={false}
              className="w-full h-full bg-transparent text-white font-mono outline-none resize-none leading-relaxed tracking-wide custom-scrollbar"
              style={{ minHeight: '300px' }}
            />
          </div>

          {/* Bottom Action Footer */}
          <div className="p-3 bg-white border-t border-[#E5E5E5] flex items-center justify-between">
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isExecuting || isSubmitting}
              className="inline-flex items-center gap-1.5 bg-[#F5F5F5] hover:bg-gray-100 text-[#111111] font-medium px-4 py-2 rounded-xl text-xs transition-colors border border-[#E5E5E5]"
            >
              {isExecuting ? <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
              Run Code
            </button>

            <button
              type="button"
              onClick={handleSubmitQuestion}
              disabled={isExecuting || isSubmitting}
              className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-black disabled:bg-gray-400 text-white font-medium px-5 py-2 rounded-xl text-xs transition-all shadow-2xs active:scale-[0.99]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              Submit Solution
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG FOR SHOW ANSWER */}
      {showAnswerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xs border border-[#E5E5E5] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111]">View Official Solution?</h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Are you sure you want to view the solution?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E5E5]">
              <button
                type="button"
                onClick={() => setShowAnswerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#666666] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmShowAnswer}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-2xs"
              >
                Show Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXTERNAL COMPILER DIALOG */}
      {showExternalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xs border border-[#E5E5E5] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#F5F5F5] text-[#111111] rounded-xl border border-[#E5E5E5]">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111]">External Coding Environment</h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  You can copy your code and test it in an external coding environment.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => { handleCopyQuestion(); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-gray-100 text-xs font-medium text-[#111111] transition-colors"
              >
                <span>1. Copy Question to Clipboard</span>
                <Copy className="w-4 h-4 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => { handleCopyCode(); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-gray-100 text-xs font-medium text-[#111111] transition-colors"
              >
                <span>2. Copy Solution Code to Clipboard</span>
                <Clipboard className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
              <span className="text-[11px] text-[#666666]">No private data is shared externally.</span>
              <button
                type="button"
                onClick={() => setShowExternalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#111111] bg-[#F5F5F5] hover:bg-gray-100 transition-colors border border-[#E5E5E5]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
