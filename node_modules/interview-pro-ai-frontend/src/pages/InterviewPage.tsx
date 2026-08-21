import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Interview, InterviewQuestion } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { Logo } from '../components/common/Logo';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  HelpCircle,
  XCircle,
} from 'lucide-react';

export const InterviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  // Web Speech STT Hook
  const {
    isSupported: isSttSupported,
    status: sttStatus,
    transcript,
    errorMessage: sttErrorMsg,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Web Speech TTS Hook
  const {
    isSupported: isTtsSupported,
    isPlaying: isTtsPlaying,
    isPaused: isTtsPaused,
    speak,
    pause: pauseTts,
    resume: resumeTts,
    stop: stopTts,
  } = useSpeechSynthesis();

  // Load interview data
  useEffect(() => {
    async function loadInterview() {
      try {
        const res = await api.get(`/interviews/${id}`);
        setInterview(res.data.interview);
        const qList = res.data.interview.questions || [];
        setQuestions(qList);

        // Resume at first unanswered question
        const firstUnanswered = qList.findIndex((q: any) => !q.answer);
        if (firstUnanswered !== -1) {
          setCurrentIndex(firstUnanswered);
        }
      } catch (err) {
        showToast('Failed to load interview session.', 'error');
      }
    }
    if (id) loadInterview();
  }, [id]);

  // General Interview Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update answer text when Web Speech STT transcript arrives
  useEffect(() => {
    if (transcript) {
      setAnswerText(transcript);
    }
  }, [transcript]);

  // Read question automatically on index change
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (currentQ?.questionText && isTtsSupported) {
      speak(currentQ.questionText);
    }
    resetTranscript();
    setAnswerText(currentQ?.answer?.answerText || '');
  }, [currentIndex, questions]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleVoiceRecord = () => {
    if (sttStatus === 'listening') {
      stopListening();
    } else {
      stopTts(); // Pause AI voice if reading
      startListening();
    }
  };

  const handleRepeatQuestion = () => {
    const currentQ = questions[currentIndex];
    if (currentQ?.questionText) {
      speak(currentQ.questionText);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText || !answerText.trim()) {
      showToast('Please type or speak your answer before proceeding.', 'warning');
      return;
    }

    const currentQ = questions[currentIndex];
    setIsSubmitting(true);
    stopListening();
    stopTts();

    try {
      const res = await api.post(`/interviews/${id}/submit-answer`, {
        questionId: currentQ.id,
        answerText: answerText.trim(),
        inputMethod: sttStatus === 'listening' || transcript ? 'voice' : 'text',
        durationSec: 30,
      });

      showToast('Answer evaluated!', 'success');

      // Update question list locally if a follow-up was generated
      if (res.data.followUpQuestion) {
        setQuestions((prev) => {
          const updated = [...prev];
          updated.splice(currentIndex + 1, 0, res.data.followUpQuestion);
          return updated;
        });
        showToast('AI Interviewer asked a follow-up question!', 'info');
      }

      // Advance to next question or complete
      if (currentIndex < questions.length - 1 || res.data.followUpQuestion) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        handleCompleteInterview();
      }
    } catch (err: any) {
      showToast('Failed to submit answer.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    setIsEnding(true);
    stopListening();
    stopTts();

    try {
      await api.post(`/interviews/${id}/complete`, {
        totalDurationSec: timerSec,
      });
      showToast('Interview session completed!', 'success');
      navigate(`/interviews/${id}/results`);
    } catch (err) {
      showToast('Failed to finalize interview session.', 'error');
    } finally {
      setIsEnding(false);
    }
  };

  if (!interview || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading interview environment...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col justify-between select-none">
      {/* Top Interview Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-gray-900">{interview.title}</h2>
            <p className="text-[11px] text-gray-500">
              {interview.difficulty} • {interview.mode}
            </p>
          </div>
        </div>

        {/* Progress & Timer */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            <span>{formatTime(timerSec)}</span>
          </div>

          <button
            onClick={handleCompleteInterview}
            disabled={isEnding}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200/80 px-3.5 py-1.5 rounded-xl transition"
          >
            <XCircle className="w-3.5 h-3.5" /> End Interview
          </button>
        </div>
      </header>

      {/* Main Content Card Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Question Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1.5">
              Question {currentIndex + 1} of {questions.length}
              {currentQ?.isFollowUp && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                  AI Follow-Up
                </span>
              )}
            </span>
            <span className="text-brand-600">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* AI Interviewer Question Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-card space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                AI
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">AI Technical Interviewer</h3>
                <p className="text-xs text-brand-600 font-medium">{currentQ?.category || interview.type}</p>
              </div>
            </div>

            {/* TTS Controls */}
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 text-xs">
              <button
                onClick={handleRepeatQuestion}
                title="Replay Question"
                className="p-1.5 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-white transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {isTtsPlaying ? (
                <button
                  onClick={pauseTts}
                  title="Pause Speech"
                  className="p-1.5 text-brand-600 rounded-lg bg-white shadow-xs"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleRepeatQuestion}
                  title="Play Question"
                  className="p-1.5 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-white transition"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-brand-50/50 p-5 rounded-xl border border-brand-100 space-y-2">
            <p className="text-base sm:text-lg font-semibold text-gray-900 leading-relaxed">
              "{currentQ?.questionText}"
            </p>
          </div>
        </div>

        {/* Answer Area Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Your Response</label>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                sttStatus === 'listening'
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200'
              }`}
            >
              {sttStatus === 'listening' ? (
                <>
                  <Mic className="w-4 h-4 animate-bounce" /> Recording... (Click to Stop)
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" /> 🎤 Start Speaking
                </>
              )}
            </button>
          </div>

          {/* Browser STT warning if unsupported */}
          {!isSttSupported && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Voice input is not supported in this browser. Please use Chrome/Edge or type your answer below.</span>
            </div>
          )}

          {/* Live Transcript / Error message */}
          {sttErrorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {sttErrorMsg}
            </div>
          )}

          {/* Response Textarea */}
          <textarea
            rows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your response here or click '🎤 Start Speaking' to use Web Speech recognition..."
            className="w-full p-4 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 leading-relaxed font-sans"
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-30"
            >
              ← Previous Question
            </button>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold px-6 py-3 rounded-xl shadow-sm text-sm transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answer...
                </>
              ) : (
                <>
                  Submit Answer & Next <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
