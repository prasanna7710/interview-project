import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Code, Sparkles, Clock, FileCode, CheckCircle2, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';

export const CodingSetupPage: React.FC = () => {
  const [language, setLanguage] = useState('Python');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [candidateSkills, setCandidateSkills] = useState<string[]>([]);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkResume() {
      try {
        const res = await api.get('/resumes');
        if (res.data.resumes && res.data.resumes.length > 0) {
          setHasResume(true);
          const latest = res.data.resumes[0];
          if (latest.skills) {
            setCandidateSkills(latest.skills.map((s: any) => s.name || s));
          }
        }
      } catch (e) {}
    }
    checkResume();
  }, []);

  const handleStartTest = async () => {
    setIsInitializing(true);
    try {
      const res = await api.post('/coding/setup', {
        language,
        difficulty,
        questionCount,
        durationMinutes,
      });

      const testId = res.data.test.id;
      showToast('Coding Test initialized successfully!', 'success');
      navigate(`/coding/test/${testId}`);
    } catch (err: any) {
      console.error('Failed to setup coding test:', err);
      showToast('Failed to initialize coding test.', 'error');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <AppLayout title="Optional Coding Test" subtitle="Practice algorithmic coding challenges & test your skills in a secure environment">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Feature Banner */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Optional Algorithmic Coding Module</h2>
              <p className="text-xs text-gray-600">
                Sharpen your programming skills with language-specific challenges, test cases evaluation, and AI performance analysis.
              </p>
            </div>
          </div>

          {/* Resume Personalization Banner */}
          {hasResume ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-50/70 border border-brand-100 text-xs text-brand-800 font-medium">
              <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>
                <strong>Resume Detected:</strong> Questions will be customized around your candidate background ({candidateSkills.slice(0, 4).join(', ') || 'Technical Background'}).
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-gray-400" />
                Upload your resume to receive personalized coding questions tailored to your experience.
              </span>
              <button
                type="button"
                onClick={() => navigate('/resume')}
                className="text-brand-600 hover:text-brand-700 font-bold underline text-xs"
              >
                Upload Resume
              </button>
            </div>
          )}
        </div>

        {/* Setup Options Grid */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
          {/* 1. Language Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-900">Select Programming Language</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {['Python', 'Java', 'JavaScript', 'C', 'C++'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`p-3.5 rounded-xl border text-sm font-semibold transition flex flex-col items-center gap-1 ${
                    language === lang
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <FileCode className="w-5 h-5 text-brand-600" />
                  <span>{lang}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Difficulty Level */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-900">Select Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`p-3.5 rounded-xl border text-sm font-semibold transition text-center ${
                    difficulty === diff
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Number of Questions & Test Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">Number of Questions</label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition text-center ${
                      questionCount === cnt
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">Test Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {[15, 30, 45].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationMinutes(dur)}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
                      durationMinutes === dur
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>{dur} Min</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleStartTest}
              disabled={isInitializing}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-3.5 rounded-xl shadow-sm transition text-base"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Preparing Test Environment...
                </>
              ) : (
                <>
                  Start Coding Test <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
