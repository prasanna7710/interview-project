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
  Volume2,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Clock,
  Loader2,
  AlertCircle,
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
    speak,
    pause: pauseTts,
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
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
        <p className="text-xs text-[#666666] font-mono">Loading interview environment...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between select-none text-[#111111] font-sans">
      
      {/* Top Interview Header */}
      <header className="bg-white border-b border-[#E5E5E5] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="h-4 w-px bg-[#E5E5E5] hidden sm:block" />
          <div className="hidden sm:block">
            <h2 className="text-xs font-bold text-[#111111]">{interview.title}</h2>
            <p className="text-[11px] text-[#666666] font-mono">
              {interview.difficulty} • {interview.mode}
            </p>
          </div>
        </div>

        {/* Progress & Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[#111111]">
            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{formatTime(timerSec)}</span>
          </div>

          <button
            onClick={handleCompleteInterview}
            disabled={isEnding}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" /> End Interview
          </button>
        </div>
      </header>

      {/* Main Content Card Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Question Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#111111]">
            <span className="flex items-center gap-1.5 font-mono">
              Question {currentIndex + 1} of {questions.length}
              {currentQ?.isFollowUp && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold">
                  AI Follow-Up
                </span>
              )}
            </span>
            <span className="text-[#2563EB] font-mono">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* AI Interviewer Question Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                AI
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#111111]">AI Technical Interviewer</h3>
                <p className="text-[11px] text-[#2563EB] font-medium">{currentQ?.category || interview.type}</p>
              </div>
            </div>

            {/* TTS Controls */}
            <div className="flex items-center gap-1.5 bg-[#F5F5F5] p-1 rounded-lg border border-[#E5E5E5] text-xs">
              <button
                onClick={handleRepeatQuestion}
                title="Replay Question"
                className="p-1 text-[#666666] hover:text-[#111111] rounded hover:bg-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {isTtsPlaying ? (
                <button
                  onClick={pauseTts}
                  title="Pause Speech"
                  className="p-1 text-[#2563EB] rounded bg-white shadow-2xs"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleRepeatQuestion}
                  title="Play Question"
                  className="p-1 text-[#666666] hover:text-[#111111] rounded hover:bg-white transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#FAFAFA] p-5 rounded-xl border border-[#E5E5E5] space-y-2">
            <p className="text-base sm:text-lg font-semibold text-[#111111] leading-relaxed">
              "{currentQ?.questionText}"
            </p>
          </div>
        </div>

        {/* Answer Area Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider font-mono">Your Response</label>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                sttStatus === 'listening'
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#F5F5F5] hover:bg-gray-100 text-[#111111] border border-[#E5E5E5]'
              }`}
            >
              {sttStatus === 'listening' ? (
                <>
                  <Mic className="w-3.5 h-3.5 animate-bounce" /> Recording... (Click to Stop)
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#2563EB]" /> 🎤 Start Speaking
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
            className="w-full p-4 rounded-xl border border-[#E5E5E5] text-xs outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] leading-relaxed font-sans"
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="text-xs font-semibold text-[#666666] hover:text-[#111111] disabled:opacity-30"
            >
              ← Previous Question
            </button>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black disabled:bg-gray-400 text-white font-medium px-5 py-2.5 rounded-xl shadow-2xs text-xs transition-all active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answer...
                </>
              ) : (
                <>
                  Submit Answer & Next <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};
