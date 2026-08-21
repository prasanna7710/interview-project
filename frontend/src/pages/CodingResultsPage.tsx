import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { api } from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  Sparkles,
  RotateCcw,
  History,
  TrendingUp,
  Loader2,
  FileCode,
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
  const navigate = useNavigate();

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
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
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
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex flex-col items-center justify-center shadow-md flex-shrink-0">
              <span className="text-3xl font-extrabold">{testResult.score}%</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase opacity-90">Score</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">{testResult.language} Coding Challenge</h2>
              <p className="text-xs text-brand-600 font-semibold">{testResult.difficulty} Difficulty Level</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1 font-semibold text-gray-800">
                  <Clock className="w-4 h-4 text-brand-600" />
                  Time Used: {Math.floor(testResult.timeTakenSec / 60)} min {testResult.timeTakenSec % 60} sec
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-gray-800">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Accuracy: {testResult.accuracy}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/coding/setup"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition text-xs"
            >
              <RotateCcw className="w-4 h-4" /> Take Another Test
            </Link>
          </div>
        </div>

        {/* Breakdown Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-gray-500 block">Total Questions</span>
            <span className="text-2xl font-bold text-gray-900">{testResult.totalQuestions}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-green-600 block">Questions Solved</span>
            <span className="text-2xl font-bold text-green-700">{solvedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-red-600 block">Questions Failed</span>
            <span className="text-2xl font-bold text-red-700">{failedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-brand-600 block">Test Accuracy</span>
            <span className="text-2xl font-bold text-brand-700">{testResult.accuracy}%</span>
          </div>
        </div>

        {/* Strengths & Improvements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Key Strengths
            </h3>
            <ul className="space-y-2">
              {parsedStrengths.map((str, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-gray-700 bg-green-50/50 p-2.5 rounded-xl border border-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-amber-600" /> Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {parsedImprovements.map((imp, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-gray-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Performance Evaluation Card */}
        {testResult.aiFeedback && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" /> AI Performance Summary & Feedback
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed bg-brand-50/40 p-4 rounded-xl border border-brand-100">
              {testResult.aiFeedback}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand-600 transition"
          >
            <History className="w-4 h-4" /> View Full Practice History
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-2xs"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};
