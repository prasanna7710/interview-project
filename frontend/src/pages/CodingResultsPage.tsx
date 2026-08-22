import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { api } from '../services/api';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RotateCcw,
  History,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface TestResultData {
  id: string;
  language: string;
  difficulty: string;
  totalQuestions: number;
  score: number;
  accuracy: number;
  timeTakenSec: number;
  strengths?: string;
  improvements?: string;
  aiFeedback?: string;
  questions: any[];
  submissions: any[];
}

export const CodingResultsPage: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<TestResultData | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await api.get(`/coding/tests/${testId}`);
        setTestResult(res.data.test);
      } catch (err) {
        console.error('Failed to load coding test results:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadResults();
  }, [testId]);

  if (isLoading || !testResult) {
    return (
      <AppLayout title="Coding Test Results">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const solvedCount = testResult.submissions?.filter((s) => s.status === 'passed').length || 0;
  const failedCount = Math.max(0, testResult.totalQuestions - solvedCount);

  let parsedStrengths: string[] = ['Basic Logic', 'Array Manipulations'];
  let parsedImprovements: string[] = ['Edge Case Validation'];

  try {
    if (testResult.strengths) parsedStrengths = JSON.parse(testResult.strengths);
    if (testResult.improvements) parsedImprovements = JSON.parse(testResult.improvements);
  } catch (e) {}

  return (
    <AppLayout title="Coding Test Performance Report" subtitle="Comprehensive evaluation of your code submissions & algorithmic accuracy">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Overview Score Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#111111] text-white flex flex-col items-center justify-center font-mono border border-[#222222] flex-shrink-0">
              <span className="text-2xl font-extrabold">{testResult.score}%</span>
              <span className="text-[9px] text-[#666666] tracking-wider uppercase">Score</span>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#111111]">{testResult.language} Coding Challenge</h2>
              <p className="text-xs text-[#2563EB] font-medium">{testResult.difficulty} Difficulty Level</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#666666]">
                <span className="flex items-center gap-1 font-mono font-semibold text-[#111111]">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                  Time Used: {Math.floor(testResult.timeTakenSec / 60)}m {testResult.timeTakenSec % 60}s
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono font-semibold text-[#111111]">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Accuracy: {testResult.accuracy}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/coding/setup"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#111111] hover:bg-black text-white font-medium px-4.5 py-2.5 rounded-xl shadow-2xs transition-all text-xs active:scale-[0.99]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Take Another Test
            </Link>
          </div>
        </div>

        {/* Breakdown Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-[#666666] block">Total Questions</span>
            <span className="text-2xl font-extrabold text-[#111111] font-mono">{testResult.totalQuestions}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-emerald-700 block">Questions Solved</span>
            <span className="text-2xl font-extrabold text-emerald-700 font-mono">{solvedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-red-600 block">Questions Failed</span>
            <span className="text-2xl font-extrabold text-red-700 font-mono">{failedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-[#2563EB] block">Test Accuracy</span>
            <span className="text-2xl font-extrabold text-[#2563EB] font-mono">{testResult.accuracy}%</span>
          </div>
        </div>

        {/* Strengths & Improvements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
            </h3>
            <ul className="space-y-2">
              {parsedStrengths.map((str, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-[#111111] bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <XCircle className="w-4 h-4 text-amber-600" /> Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {parsedImprovements.map((imp, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-[#111111] bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Performance Evaluation Card */}
        {testResult.aiFeedback && (
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" /> AI Performance Summary & Feedback
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E5E5]">
              {testResult.aiFeedback}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors"
          >
            <History className="w-4 h-4" /> View Full Practice History
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white font-medium px-5 py-2.5 rounded-xl text-xs transition-all shadow-2xs active:scale-[0.99]"
          >
            Back to Dashboard
          </Link>
        </div>

      </div>
    </AppLayout>
  );
};
