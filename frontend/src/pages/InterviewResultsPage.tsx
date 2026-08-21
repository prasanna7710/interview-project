import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Interview } from '../types';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Loader2,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const InterviewResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQIndex, setExpandedQIndex] = useState<number | null>(0);

  const { showToast } = useToast();

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.get(`/interviews/${id}`);
        setInterview(res.data.interview);
      } catch (err) {
        showToast('Failed to load interview evaluation results.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadReport();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout title="Interview Report">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!interview) {
    return (
      <AppLayout title="Interview Report">
        <div className="text-center py-12 text-gray-500">Report not found.</div>
      </AppLayout>
    );
  }

  const evals = interview.evaluations || [];
  const avg = (fn: (e: any) => number) =>
    evals.length > 0 ? Math.round(evals.reduce((a, b) => a + fn(b), 0) / evals.length) : Math.round(interview.overallScore);

  const techScore = avg((e) => e.technicalScore);
  const qualScore = avg((e) => e.qualityScore);
  const commScore = avg((e) => e.communicationScore);
  const confScore = avg((e) => e.confidenceScore);
  const relScore = avg((e) => e.relevanceScore);
  const overallScore = Math.round(interview.overallScore);

  const getScoreRating = (s: number) => {
    if (s >= 85) return { label: 'Excellent', color: 'text-green-700 bg-green-50 border-green-200' };
    if (s >= 70) return { label: 'Good', color: 'text-brand-700 bg-brand-50 border-brand-200' };
    return { label: 'Needs Improvement', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const rating = getScoreRating(overallScore);

  // Aggregate strengths & improvements across questions
  const allStrengths = Array.from(
    new Set(
      evals.flatMap((e) => {
        try {
          return typeof e.strengths === 'string' ? JSON.parse(e.strengths) : e.strengths;
        } catch (err) {
          return [];
        }
      })
    )
  ).filter(Boolean);

  const allImprovements = Array.from(
    new Set(
      evals.flatMap((e) => {
        try {
          return typeof e.improvements === 'string' ? JSON.parse(e.improvements) : e.improvements;
        } catch (err) {
          return [];
        }
      })
    )
  ).filter(Boolean);

  return (
    <AppLayout title="Interview Evaluation Results" subtitle="Detailed performance breakdown, score rubrics, and feedback">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Overall Score Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-brand-50 border-4 border-brand-500 text-brand-600 flex flex-col items-center justify-center shadow-sm">
              <span className="text-3xl font-extrabold">{overallScore}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">/ 100</span>
            </div>

            <div className="space-y-1">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${rating.color}`}>
                {rating.label}
              </span>
              <h2 className="text-xl font-bold text-gray-900">{interview.title}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-3">
                <span>Difficulty: <strong>{interview.difficulty}</strong></span>
                <span>•</span>
                <span>Duration: <strong>{Math.round(interview.durationSec / 60)} mins</strong></span>
                <span>•</span>
                <span>Questions: <strong>{interview.questions?.length || 0}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/interview/setup"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm text-sm transition"
            >
              <RotateCcw className="w-4 h-4" /> Practice Another Interview
            </Link>
          </div>
        </div>

        {/* 5-Category Weighted Rubric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: 'Technical (30%)', score: techScore, desc: 'Core concepts & architecture' },
            { title: 'Answer Quality (25%)', score: qualScore, desc: 'Completeness & depth' },
            { title: 'Communication (20%)', score: commScore, desc: 'Clarity & structure' },
            { title: 'Confidence (15%)', score: confScore, desc: 'Verbal poise & delivery' },
            { title: 'Relevance (10%)', score: relScore, desc: 'Direct question alignment' },
          ].map((cat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{cat.title}</span>
              <div className="text-2xl font-extrabold text-gray-900">{cat.score}<span className="text-xs font-normal text-gray-400">/100</span></div>
              <p className="text-[11px] text-gray-500">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Key Technical Strengths
            </h3>
            <ul className="space-y-2 text-xs text-gray-700">
              {allStrengths.length > 0 ? (
                allStrengths.map((s: any, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-green-50/50 p-2.5 rounded-xl border border-green-100">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Good overall attempt addressing the prompts.</li>
              )}
            </ul>
          </div>

          {/* Areas to Improve */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Improvement
            </h3>
            <ul className="space-y-2 text-xs text-gray-700">
              {allImprovements.length > 0 ? (
                allImprovements.map((imp: any, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Continue elaborating on trade-offs and edge cases.</li>
              )}
            </ul>
          </div>
        </div>

        {/* AI Recommendations Card */}
        <div className="bg-brand-50/60 p-6 rounded-2xl border border-brand-100 space-y-3">
          <h3 className="text-base font-bold text-brand-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" /> AI Actionable Recommendations
          </h3>
          <p className="text-xs text-brand-900 leading-relaxed">
            "Structure your explanations using the <strong>STAR method (Situation, Task, Action, Result)</strong>. When asked technical architecture questions, explicitly mention alternative design choices, error handling, and performance optimization."
          </p>
        </div>

        {/* Question-by-Question Review Accordion */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900">Question-by-Question Detailed Breakdown</h3>

          <div className="space-y-3">
            {interview.questions?.map((q, idx) => {
              const evalObj = q.answer?.evaluation;
              const isExpanded = expandedQIndex === idx;

              return (
                <div key={q.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    onClick={() => setExpandedQIndex(isExpanded ? null : idx)}
                    className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-900 truncate max-w-md">{q.questionText}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {evalObj && (
                        <span className="text-xs font-extrabold text-brand-600 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                          {Math.round(evalObj.overallScore)}/100
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 space-y-3 bg-white text-xs border-t border-gray-100">
                      <div>
                        <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Candidate Answer:</span>
                        <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200 italic">
                          "{q.answer?.answerText || 'No answer submitted.'}"
                        </p>
                      </div>

                      {evalObj && (
                        <div className="space-y-2 pt-1">
                          <span className="font-bold text-brand-700 uppercase tracking-wider text-[10px]">AI Feedback & Rubric:</span>
                          <p className="text-gray-700 leading-relaxed bg-brand-50/30 p-3 rounded-lg border border-brand-100">
                            {evalObj.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
