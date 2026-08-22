import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Interview } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Loader2,
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
          <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!interview) {
    return (
      <AppLayout title="Interview Report">
        <div className="text-center py-12 text-[#666666] text-xs">Report not found.</div>
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
    if (s >= 85) return { label: 'Excellent', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (s >= 70) return { label: 'Good', color: 'text-[#2563EB] bg-blue-50 border-blue-200' };
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
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E5E5] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#111111] text-white flex flex-col items-center justify-center font-mono border border-[#222222]">
              <span className="text-2xl font-extrabold">{overallScore}</span>
              <span className="text-[9px] text-[#666666] uppercase">/ 100</span>
            </div>

            <div className="space-y-1">
              <span className={`inline-block text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${rating.color}`}>
                {rating.label}
              </span>
              <h2 className="text-lg font-bold text-[#111111]">{interview.title}</h2>
              <p className="text-xs text-[#666666] flex items-center gap-3">
                <span>Difficulty: <strong className="text-[#111111]">{interview.difficulty}</strong></span>
                <span>•</span>
                <span>Duration: <strong className="text-[#111111]">{Math.round(interview.durationSec / 60)} mins</strong></span>
                <span>•</span>
                <span>Questions: <strong className="text-[#111111]">{interview.questions?.length || 0}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/interview/setup"
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white font-medium px-4.5 py-2.5 rounded-xl shadow-2xs text-xs transition-all active:scale-[0.99]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Practice Another Interview
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
            <div key={idx} className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-1.5">
              <span className="text-[10px] font-mono font-semibold text-[#666666] uppercase tracking-wider">{cat.title}</span>
              <div className="text-xl font-extrabold text-[#111111] font-mono">{cat.score}<span className="text-xs font-normal text-[#666666]">/100</span></div>
              <p className="text-[11px] text-[#666666]">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Technical Strengths
            </h3>
            <ul className="space-y-2 text-xs text-[#111111]">
              {allStrengths.length > 0 ? (
                allStrengths.map((s: any, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))
              ) : (
                <li className="text-[#666666]">Good overall attempt addressing the prompts.</li>
              )}
            </ul>
          </div>

          {/* Areas to Improve */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Improvement
            </h3>
            <ul className="space-y-2 text-xs text-[#111111]">
              {allImprovements.length > 0 ? (
                allImprovements.map((imp: any, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))
              ) : (
                <li className="text-[#666666]">Continue elaborating on trade-offs and edge cases.</li>
              )}
            </ul>
          </div>
        </div>

        {/* AI Recommendations Card */}
        <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-[#E5E5E5] space-y-2.5">
          <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" /> AI Actionable Recommendations
          </h3>
          <p className="text-xs text-[#666666] leading-relaxed">
            "Structure your explanations using the <strong>STAR method (Situation, Task, Action, Result)</strong>. When asked technical architecture questions, explicitly mention alternative design choices, error handling, and performance optimization."
          </p>
        </div>

        {/* Question-by-Question Review Accordion */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#111111]">Question-by-Question Detailed Breakdown</h3>

          <div className="space-y-3">
            {interview.questions?.map((q, idx) => {
              const evalObj = q.answer?.evaluation;
              const isExpanded = expandedQIndex === idx;

              return (
                <div key={q.id} className="border border-[#E5E5E5] rounded-xl overflow-hidden">
                  <div
                    onClick={() => setExpandedQIndex(isExpanded ? null : idx)}
                    className="p-4 bg-[#FAFAFA] flex items-center justify-between cursor-pointer hover:bg-gray-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#111111] text-white font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#111111] truncate max-w-md">{q.questionText}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {evalObj && (
                        <span className="text-xs font-mono font-bold text-[#2563EB] bg-white px-2.5 py-1 rounded-lg border border-[#E5E5E5]">
                          {Math.round(evalObj.overallScore)}/100
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 space-y-3 bg-white text-xs border-t border-[#E5E5E5]">
                      <div>
                        <span className="font-mono font-bold text-[#111111] uppercase tracking-wider text-[10px]">Candidate Answer:</span>
                        <p className="mt-1 text-[#111111] bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E5E5] italic">
                          "{q.answer?.answerText || 'No answer submitted.'}"
                        </p>
                      </div>

                      {evalObj && (
                        <div className="space-y-2 pt-1">
                          <span className="font-mono font-bold text-[#2563EB] uppercase tracking-wider text-[10px]">AI Feedback & Rubric:</span>
                          <p className="text-[#666666] leading-relaxed bg-[#FAFAFA] p-3 rounded-lg border border-[#E5E5E5]">
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
